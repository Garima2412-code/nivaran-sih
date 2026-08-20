// Use this when you want to throw a specific status code on purpose,
// e.g. throw new ApiError(404, "Grievance not found");
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;