const express = require("express");
const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
} = require("../controllers/grievanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createGrievanceValidator,
  updateStatusValidator,
  getGrievanceValidator,
} = require("../middleware/validators/grievanceValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/", protect, createGrievanceValidator, validateRequest, createGrievance);
router.get("/my", protect, getMyGrievances);
router.get("/", protect, authorizeRoles("officer", "admin"), getAllGrievances);
router.get("/:id", protect, getGrievanceValidator, validateRequest, getGrievanceById);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("officer", "admin"),
  updateStatusValidator,
  validateRequest,
  updateGrievanceStatus
);

module.exports = router;