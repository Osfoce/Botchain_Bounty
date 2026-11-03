require("dotenv").config();

const mongoose = require("mongoose");
mongoose.set("autoIndex", false);

const { connectDB, disconnectDB } = require("../config/db");
const {
  getSafeErrorCode,
  logRequestError,
  logSecurityEvent,
} = require("../utils/requestLogger");
const DistributionSync = require("../modules/distributionSync.module");
const ClaimSync = require("../modules/claimSync.module");
const Reward = require("../modules/reward.module");

const indexDefinitions = [
  {
    model: DistributionSync,
    name: "distribution event identity",
    fields: {
      chainId: "$chainId",
      bountyContract: { $toLower: "$bountyContract" },
      transactionHash: { $toLower: "$transactionHash" },
      logIndex: "$logIndex",
    },
  },
  {
    model: DistributionSync,
    name: "single distribution per bounty",
    fields: {
      chainId: "$chainId",
      bountyContract: { $toLower: "$bountyContract" },
      blockchainId: "$blockchainId",
    },
  },
  {
    model: Reward,
    name: "single reward per bounty and winner",
    fields: {
      bountyId: "$bountyId",
      winnerAddress: { $toLower: "$winnerAddress" },
    },
  },
  {
    model: Reward,
    name: "claim event identity",
    match: {
      claimTxHash: { $type: "string" },
      claimLogIndex: { $type: "number" },
    },
    fields: {
      chainId: "$chainId",
      bountyContract: { $toLower: "$bountyContract" },
      claimTxHash: { $toLower: "$claimTxHash" },
      claimLogIndex: "$claimLogIndex",
    },
  },
  {
    model: ClaimSync,
    name: "claim event identity",
    fields: {
      chainId: "$chainId",
      bountyContract: { $toLower: "$bountyContract" },
      transactionHash: { $toLower: "$transactionHash" },
      logIndex: "$logIndex",
    },
  },
  {
    model: ClaimSync,
    name: "single claim per reward",
    fields: { rewardId: "$rewardId" },
  },
];

const findDuplicateGroups = async (definition) => {
  const pipeline = [];
  if (definition.match) pipeline.push({ $match: definition.match });
  pipeline.push(
    {
      $group: {
        _id: definition.fields,
        count: { $sum: 1 },
        recordIds: { $push: "$_id" },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $limit: 100 },
  );
  return definition.model.aggregate(pipeline);
};

const ensureFinancialIndexes = async ({
  definitions = indexDefinitions,
  models = [DistributionSync, Reward, ClaimSync],
} = {}) => {
  const duplicateReports = [];
  for (const definition of definitions) {
    const duplicates = await findDuplicateGroups(definition);
    if (duplicates.length) {
      duplicateReports.push({
        collection: definition.model.collection.name,
        index: definition.name,
        duplicates,
      });
    }
  }
  if (duplicateReports.length) {
    return { created: false, duplicateReports };
  }

  for (const model of models) {
    await model.createIndexes();
  }
  return { created: true, duplicateReports: [] };
};

if (require.main === module) {
  connectDB()
    .then(() => ensureFinancialIndexes())
    .then((result) => {
      if (!result.created) {
        logSecurityEvent({
          event: "financial_index_migration_blocked",
          severity: "critical",
          outcome: "failure",
          count: result.duplicateReports.length,
          errorCode: "DUPLICATE_RECORDS",
        });
        for (const report of result.duplicateReports) {
          logSecurityEvent({
            event: "financial_index_duplicate_report",
            severity: "error",
            outcome: "failure",
            resourceId: report.collection,
            count: report.duplicates.length,
            errorCode: "DUPLICATE_RECORDS",
          });
        }
        process.exitCode = 1;
        return;
      }
      logSecurityEvent({
        event: "financial_indexes_verified",
        severity: "info",
        outcome: "success",
      });
    })
    .catch((error) => {
      logRequestError(
        null,
        "financial_index_migration_failed",
        error,
        "critical",
        {
          errorCode: getSafeErrorCode(error, "INDEX_MIGRATION_FAILED"),
        },
      );
      process.exitCode = 1;
    })
    .finally(() => disconnectDB());
}

module.exports = { ensureFinancialIndexes, findDuplicateGroups };
