/**
 * An error from the API, carrying a message that is safe to show to customers.
 *
 * - `status` is the HTTP status code (0 if the server could not be reached at all).
 * - `fields` holds a message per form field when the server rejected form input,
 *   e.g. { email: 'Please enter a valid email address' }.
 */
export class ApiError extends Error {
  constructor(message, { status, code, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields ?? {};
  }
}
