const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); // Your config file

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bounty_submissions", // The folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "image",
    // Optional: You can set a custom public_id for each file
    public_id: (req, file) => {
      // Example: submission_<timestamp>_<original_name>
      return `submission_${Date.now()}_${file.originalname.split(".")[0]}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };
