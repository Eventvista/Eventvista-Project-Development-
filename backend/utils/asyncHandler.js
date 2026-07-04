/**
 * Wraps an async Express controller so any thrown/rejected error is passed
 * to next(), where the centralised errorHandler middleware can format it.
 * @param {Function} fn - async (req, res, next) controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
