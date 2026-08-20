const { validationResult } = require("express-validator");

// Runs after the validation chain on a route.
// If any validator failed, respond with a clean 400 instead of letting
// the request reach the controller.
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validateRequest;