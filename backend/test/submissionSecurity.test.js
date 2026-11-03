const test = require("node:test");
const assert = require("node:assert/strict");
const Bounty = require("../modules/bounty.module");
const Enrollment = require("../modules/enrollment.module");
const Submission = require("../modules/submission.module");
const cloudinary = require("../config/cloudinary");
const { submit } = require("../controller/submission.controller");
const { requestSchemas } = require("../middleware/requestSchemas");

const bountyId = "507f1f77bcf86cd799439011";
const authenticatedWallet = "0x1111111111111111111111111111111111111111";
const spoofedWallet = "0x2222222222222222222222222222222222222222";

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const mockSubmissionDependencies = (t, { enrolled = true } = {}) => {
  const originals = {
    bountyFindById: Bounty.findById,
    bountyFindOneAndUpdate: Bounty.findOneAndUpdate,
    bountyUpdateOne: Bounty.updateOne,
    enrollmentFindOne: Enrollment.findOne,
    submissionFindOne: Submission.findOne,
    submissionCreate: Submission.create,
    cloudinaryUploadStream: cloudinary.uploader.upload_stream,
    cloudinaryDestroy: cloudinary.uploader.destroy,
  };
  const bounty = {
    _id: bountyId,
    title: "Test bounty",
    archivedAt: null,
    lifecycleStatus: null,
    startDate: new Date(Date.now() - 60_000),
    deadline: new Date(Date.now() + 60_000),
    submissions: { count: 0, maxSubmissions: 10 },
  };
  let enrollmentQuery;
  let submissionData;
  let capacityReserved = false;
  let capacityRolledBack = false;

  Bounty.findById = async () => bounty;
  Bounty.findOneAndUpdate = async () => {
    capacityReserved = true;
    return bounty;
  };
  Bounty.updateOne = async () => {
    capacityRolledBack = true;
    return { modifiedCount: 1 };
  };
  Enrollment.findOne = async (query) => {
    enrollmentQuery = query;
    return enrolled ? { status: "enrolled" } : null;
  };
  Submission.findOne = async () => null;
  Submission.create = async (data) => {
    submissionData = data;
    return { _id: "submission-id" };
  };

  t.after(() => {
    Bounty.findById = originals.bountyFindById;
    Bounty.findOneAndUpdate = originals.bountyFindOneAndUpdate;
    Bounty.updateOne = originals.bountyUpdateOne;
    Enrollment.findOne = originals.enrollmentFindOne;
    Submission.findOne = originals.submissionFindOne;
    Submission.create = originals.submissionCreate;
    cloudinary.uploader.upload_stream = originals.cloudinaryUploadStream;
    cloudinary.uploader.destroy = originals.cloudinaryDestroy;
  });

  return {
    getEnrollmentQuery: () => enrollmentQuery,
    getSubmissionData: () => submissionData,
    wasCapacityReserved: () => capacityReserved,
    wasCapacityRolledBack: () => capacityRolledBack,
  };
};

const submissionRequest = (overrides = {}) => ({
  requestId: "test-request",
  auth: { walletAddress: authenticatedWallet },
  body: {
    bountyId,
    user: spoofedWallet,
    description: "Completed work",
    projectLink: "https://example.test/work",
  },
  ...overrides,
});

test("submission requires an enrollment before reserving bounty capacity", async (t) => {
  const dependencies = mockSubmissionDependencies(t, { enrolled: false });
  const response = createResponse();

  await submit(submissionRequest(), response);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.code, "ENROLLMENT_REQUIRED");
  assert.equal(dependencies.wasCapacityReserved(), false);
  assert.equal(dependencies.getSubmissionData(), undefined);
  assert.deepEqual(dependencies.getEnrollmentQuery(), {
    bountyId,
    user: authenticatedWallet,
  });
});

test("submission ownership comes from the authenticated wallet", async (t) => {
  const dependencies = mockSubmissionDependencies(t);
  const response = createResponse();

  await submit(submissionRequest(), response);

  assert.equal(response.statusCode, 201);
  assert.equal(dependencies.getSubmissionData().user, authenticatedWallet);
  assert.notEqual(dependencies.getSubmissionData().user, spoofedWallet);
  assert.equal(dependencies.getSubmissionData().image, "");
});

