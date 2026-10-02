const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error("Only JPG, PNG or WEBP images are allowed");
      err.status = 400;
      cb(err);
    }
  },
});

module.exports = upload;