import { validationResult } from 'express-validator';

/**
 * Express-validator result middleware.
 * If validation errors exist, returns 422 with the array of errors.
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
