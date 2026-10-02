const mongoose = require("mongoose");

module.exports = (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Not found" });
  }
  next();
};