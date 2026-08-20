const express = require("express");
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
} = require("../controllers/departmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createDepartmentValidator } = require("../middleware/validators/departmentValidators");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.post("/", protect, authorizeRoles("admin"), createDepartmentValidator, validateRequest, createDepartment);

module.exports = router;