test("submission request links reject unsafe schemes and embedded credentials", () => {
  const base = {
    bountyId,
    description: "Completed work",
    projectLink: "https://example.test/work",
  };
  assert.equal(requestSchemas.submissionBody.safeParse(base).success, true);
  assert.equal(
    requestSchemas.submissionBody.safeParse({
      ...base,
      projectLink: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.submissionBody.safeParse({
      ...base,
      projectLink: "https://trusted.test@attacker.test/",
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.submissionBody.safeParse({
      ...base,
      user: spoofedWallet,
    }).success,
    false,
  );
  assert.equal(
    requestSchemas.submissionBody.safeParse({
      ...base,
      description: "x".repeat(5001),
    }).success,
    false,
  );
});

test("submission image IDs are random and independent of client filenames", async (t) => {
  const dependencies = mockSubmissionDependencies(t);
  let uploadOptions;
  cloudinary.uploader.upload_stream = (options, callback) => {
    uploadOptions = options;
    return {
      on() {
        return this;
      },
      end() {
        callback(null, {
          secure_url:
            "https://res.cloudinary.com/example/image/upload/v1/bounty_submissions/submission.webp",
          public_id: `bounty_submissions/${options.public_id}`,
        });
      },
    };
  };
  const response = createResponse();

  await submit(
    submissionRequest({
      file: { originalname: "../../attacker-controlled-name.png" },
      validatedSubmissionImage: Buffer.from("validated webp bytes"),
    }),
    response,
  );

  assert.equal(response.statusCode, 201);
  assert.equal(uploadOptions.folder, "bounty_submissions");
  assert.match(uploadOptions.public_id, /^submission_[0-9a-f-]{36}$/);
  assert.equal(uploadOptions.use_filename, false);
  assert.equal(uploadOptions.overwrite, false);
  assert.equal(
    dependencies.getSubmissionData().imagePublicId,
    `bounty_submissions/${uploadOptions.public_id}`,
  );
});

test("failed submission persistence deletes the uploaded image and releases capacity", async (t) => {
  const dependencies = mockSubmissionDependencies(t);
  const originalCreate = Submission.create;
  const originalError = console.error;
  let uploadedPublicId;
  let deletedPublicId;
  Submission.create = async () => {
    throw new Error("database write failed");
  };
  cloudinary.uploader.upload_stream = (options, callback) => ({
    on() {
      return this;
    },
    end() {
      uploadedPublicId = `bounty_submissions/${options.public_id}`;
      callback(null, {
        secure_url:
          "https://res.cloudinary.com/example/image/upload/v1/submission.webp",
        public_id: uploadedPublicId,
      });
    },
  });
  cloudinary.uploader.destroy = async (publicId) => {
    deletedPublicId = publicId;
    return { result: "ok" };
  };
  console.error = () => {};
  t.after(() => {
    Submission.create = originalCreate;
    console.error = originalError;
  });

  const response = createResponse();
  await submit(
    submissionRequest({
      validatedSubmissionImage: Buffer.from("validated webp bytes"),
    }),
    response,
  );

  assert.equal(response.statusCode, 500);
  assert.equal(deletedPublicId, uploadedPublicId);
  assert.equal(dependencies.wasCapacityRolledBack(), true);
});

test("ambiguous persistence failures preserve a committed submission and its image", async (t) => {
  const dependencies = mockSubmissionDependencies(t);
  let uploadedPublicId;
  const deletedPublicIds = [];
  let createdData;
  Submission.create = async (data) => {
    createdData = data;
    throw new Error("database response was lost after commit");
  };
  Submission.findOne = async (filter) =>
    filter.submittedAt
      ? {
          _id: "submission-id",
          image: createdData.image,
          imagePublicId: createdData.imagePublicId,
          submittedAt: createdData.submittedAt,
        }
      : null;
  cloudinary.uploader.upload_stream = (options, callback) => ({
    on() {
      return this;
    },
    end() {
      uploadedPublicId = `bounty_submissions/${options.public_id}`;
      callback(null, {
        secure_url:
          "https://res.cloudinary.com/example/image/upload/v1/submission.webp",
        public_id: uploadedPublicId,
      });
    },
  });
  cloudinary.uploader.destroy = async (publicId) => {
    deletedPublicIds.push(publicId);
    return { result: "ok" };
  };

  const response = createResponse();
  await submit(
    submissionRequest({
      validatedSubmissionImage: Buffer.from("validated webp bytes"),
    }),
    response,
  );

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.imageUrl, createdData.image);
  assert.equal(createdData.imagePublicId, uploadedPublicId);
  assert.deepEqual(deletedPublicIds, []);
  assert.equal(dependencies.wasCapacityRolledBack(), false);
});

test("Cloudinary upload failures clean up the generated ID and do not persist a submission", async (t) => {
  const dependencies = mockSubmissionDependencies(t);
  let generatedPublicId;
  const deletedPublicIds = [];
  cloudinary.uploader.upload_stream = (options, callback) => ({
    on() {
      return this;
    },
    end() {
      generatedPublicId = `bounty_submissions/${options.public_id}`;
      callback(new Error("provider details must not reach clients"));
    },
  });
  cloudinary.uploader.destroy = async (publicId) => {
    deletedPublicIds.push(publicId);
    return { result: "ok" };
  };

  const response = createResponse();
  await submit(
    submissionRequest({
      validatedSubmissionImage: Buffer.from("validated webp bytes"),
    }),
    response,
  );

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.code, "IMAGE_UPLOAD_UNAVAILABLE");
  assert.equal(JSON.stringify(response.body).includes("provider details"), false);
  assert.ok(deletedPublicIds.includes(generatedPublicId));
  assert.equal(dependencies.getSubmissionData(), undefined);
  assert.equal(dependencies.wasCapacityRolledBack(), true);
});
