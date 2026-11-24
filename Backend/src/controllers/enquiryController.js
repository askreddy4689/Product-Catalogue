const productService = require('../services/productService');
const enquiryService = require('../services/enquiryService');
const logger = require('../../logger');
const { sendError } = require('../utils/responses');
const { sendProductsUnavailable } = require('./productController');

/**
 * POST /api/enquiries: emails the enquiry to the sales inbox.
 * The form details were already checked by middlewares/payloadValidator.js (req.validated).
 */
async function createEnquiry(req, res) {
  const enquiry = req.validated;

  // Look the product up here rather than trusting product details sent by the browser
  let product;
  try {
    product = await productService.getProduct(enquiry.productId);
  } catch (error) {
    return sendProductsUnavailable(res, error);
  }
  if (!product) {
    return sendError(res, 404, 'NOT_FOUND', 'Sorry, we could not find that product.');
  }

  try {
    await enquiryService.sendEnquiryEmail({ enquiry, product });
  } catch (error) {
    logger.error(`Enquiry email not sent: ${error.message}`);
    return sendError(
      res,
      502,
      'EMAIL_NOT_SENT',
      'Sorry, we could not send your enquiry just now. Please try again in a few minutes.',
    );
  }

  res.status(201).json({ status: 'sent' });
}

module.exports = { createEnquiry };
