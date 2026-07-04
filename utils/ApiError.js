/**
 * A typed error carrying an HTTP status code, used so the centralised
 * error handler can distinguish operational errors (bad input, upstream
 * AI failure, 404s) from unexpected programming errors.
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
