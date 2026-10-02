const Item = require("../models/Item");
const Claim = require("../models/Claim");
const uploadToCloudinary = require("../config/cloudinary");

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, locationFound, dateFound } = req.body;
    let imageUrl = "";
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);

    const item = await Item.create({
      title, description, category, locationFound, dateFound, imageUrl,
      postedBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.getItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: safe, $options: "i" };
    }
    const items = await Item.find(filter).populate("postedBy", "name").sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate("postedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!item.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the poster can edit this item" });
    }

    const fields = ["title", "description", "category", "locationFound", "dateFound"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });
    if (req.file) item.imageUrl = await uploadToCloudinary(req.file.buffer);

    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!item.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the poster can delete this item" });
    }

    await Claim.deleteMany({ item: item._id }); // remove its claims too
    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
};