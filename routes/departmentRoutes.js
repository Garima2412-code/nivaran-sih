const express = require("express");
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
} = require("../controllers/departmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", protect, authorizeRoles("admin"), createDepartment);

module.exports = router;