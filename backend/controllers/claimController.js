const Item = require("../models/Item");
const Claim = require("../models/Claim");

// POST /api/items/:id/claims
exports.createClaim = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status === "Claimed") {
      return res.status(409).json({ message: "This item has already been claimed" });
    }
    if (item.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "You cannot claim your own item" });
    }
    const existing = await Claim.findOne({
      item: item._id, claimant: req.user._id, status: "Pending",
    });
    if (existing) {
      return res.status(409).json({ message: "You already have a pending claim on this item" });
    }

    const claim = await Claim.create({
      item: item._id, claimant: req.user._id, message: req.body.message,
    });
    res.status(201).json(claim);
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id/claims  (item owner only)
exports.getItemClaims = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!item.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the poster can view claims" });
    }
    const claims = await Claim.find({ item: item._id })
      .populate("claimant", "name email")
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

// GET /api/claims/mine
exports.getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate("item", "title imageUrl status")
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    next(err);
  }
};

// PUT /api/claims/:id  (claimant edits message while Pending)
exports.updateClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (!claim.claimant.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your claim" });
    }
    if (claim.status !== "Pending") {
      return res.status(409).json({ message: "Only pending claims can be edited" });
    }
    claim.message = req.body.message;
    await claim.save();
    res.json(claim);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/claims/:id/status  (item owner approves or rejects)
exports.updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const item = claim.item;
    if (!item.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the item's poster can decide claims" });
    }
    if (claim.status !== "Pending") {
      return res.status(409).json({ message: "This claim has already been decided" });
    }

    if (status === "Approved") {
      if (item.status === "Claimed") {
        return res.status(409).json({ message: "Item is already claimed" });
      }
      item.status = "Claimed";
      await item.save();

      // auto-reject every other pending claim on this item
      await Claim.updateMany(
        { item: item._id, _id: { $ne: claim._id }, status: "Pending" },
        { status: "Rejected" }
      );
    }

    claim.status = status;
    await claim.save();
    res.json(claim);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/claims/:id  (claimant withdraws)
exports.deleteClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (!claim.claimant.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your claim" });
    }

    // withdrawing an approved claim releases the item again
    if (claim.status === "Approved") {
      await Item.findByIdAndUpdate(claim.item, { status: "Available" });
    }
    await claim.deleteOne();
    res.json({ message: "Claim withdrawn" });
  } catch (err) {
    next(err);
  }
};