const express = require("express");
const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
} = require("../controllers/grievanceController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// IMPORTANT: specific routes like /my must come BEFORE /:id,
// otherwise Express will treat "my" as an :id value.
router.post("/", protect, createGrievance);
router.get("/my", protect, getMyGrievances);
router.get("/", protect, authorizeRoles("officer", "admin"), getAllGrievances);
router.get("/:id", protect, getGrievanceById);
router.patch("/:id/status", protect, authorizeRoles("officer", "admin"), updateGrievanceStatus);

module.exports = router;