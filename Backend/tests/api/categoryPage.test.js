const request = require('supertest');
const app = require('../../server');
const { config } = require('../../src/utils/config');
const { answerFakeStoreWith, idsOf } = require('../fakeStoreTestData');

/*
 * Acceptance criterion: Category page
 *   GIVEN my products are organised into categories
 *   WHEN I click on a category link
 *   THEN I see top rated products for that category
 *   AND I see additional products in that category
 */
describe('Category page API', () => {
  beforeEach(() => answerFakeStoreWith());
  afterEach(() => {
    config.topRatedCount = 5;
  });

  test('GET /api/categories lists every category, with an id for links and a name for display', async () => {
    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(200);
    expect(response.body.categories).toEqual([
      { id: 'electronics', name: 'Electronics' },
      { id: 'jewelery', name: 'Jewelery' },
      { id: 'mens-clothing', name: "Men's clothing" },
      { id: 'womens-clothing', name: "Women's clothing" },
    ]);
  });

  test('returns the top 5 rated products, best first, and the rest as additional products', async () => {
    const response = await request(app).get('/api/categories/electronics/products');

    expect(response.status).toBe(200);
    expect(response.body.category).toEqual({ id: 'electronics', name: 'Electronics' });
    // 12 and 11 are both rated 4.8: 12 comes first because it has more reviews (400 vs 319)
    expect(idsOf(response.body.topRatedProducts)).toEqual(['12', '11', '9', '10', '13']);
    expect(idsOf(response.body.additionalProducts)).toEqual(['14']);
  });

  test("lists additional products in the data source's own order", async () => {
    config.topRatedCount = 2;

    const response = await request(app).get('/api/categories/womens-clothing/products');

    expect(idsOf(response.body.topRatedProducts)).toEqual(['18', '19']);
    expect(idsOf(response.body.additionalProducts)).toEqual(['15', '16', '17', '20']);
  });

  test('has no additional products when the category is no bigger than the top rated count', async () => {
    // Men's clothing has only 4 products, so all of them are "top rated"
    const response = await request(app).get('/api/categories/mens-clothing/products');

    expect(idsOf(response.body.topRatedProducts)).toEqual(['3', '2', '1', '4']);
    expect(response.body.additionalProducts).toEqual([]);
  });

  test('returns 404 for a category that does not exist', async () => {
    const response = await request(app).get('/api/categories/garden-furniture/products');

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual({
      code: 'NOT_FOUND',
      message: 'Sorry, we could not find that category.',
    });
  });

  test('returns 400 for a badly formed category id', async () => {
    const response = await request(app).get('/api/categories/Not%20Valid!/products');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});
