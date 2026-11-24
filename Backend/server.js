const express = require('express');
const helmet = require('helmet');
const { config, findMissingSettings } = require('./src/utils/config');
const logger = require('./logger');
const { generateEnquiryEmail } = require('./src/utils/emailTemplate');
const productRoutes = require('./src/routes/productRoutes');
const enquiryRoutes = require('./src/routes/enquiryRoutes');

/**
 * The backend API. A request goes:
 *   routes → middlewares (validateUser, then payloadValidator) → controllers → services → utils
 * This file sets up Express and starts the server (with `npm run dev` or `npm start`).
 */
const app = express();

app.use(helmet()); // standard security headers on every response
app.use(express.json({ limit: '10kb' })); // reads JSON bodies; rejects anything over 10 KB

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', productRoutes);
app.use('/api/enquiries', enquiryRoutes);

function startServer() {
  const missing = findMissingSettings();
  if (missing.length > 0) {
    logger.warn(
      `Missing settings in Backend/.env: ${missing.join(', ')}. Enquiries can't be emailed until they are set.`,
    );
  }

  // Build an example email now, so a mistake in the DataStore template stops the
  // server here rather than failing a customer's enquiry later
  generateEnquiryEmail({
    enquiry: { name: 'Example', email: 'customer@example.com', phone: '', message: '' },
    product: { id: '1', title: 'Example product', price: { amount: 1, currency: 'GBP' } },
  });

  const server = app.listen(config.port, (error) => {
    if (error) {
      logger.error(`Could not start the API on port ${config.port}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    logger.info(`API running at http://localhost:${config.port}`);
  });

  // When the hosting platform stops the app, finish requests in progress first
  process.on('SIGTERM', () => server.close());
}

// Start only when this file is run directly; the tests use `app` without starting a server
if (require.main === module) {
  try {
    startServer();
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = app;
