module.exports = (err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.code === "LIMIT_FILE_SIZE" ? "Image must be 2MB or smaller" : err.message,
    });
  }
  if (err.name === "ValidationError" || err.status === 400) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Server error" });
};