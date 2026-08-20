const { body, param, query } = require("express-validator");

const createGrievanceValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title must be under 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("location.lat").optional().isFloat().withMessage("Latitude must be a number"),
  body("location.lng").optional().isFloat().withMessage("Longitude must be a number"),
];

const updateStatusValidator = [
  param("id").isMongoId().withMessage("Invalid grievance ID"),
  body("status")
    .isIn(["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .withMessage("Invalid status value"),
];

const getGrievanceValidator = [
  param("id").isMongoId().withMessage("Invalid grievance ID"),
];

module.exports = { createGrievanceValidator, updateStatusValidator, getGrievanceValidator };