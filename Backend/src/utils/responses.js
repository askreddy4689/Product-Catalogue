/**
 * Sends an error in the API's one error format:
 *   { "error": { "code": "NOT_FOUND", "message": "Sorry, we could not find that product." } }
 * Messages are written for customers, because the website shows them as they are.
 */
function sendError(res, status, code, message) {
  res.status(status).json({ error: { code, message } });
}

module.exports = { sendError };
