const path = require('node:path');

/**
 * The backend's settings, read from environment variables (normally Backend/.env).
 * Every setting is described in .env.example. The SMTP login is read by utils/mailer.js.
 */

// The Backend folder: folder paths in the settings are relative to it
const BACKEND_FOLDER = path.resolve(__dirname, '..', '..');

const config = {
  port: numberOr(process.env.PORT, 4000),
  webAppUrl: withoutTrailingSlash(process.env.WEB_APP_URL || 'http://localhost:5173'),

  fakeStoreApiUrl: withoutTrailingSlash(
    process.env.FAKE_STORE_API_URL || 'https://fakestoreapi.com',
  ),
  priceCurrency: process.env.PRICE_CURRENCY || 'GBP',
  topRatedCount: numberOr(process.env.TOP_RATED_COUNT, 5),

  salesInboxEmail: process.env.SALES_INBOX_EMAIL,
  emailTemplatesFolder: path.resolve(
    BACKEND_FOLDER,
    process.env.EMAIL_TEMPLATES_DIR || '../DataStore/emailTemplates',
  ),
};

/** Settings the backend can't work properly without. Checked when the server starts. */
const REQUIRED_SETTINGS = ['SALES_INBOX_EMAIL', 'SMTP_USER', 'SMTP_PASSWORD'];

function findMissingSettings() {
  return REQUIRED_SETTINGS.filter((name) => !process.env[name]);
}

function numberOr(value, fallback) {
  const number = Number(value);
  return value === undefined || value === '' || Number.isNaN(number) ? fallback : number;
}

// "http://x.com/" → "http://x.com", so addresses can be joined safely
function withoutTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}

module.exports = { config, findMissingSettings };
