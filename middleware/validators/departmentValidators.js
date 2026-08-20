const { body } = require("express-validator");

const createDepartmentValidator = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("slaHours").optional().isInt({ min: 1 }).withMessage("slaHours must be a positive number"),
];

module.exports = { createDepartmentValidator };