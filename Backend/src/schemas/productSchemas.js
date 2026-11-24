const Joi = require('joi');

/** Rules for the product addresses (checked by middlewares/payloadValidator.js), written with Joi. */

// /api/categories/:categoryId/products
const categoryParamsSchema = Joi.object({
  categoryId: Joi.string()
    .pattern(/^[a-z0-9-]{1,64}$/)
    .required()
    .messages({ '*': 'Category id is not valid' }),
});

// /api/products/:productId
const productParamsSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[A-Za-z0-9_-]{1,64}$/)
    .required()
    .messages({ '*': 'Product id is not valid' }),
});

// /api/products?search=...  (search is optional; without it, all products are listed)
const productListQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).messages({
    'string.empty': 'Please enter a search term',
    'string.max': 'Search term must be 100 characters or fewer',
    '*': 'Search term is not valid',
  }),
});

// What each product from the Fake Store API must look like. Products that don't match are skipped.
// Text is trimmed, because some real Fake Store titles end with a stray space.
const fakeStoreProductSchema = Joi.object({
  id: Joi.number().required(),
  title: Joi.string().trim().required(),
  price: Joi.number().required(),
  description: Joi.string().trim().allow('').required(),
  category: Joi.string().trim().required(),
  image: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  rating: Joi.object({ rate: Joi.number().required(), count: Joi.number().required() }).required(),
});

module.exports = {
  categoryParamsSchema,
  productParamsSchema,
  productListQuerySchema,
  fakeStoreProductSchema,
};
