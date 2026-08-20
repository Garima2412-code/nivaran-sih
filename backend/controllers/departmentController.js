const Department = require("../models/Department");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

const createDepartment = asyncHandler(async (req, res) => {
  const { name, category, slaHours, contactEmail } = req.body;

  const existing = await Department.findOne({ name });
  if (existing) {
    throw new ApiError(400, "Department already exists");
  }

  const department = await Department.create({ name, category, slaHours, contactEmail });
  res.status(201).json(department);
});

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.json(departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, "Department not found");
  }
  res.json(department);
});

module.exports = { createDepartment, getDepartments, getDepartmentById };