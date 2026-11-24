const request = require('supertest');
const app = require('../../server');
const { answerFakeStoreWith, idsOf } = require('../fakeStoreTestData');

/*
 * Acceptance criterion: Search
 *   GIVEN I am looking for a specific product
 *   AND I have entered a search term in the search bar
 *   WHEN I click the search button
 *   THEN I only see products that have text matching that search term
 *
 * Agreed rule: only the title is searched (details in src/utils/search.js).
 */
describe('Search API: GET /api/products?search=...', () => {
  beforeEach(() => answerFakeStoreWith());

  const search = (term) => request(app).get('/api/products').query({ search: term });

  test.each([
    ['jacket', ['3', '15', '16', '17']],
    ['JACKET', ['3', '15', '16', '17']],
    ['fit slim', ['2', '4']],
    ['shirt', ['2', '20']],
    ['gold', ['5', '6', '7', '8']],
  ])('"%s" returns only the products whose title matches', async (term, expectedIds) => {
    const response = await search(term);

    expect(response.status).toBe(200);
    expect(idsOf(response.body.products)).toEqual(expectedIds);
  });

  test('"men" finds men\'s products but not women\'s', async () => {
    const response = await search('men');

    expect(idsOf(response.body.products)).toEqual(['2', '3', '4']);
  });

  test('does not match words that only appear in a description', async () => {
    const response = await search('hiking');

    expect(response.status).toBe(200);
    expect(response.body.products).toEqual([]);
  });

  test('rejects an empty search term', async () => {
    const response = await search('   ');

    expect(response.status).toBe(400);
    expect(response.body.error.fields).toEqual({ search: 'Please enter a search term' });
  });

  test('rejects a search term longer than 100 characters', async () => {
    const response = await search('a'.repeat(101));

    expect(response.status).toBe(400);
    expect(response.body.error.fields).toEqual({
      search: 'Search term must be 100 characters or fewer',
    });
  });
});
