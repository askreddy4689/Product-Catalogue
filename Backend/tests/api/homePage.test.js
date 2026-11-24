const request = require('supertest');
const app = require('../../server');
const { answerFakeStoreWith, idsOf } = require('../fakeStoreTestData');

/*
 * Acceptance criterion: Home page
 *   GIVEN I have chosen 5 products to be "top rated"
 *   WHEN I am viewing the home page
 *   THEN I see those 5 featured products
 *
 * Agreed: the 5 are chosen automatically, as the highest rated across the whole catalogue.
 */
describe('Home page API: GET /api/products/top-rated', () => {
  beforeEach(() => answerFakeStoreWith());

  test('returns the 5 highest rated products in the catalogue, best first', async () => {
    const response = await request(app).get('/api/products/top-rated');

    expect(response.status).toBe(200);
    // 12 and 11 are both rated 4.8: 12 first (400 reviews vs 319).
    // 3 and 18 are both rated 4.7: 3 first (500 reviews vs 130). Then 5 (4.6).
    expect(idsOf(response.body.products)).toEqual(['12', '11', '3', '18', '5']);
  });

  test('returns a 502 with a friendly message when Fake Store is down', async () => {
    answerFakeStoreWith('Server error', 500);

    const response = await request(app).get('/api/products/top-rated');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('PRODUCTS_UNAVAILABLE');
  });
});
