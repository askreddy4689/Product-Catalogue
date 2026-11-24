const request = require('supertest');
const app = require('../../server');
const { answerFakeStoreWith } = require('../fakeStoreTestData');

/*
 * Acceptance criterion: Product page
 *   GIVEN I am browsing the products
 *   AND I want to see more details about a specific product
 *   WHEN I click on a product tile
 *   THEN I see the product details page
 */
describe('Product API', () => {
  beforeEach(() => answerFakeStoreWith());

  test('GET /api/products lists every product, for browsing', async () => {
    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(20);
  });

  test('GET /api/products/:productId returns everything the product page shows', async () => {
    const response = await request(app).get('/api/products/3');

    expect(response.status).toBe(200);
    expect(response.body.product).toEqual({
      id: '3',
      title: 'Mens Cotton Jacket',
      description:
        'Great outerwear for spring, autumn and winter. Good for hiking, camping and climbing.',
      price: { amount: 55.99, currency: 'GBP' },
      imageUrl: 'https://fakestoreapi.com/img/product-3.jpg',
      category: { id: 'mens-clothing', name: "Men's clothing" },
      rating: { average: 4.7, count: 500 },
    });
  });

  test('returns 404 for a product that does not exist', async () => {
    const response = await request(app).get('/api/products/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual({
      code: 'NOT_FOUND',
      message: 'Sorry, we could not find that product.',
    });
  });

  test('returns 400 for a badly formed product id', async () => {
    const response = await request(app).get('/api/products/%3Cscript%3E');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});
