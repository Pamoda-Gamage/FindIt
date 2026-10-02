const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateId = require("../middleware/validateId");
const upload = require("../middleware/upload");
const { createItem, getItems, getItem, updateItem, deleteItem } = require("../controllers/itemController");
const { createClaim, getItemClaims } = require("../controllers/claimController");

const router = express.Router();
router.use(protect);
router.param("id", validateId);

const categories = ["Electronics", "Documents", "Clothing", "Accessories", "Other"];

const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").isIn(categories).withMessage("Invalid category"),
  body("locationFound").trim().notEmpty().withMessage("Location is required"),
  body("dateFound").optional().isISO8601().withMessage("Invalid date"),
];

const updateRules = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
  body("category").optional().isIn(categories).withMessage("Invalid category"),
  body("locationFound").optional().trim().notEmpty().withMessage("Location cannot be empty"),
  body("dateFound").optional().isISO8601().withMessage("Invalid date"),
];

router.route("/")
  .get(getItems)
  .post(upload.single("image"), createRules, validate, createItem);

router.route("/:id")
  .get(getItem)
  .put(upload.single("image"), updateRules, validate, updateItem)
  .delete(deleteItem);

router.route("/:id/claims")
  .get(getItemClaims)
  .post(
    [body("message").trim().notEmpty().withMessage("Message is required")],
    validate,
    createClaim
  );

module.exports = router;