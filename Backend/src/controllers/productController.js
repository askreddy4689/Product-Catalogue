const productService = require('../services/productService');
const logger = require('../../logger');
const { sendError } = require('../utils/responses');

/*
 * Each controller asks the product service and sends JSON back. The input was already
 * checked by middlewares/payloadValidator.js and is in req.validated.
 * Lists are wrapped in an object (e.g. { products: [...] }) so fields such as paging
 * details can be added later without breaking the website.
 */

async function getCategories(req, res) {
  try {
    res.json({ categories: await productService.getCategories() });
  } catch (error) {
    sendProductsUnavailable(res, error);
  }
}

/** The category page: { category, topRatedProducts, additionalProducts } */
async function getCategoryProducts(req, res) {
  try {
    const page = await productService.getCategoryPage(req.validated.categoryId);
    if (!page) {
      return sendError(res, 404, 'NOT_FOUND', 'Sorry, we could not find that category.');
    }
    res.json(page);
  } catch (error) {
    sendProductsUnavailable(res, error);
  }
}

/** All products, or only those matching ?search=... */
async function getProducts(req, res) {
  try {
    res.json({ products: await productService.getProducts(req.validated.search) });
  } catch (error) {
    sendProductsUnavailable(res, error);
  }
}

/** The home page's featured products: the highest rated across the catalogue */
async function getTopRatedProducts(req, res) {
  try {
    res.json({ products: await productService.getTopRatedProducts() });
  } catch (error) {
    sendProductsUnavailable(res, error);
  }
}

async function getProduct(req, res) {
  try {
    const product = await productService.getProduct(req.validated.productId);
    if (!product) {
      return sendError(res, 404, 'NOT_FOUND', 'Sorry, we could not find that product.');
    }
    res.json({ product });
  } catch (error) {
    sendProductsUnavailable(res, error);
  }
}

/** Fake Store failed: details go to the log, the customer gets a friendly message (HTTP 502). */
function sendProductsUnavailable(res, error) {
  logger.error(`Products unavailable: ${error.message}`);
  sendError(
    res,
    502,
    'PRODUCTS_UNAVAILABLE',
    'Sorry, products are unavailable right now. Please try again shortly.',
  );
}

module.exports = {
  getCategories,
  getCategoryProducts,
  getProducts,
  getTopRatedProducts,
  getProduct,
  sendProductsUnavailable,
};
