const { z } = require("zod");
const { logSecurityEvent } = require("../utils/requestLogger");

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/);
const wallet = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const transactionHash = z.string().regex(/^0x[a-fA-F0-9]{64}$/);
const chainId = z.union([
  z.number().int().positive().safe(),
  z.string()
    .regex(/^[1-9]\d{0,14}$/)
    .refine((value) => Number.isSafeInteger(Number(value))),
]);
const blockchainId = z.union([
  z.number().int().nonnegative().safe(),
  z
    .string()
    .regex(/^\d{1,16}$/)
    .refine((value) => Number.isSafeInteger(Number(value))),
]);
const positiveBlockchainId = z.union([
  z.number().int().positive().safe(),
  z
    .string()
    .regex(/^[1-9]\d{0,15}$/)
    .refine((value) => Number.isSafeInteger(Number(value))),
]);
const pagination = {
  page: z
    .string()
    .regex(/^[1-9]\d{0,4}$/)
    .refine((value) => Number(value) <= 10_000)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d{0,2}$/)
    .refine((value) => Number(value) <= 100)
    .optional(),
};
const amount = z.union([
  z
    .string()
    .max(80)
    .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0),
  z.number().finite().positive(),
]);
const date = z.string().max(40).refine((value) => {
  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
  const parsedDate = new Date(`${datePart}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime())) return false;
  if (parsedDate.toISOString().slice(0, 10) !== datePart) return false;
  if (
    value !== datePart &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
      value,
    )
  ) {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
});

const isSafeHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

const httpUrl = z
  .string()
  .max(2048)
  .refine((value) => value === "" || isSafeHttpUrl(value));

const requestSchemas = {
  authNonce: z
    .object({
      address: wallet,
      chainId,
    })
    .strict(),
  authVerify: z
    .object({
      message: z.string().min(1).max(4096),
      signature: z.string().regex(/^0x[a-fA-F0-9]+$/).max(4096),
    })
    .strict(),
  emptyBody: z.object({}).strict().optional(),
  dataDeletionUpdate: z
    .object({
      status: z.enum(["reviewing", "completed", "rejected"]),
      resolution: z.string().trim().min(1).max(2000).optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.status === "reviewing" || Boolean(value.resolution),
      { path: ["resolution"], message: "A resolution is required" },
    ),
  transactionBody: z
    .object({
      txHash: transactionHash,
      blockchainId: positiveBlockchainId,
      chainId,
    })
    .strict(),
  claimBody: z.object({ txHash: transactionHash }).strict(),
  bountyCreate: z
    .object({
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(20000),
      category: z.string().trim().min(1).max(80),
      tags: z.array(z.string().trim().min(1).max(32)).max(5),
      startDate: date,
      deadline: date,
      originLink: httpUrl,
      network: chainId,
      reward: amount,
      token: z.string().trim().min(1).max(32),
      winnersAllowed: z.number().int().min(1).max(5),
      payoutType: z.enum(["SINGLE", "MULTI_EQUAL", "MULTI_PERCENTAGE"]),
      percentages: z.array(z.number().int().min(1).max(100)).max(5),
      creator: wallet.optional(),
      blockchainId: blockchainId.optional(),
      txHash: transactionHash.optional(),
      isOnChain: z.boolean().optional(),
      bountyContract: wallet.optional(),
    })
    .strict()
    .superRefine((value, context) => {
      if (new Date(value.deadline) <= new Date(value.startDate)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadline"],
          message: "Deadline must be after the start date",
        });
      }

      const tags = value.tags.map((tag) => tag.toLowerCase());
      if (new Set(tags).size !== tags.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tags"],
          message: "Tags must be unique",
        });
      }

      if (
        (value.payoutType === "SINGLE" &&
          (value.winnersAllowed !== 1 || value.percentages.length !== 0)) ||
        (value.payoutType === "MULTI_EQUAL" &&
          (value.winnersAllowed < 2 || value.percentages.length !== 0)) ||
        (value.payoutType === "MULTI_PERCENTAGE" &&
          (value.winnersAllowed !== value.percentages.length ||
            value.percentages.reduce((sum, percentage) => sum + percentage, 0) !==
              100))
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["payoutType"],
          message: "Payout type, winners, and percentages do not match",
        });
      }
    }),
  bountyUpdate: z
    .object({
      title: z.string().trim().min(1).max(160).optional(),
      description: z.string().trim().min(1).max(20000).optional(),
      originLink: httpUrl.optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0),
  bountyListQuery: z
    .object({
      ...pagination,
      category: z.string().max(80).optional(),
      tags: z
        .string()
        .max(200)
        .refine((value) => {
          const tags = value.split(",").map((tag) => tag.trim().toLowerCase());
          return (
            tags.length <= 5 &&
            tags.every((tag) => tag.length > 0 && tag.length <= 32) &&
            new Set(tags).size === tags.length
          );
        })
        .optional(),
      status: z
        .enum(["all", "active", "upcoming", "ended", "completed", "cancelled"])
        .optional(),
      sort: z
        .enum([
          "newest",
          "oldest",
          "reward",
          "deadline",
          "popular",
          "-reward",
          "-deadline",
          "-createdAt",
          "-winnersAllowed",
          "createdAt",
          "winnersAllowed",
        ])
        .optional(),
    })
    .strict(),
  idParams: z.object({ id: objectId }).strict(),
  bountyIdParams: z.object({ bountyId: objectId }).strict(),
  walletParams: z.object({ wallet }).strict(),
  userAddressParams: z
    .object({ id: objectId, userAddress: wallet })
    .strict(),
  enrollmentBody: z.object({ bountyId: objectId }).strict(),
  commentBody: z
    .object({ text: z.string().trim().min(1).max(2000) })
    .strict(),
  submissionBody: z
    .object({
      bountyId: objectId,
      description: z.string().trim().min(1).max(5000),
      projectLink: z
        .string()
        .url()
        .max(2048)
        .refine(isSafeHttpUrl),
    })
    .strict(),
  privateListQuery: z
    .object({
      ...pagination,
      bountyId: objectId.optional(),
    })
    .strict(),
  paginationQuery: z.object(pagination).strict(),
  analyticsParams: z
    .object({ role: z.enum(["creator", "contributor"]), wallet })
    .strict(),
};

const validateRequest = (schemas) => (req, res, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      logSecurityEvent({
        req,
        event: "request_validation_failed",
        severity: "warn",
        outcome: "blocked",
        errorCode: "INVALID_REQUEST",
      });
      return res.status(400).json({
        code: "INVALID_REQUEST",
        error: "Request validation failed.",
        fields: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          reason: issue.code,
        })),
      });
    }
  }
  next();
};

module.exports = { requestSchemas, validateRequest };
