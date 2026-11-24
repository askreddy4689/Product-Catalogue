/**
 * Checks who is making the request. Runs first, before any other check.
 *
 * The catalogue has no logins yet, so for now every request is simply passed on.
 * When logins arrive, check the user here (for example a token in the request headers)
 * and answer 401 if it is missing or wrong.
 */
function validateUser(req, res, next) {
  next();
}

module.exports = { validateUser };
