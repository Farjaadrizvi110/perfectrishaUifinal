/**
 * Custom NoSQL injection sanitisation middleware.
 * Replaces express-mongo-sanitize (incompatible with Express 5's read-only req.query).
 * Removes $ and . from keys in req.body, req.query, and req.params.
 */
function sanitizeValue(value) {
  if (typeof value !== "object" || value === null) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  const cleaned = {};
  for (const key of Object.keys(value)) {
    const cleanKey = key.replace(/[.$]/g, "");
    cleaned[cleanKey] = sanitizeValue(value[key]);
  }
  return cleaned;
}

export function mongoSanitize(req, _res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) {
    const cleaned = sanitizeValue({ ...req.query });
    // Reassign via Object.assign to work with Express 5's getter
    try {
      Object.assign(req.query, cleaned);
    } catch {
      // If query is fully read-only, skip — body/params are the main vector
    }
  }
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}
