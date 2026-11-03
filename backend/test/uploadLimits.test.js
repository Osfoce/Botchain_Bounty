const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const sharp = require("sharp");
const { upload } = require("../middleware/upload");
const {
  errorHandler,
  requestId,
} = require("../middleware/requestSecurity");
const { prepareSubmissionImage } = require("../services/submissionImage.service");
const submissionRoute = require("../routes/submission.route");

const startUploadApp = async (t) => {
  const app = express();
  app.use(requestId);
  app.post(
    "/upload",
    upload.single("image"),
    prepareSubmissionImage,
    async (req, res) => {
      const metadata = req.validatedSubmissionImage
        ? await sharp(req.validatedSubmissionImage).metadata()
        : null;
      res.status(200).json({
        format: metadata?.format || null,
        hasTemporaryPath: Boolean(req.file?.path),
      });
    },
  );
  app.use(errorHandler);

  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/upload`;
};

const uploadFile = async (url, file, filename) => {
  const form = new FormData();
  form.append("image", file, filename);
  return fetch(url, { method: "POST", body: form });
};

test("submission upload rejects unsupported MIME types before storage", async (t) => {
  const url = await startUploadApp(t);
  const response = await uploadFile(
    url,
    new Blob(["not an image"], { type: "text/plain" }),
    "file.txt",
  );

  assert.equal(response.status, 415);
  assert.equal((await response.json()).code, "UNSUPPORTED_MEDIA_TYPE");
});

test("unauthenticated requests are rejected before multipart upload processing", async (t) => {
  const app = express();
  app.use(requestId);
  app.use("/api", submissionRoute);
  app.use(errorHandler);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const form = new FormData();
  form.append("bountyId", "507f1f77bcf86cd799439011");
  form.append("description", "A valid work description");
  form.append("projectLink", "https://example.test/work");
  form.append("image", new Blob(["not an image"], { type: "image/png" }), "fake.png");
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/bounty/submit`,
    { method: "POST", body: form },
  );

  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "Authentication required");
});

test("submission upload rejects oversized files", async (t) => {
  const url = await startUploadApp(t);
  const response = await uploadFile(
    url,
    new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }),
    "large.png",
  );

  assert.equal(response.status, 413);
  assert.equal((await response.json()).code, "PAYLOAD_TOO_LARGE");
});

test("submission upload rejects additional files in the same request", async (t) => {
  const url = await startUploadApp(t);
  const form = new FormData();
  const png = new Blob(["not a PNG"], { type: "image/png" });
  form.append("image", png, "first.png");
  form.append("image", png, "second.png");

  const response = await fetch(url, { method: "POST", body: form });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_REQUEST");
});

test("submission upload rejects spoofed MIME, unsupported extensions, empty and malformed files", async (t) => {
  const url = await startUploadApp(t);
  const spoofedMime = await uploadFile(
    url,
    new Blob(["not a PNG"], { type: "image/png" }),
    "spoofed.png",
  );
  const unsupportedExtension = await uploadFile(
    url,
    new Blob(["file"], { type: "image/png" }),
    "payload.svg",
  );
  const emptyImage = await uploadFile(
    url,
    new Blob([], { type: "image/png" }),
    "empty.png",
  );
  const malformedImage = await uploadFile(
    url,
    new Blob(["broken image bytes"], { type: "image/png" }),
    "broken.png",
  );

  assert.equal(spoofedMime.status, 400);
  assert.equal((await spoofedMime.json()).code, "INVALID_IMAGE");
  assert.equal(unsupportedExtension.status, 415);
  assert.equal((await unsupportedExtension.json()).code, "UNSUPPORTED_MEDIA_TYPE");
  assert.equal(emptyImage.status, 400);
  assert.equal((await emptyImage.json()).code, "INVALID_IMAGE");
  assert.equal(malformedImage.status, 400);
  assert.equal((await malformedImage.json()).code, "INVALID_IMAGE");
});

test("valid image uploads are decoded and re-encoded as WebP in memory", async (t) => {
  const url = await startUploadApp(t);
  const png = await sharp({
    create: {
      width: 4,
      height: 3,
      channels: 3,
      background: { r: 24, g: 96, b: 72 },
    },
  })
    .png()
    .toBuffer();
  const response = await uploadFile(
    url,
    new Blob([png], { type: "image/png" }),
    "../../untrusted filename.png",
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.format, "webp");
  assert.equal(payload.hasTemporaryPath, false);
});

test("submission upload rejects dimensions beyond the decoder limits", async (t) => {
  const url = await startUploadApp(t);
  const oversizedDimensions = await sharp({
    create: {
      width: 10_001,
      height: 1,
      channels: 3,
      background: { r: 24, g: 96, b: 72 },
    },
  })
    .png()
    .toBuffer();
  const response = await uploadFile(
    url,
    new Blob([oversizedDimensions], { type: "image/png" }),
    "wide.png",
  );

  assert.equal(response.status, 413);
  assert.equal((await response.json()).code, "IMAGE_DIMENSIONS_TOO_LARGE");
});
