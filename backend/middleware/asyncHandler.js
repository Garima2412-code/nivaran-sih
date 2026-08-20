// Wraps an async controller so any thrown error or rejected promise
// is automatically passed to Express's error-handling middleware,
// instead of needing try/catch in every single controller function.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;