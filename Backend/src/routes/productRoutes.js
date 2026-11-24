const express = require('express');
const productController = require('../controllers/productController');
const { validateUser } = require('../middlewares/validateUser');
const { payloadValidator } = require('../middlewares/payloadValidator');
const {
  categoryParamsSchema,
  productParamsSchema,
  productListQuerySchema,
} = require('../schemas/productSchemas');

/**
 * Category and product addresses (all under /api). See docs/api.md.
 * Each request goes: validateUser → payloadValidator → controller.
 */
const router = express.Router();

router.get('/categories', validateUser, productController.getCategories);

router.get(
  '/categories/:categoryId/products',
  validateUser,
  payloadValidator(categoryParamsSchema, 'params'),
  productController.getCategoryProducts,
);

router.get(
  '/products',
  validateUser,
  payloadValidator(productListQuerySchema, 'query'),
  productController.getProducts,
);

// Must come before '/products/:productId', or "top-rated" would be read as a product id
router.get('/products/top-rated', validateUser, productController.getTopRatedProducts);

router.get(
  '/products/:productId',
  validateUser,
  payloadValidator(productParamsSchema, 'params'),
  productController.getProduct,
);

module.exports = router;
