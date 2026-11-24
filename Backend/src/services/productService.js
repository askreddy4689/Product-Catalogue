const { config } = require('../utils/config');
const logger = require('../../logger');
const { titleMatchesSearch } = require('../utils/search');
const { fakeStoreProductSchema } = require('../schemas/productSchemas');

/**
 * Products and the catalogue's rules. Products come from the Fake Store API
 * (https://fakestoreapi.com), fetched on each request. Fake Store can't search or filter,
 * so that happens here. To use another data source, change fetchAllProducts().
 */

const REQUEST_TIMEOUT_MS = 5000;

/** Downloads every product. Throws if Fake Store can't be reached or answers wrongly. */
async function fetchAllProducts() {
  const response = await fetch(`${config.fakeStoreApiUrl}/products`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Fake Store API responded with HTTP ${response.status}`);
  }
  const body = await response.json();
  if (!Array.isArray(body)) {
    throw new Error('Fake Store API did not return a list of products');
  }
  return body.flatMap(toProduct);
}

/** Converts one Fake Store product into the catalogue's own shape (see docs/api.md). */
function toProduct(item) {
  const { error, value } = fakeStoreProductSchema.validate(item, { stripUnknown: true });
  if (error) {
    logger.warn('Skipped a Fake Store product with unexpected data', { id: item?.id });
    return [];
  }
  const { id, title, description, price, image, category, rating } = value;
  return [
    {
      id: String(id),
      title,
      description,
      price: { amount: price, currency: config.priceCurrency },
      imageUrl: image,
      category: toCategory(category),
      rating: { average: rating.rate, count: rating.count },
    },
  ];
}

/** Example: "men's clothing" → { id: "mens-clothing", name: "Men's clothing" } */
function toCategory(name) {
  const id = name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return { id, name: name.charAt(0).toUpperCase() + name.slice(1) };
}

/** Every category once, sorted by name. */
async function getCategories() {
  const products = await fetchAllProducts();
  const categoriesById = new Map(
    products.map((product) => [product.category.id, product.category]),
  );
  return [...categoriesById.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** All products, or only those whose title matches the search term (see utils/search.js). */
async function getProducts(searchTerm) {
  const products = await fetchAllProducts();
  return searchTerm
    ? products.filter((product) => titleMatchesSearch(product.title, searchTerm))
    : products;
}

/**
 * The home page's featured products: the highest rated across the whole catalogue
 * (TOP_RATED_COUNT, 5 by default), best first.
 */
async function getTopRatedProducts() {
  const products = await fetchAllProducts();
  return [...products].sort(byRatingHighestFirst).slice(0, config.topRatedCount);
}

/** One product, or null if there is no such product. */
async function getProduct(productId) {
  const products = await fetchAllProducts();
  return products.find((product) => product.id === productId) ?? null;
}

/**
 * Everything the category page shows: the category, its top rated products, and the rest
 * ("additional products", in Fake Store's order). Null if there is no such category.
 */
async function getCategoryPage(categoryId) {
  const products = await fetchAllProducts();
  const inCategory = products.filter((product) => product.category.id === categoryId);
  if (inCategory.length === 0) return null;

  const topRatedProducts = [...inCategory]
    .sort(byRatingHighestFirst)
    .slice(0, config.topRatedCount);
  const additionalProducts = inCategory.filter((product) => !topRatedProducts.includes(product));
  return { category: inCategory[0].category, topRatedProducts, additionalProducts };
}

/**
 * Highest average rating first. On a tie, the product with more reviews comes first,
 * because its rating is based on more opinions.
 */
function byRatingHighestFirst(a, b) {
  return b.rating.average - a.rating.average || b.rating.count - a.rating.count;
}

module.exports = {
  getCategories,
  getProducts,
  getTopRatedProducts,
  getProduct,
  getCategoryPage,
};
