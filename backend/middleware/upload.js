const multer = require("multer");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 5,
    fieldSize: 20 * 1024,
    fieldNameSize: 100,
    parts: 6,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Only JPEG, PNG, and WebP images are allowed");
      error.code = "INVALID_UPLOAD";
      return callback(error);
    }
    callback(null, true);
  },
});

module.exports = { upload };
