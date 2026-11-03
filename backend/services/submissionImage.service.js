const { randomUUID } = require("node:crypto");
const path = require("node:path");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");
const { logRequestError } = require("../utils/requestLogger");
const { recordSecurityAudit } = require("./securityAudit.service");

const CLOUDINARY_FOLDER = "bounty_submissions";
const MAX_IMAGE_PIXELS = 20_000_000;
const MAX_IMAGE_DIMENSION = 10_000;
const MAX_OUTPUT_DIMENSION = 2048;
const FORMAT_BY_MIME = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};
const FORMAT_BY_EXTENSION = {
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
  ".webp": "webp",
};

const respondWithImageError = (req, res, status, code, error) =>
  res.status(status).json({
    code,
    error,
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });

const prepareSubmissionImage = async (req, res, next) => {
  if (!req.file) return next();

  const { buffer, mimetype, originalname } = req.file;
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return respondWithImageError(
      req,
      res,
      400,
      "INVALID_IMAGE",
      "Uploaded file is not a valid supported image.",
    );
  }

  const mimeFormat = FORMAT_BY_MIME[mimetype];
  const extensionFormat =
    FORMAT_BY_EXTENSION[path.extname(originalname || "").toLowerCase()];
  if (!mimeFormat || !extensionFormat || mimeFormat !== extensionFormat) {
    return respondWithImageError(
      req,
      res,
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Only JPEG, PNG, and WebP images are allowed.",
    );
  }

  try {
    const metadata = await sharp(buffer, { failOn: "error" }).metadata();
    if (
      metadata.format !== mimeFormat ||
      !Number.isSafeInteger(metadata.width) ||
      !Number.isSafeInteger(metadata.height)
    ) {
      return respondWithImageError(
        req,
        res,
        400,
        "INVALID_IMAGE",
        "Uploaded file is not a valid supported image.",
      );
    }

    if (
      metadata.width <= 0 ||
      metadata.height <= 0 ||
      metadata.width > MAX_IMAGE_DIMENSION ||
      metadata.height > MAX_IMAGE_DIMENSION ||
      metadata.width * metadata.height > MAX_IMAGE_PIXELS
    ) {
      return respondWithImageError(
        req,
        res,
        413,
        "IMAGE_DIMENSIONS_TOO_LARGE",
        "Image dimensions exceed the supported limit.",
      );
    }

    if (metadata.pages > 1) {
      return respondWithImageError(
        req,
        res,
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Animated images are not supported.",
      );
    }

    req.validatedSubmissionImage = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
    })
      .rotate()
      .resize({
        width: MAX_OUTPUT_DIMENSION,
        height: MAX_OUTPUT_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    return next();
  } catch (error) {
    await recordSecurityAudit({
      req,
      event: "submission_image_validation_failed",
      severity: "warn",
      outcome: "blocked",
      walletAddress: req.auth?.walletAddress,
      errorCode: error.code || "INVALID_IMAGE",
    });
    return respondWithImageError(
      req,
      res,
      400,
      "INVALID_IMAGE",
      "Uploaded file is not a valid supported image.",
    );
  }
};

const deleteSubmissionImage = async (
  publicId,
  req,
  event = "submission_image_cleanup_failed",
) => {
  if (!publicId) return true;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    if (!["ok", "not found"].includes(result?.result)) {
      throw new Error("Cloudinary did not confirm image deletion");
    }
    return true;
  } catch (error) {
    logRequestError(req, event, error, "warn");
    return false;
  }
};

const uploadSubmissionImage = async (buffer, req) => {
  const generatedId = `submission_${randomUUID()}`;
  const publicId = `${CLOUDINARY_FOLDER}/${generatedId}`;

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: generatedId,
          resource_type: "image",
          format: "webp",
          allowed_formats: ["webp"],
          overwrite: false,
          unique_filename: false,
          use_filename: false,
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        },
      );
      stream.on("error", reject);
      stream.end(buffer);
    });

    const secureUrl =
      typeof result?.secure_url === "string" ? new URL(result.secure_url) : null;
    if (
      !secureUrl ||
      secureUrl.protocol !== "https:" ||
      typeof result.public_id !== "string"
    ) {
      throw new Error("Cloudinary returned an invalid image result");
    }

    return { imageUrl: secureUrl.href, publicId: result.public_id };
  } catch (error) {
    for (const cleanupId of new Set([publicId, generatedId])) {
      await deleteSubmissionImage(
        cleanupId,
        req,
        "submission_image_upload_cleanup_failed",
      );
    }
    const uploadError = new Error("Unable to upload the submission image");
    uploadError.code = "IMAGE_UPLOAD_FAILED";
    throw uploadError;
  }
};

module.exports = {
  deleteSubmissionImage,
  prepareSubmissionImage,
  uploadSubmissionImage,
};
