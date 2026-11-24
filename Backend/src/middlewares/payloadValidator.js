/**
 * Checks part of a request against a Joi schema (from the schemas folder) before the
 * controller runs. Use it on a route, e.g. payloadValidator(enquirySchema) for the body,
 * or payloadValidator(productParamsSchema, 'params') for the address.
 *
 * - Valid: the cleaned-up values (spaces trimmed, unknown fields dropped) go to the
 *   controller as req.validated.
 * - Not valid: the request stops here with HTTP 400 and one message per invalid field, e.g.
 *   { "error": { "code": "VALIDATION_FAILED", "message": "...", "fields": { "email": "..." } } }
 *
 * @param {import('joi').Schema} schema
 * @param {'body' | 'params' | 'query'} [part]  which part of the request to check
 */
function payloadValidator(schema, part = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[part] ?? {}, {
      abortEarly: false, // report every invalid field, not just the first
      stripUnknown: true, // drop fields we don't expect
    });
    if (!error) {
      req.validated = value;
      return next();
    }

    const fields = {};
    for (const detail of error.details) {
      const field = detail.path.join('.') || 'request';
      fields[field] ??= detail.message; // keep the first problem for each field
    }
    return res.status(400).json({
      error: { code: 'VALIDATION_FAILED', message: 'Please check the highlighted fields.', fields },
    });
  };
}

module.exports = { payloadValidator };
