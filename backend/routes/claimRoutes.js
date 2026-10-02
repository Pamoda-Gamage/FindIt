const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateId = require("../middleware/validateId");
const { getMyClaims, updateClaim, updateClaimStatus, deleteClaim } = require("../controllers/claimController");

const router = express.Router();
router.use(protect);
router.param("id", validateId);

router.get("/mine", getMyClaims);

router.put(
  "/:id",
  [body("message").trim().notEmpty().withMessage("Message is required")],
  validate,
  updateClaim
);

router.patch(
  "/:id/status",
  [body("status").isIn(["Approved", "Rejected"]).withMessage("Status must be Approved or Rejected")],
  validate,
  updateClaimStatus
);

router.delete("/:id", deleteClaim);

module.exports = router;