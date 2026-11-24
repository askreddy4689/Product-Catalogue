const productService = require('../../src/services/productService');
const { config } = require('../../src/utils/config');
const { answerFakeStoreWith, fakeStoreProducts } = require('../fakeStoreTestData');

/** A tiny product in Fake Store's format, in the "hats" category. */
function hat(id, rate, count) {
  return {
    id,
    title: `Hat ${id}`,
    price: 10,
    description: 'A hat.',
    category: 'hats',
    image: `https://images.test/${id}.jpg`,
    rating: { rate, count },
  };
}

describe('Product service', () => {
  afterEach(() => {
    config.topRatedCount = 5;
  });

  describe('category page', () => {
    test('picks the highest rated products; a tie goes to the product with more reviews', async () => {
      config.topRatedCount = 2;
      answerFakeStoreWith([hat(1, 3.0, 10), hat(2, 4.5, 20), hat(3, 4.5, 90), hat(4, 2.0, 5)]);

      const page = await productService.getCategoryPage('hats');

      expect(page.category).toEqual({ id: 'hats', name: 'Hats' });
      expect(page.topRatedProducts.map((p) => p.id)).toEqual(['3', '2']);
      // The rest keep Fake Store's order
      expect(page.additionalProducts.map((p) => p.id)).toEqual(['1', '4']);
    });

    test('is null for an unknown category', async () => {
      answerFakeStoreWith([hat(1, 3.0, 10)]);

      expect(await productService.getCategoryPage('shoes')).toBeNull();
    });
  });

  describe("converting Fake Store's data", () => {
    test("uses the catalogue's product shape, with the configured currency", async () => {
      answerFakeStoreWith();

      expect(await productService.getProduct('3')).toEqual({
        id: '3',
        title: 'Mens Cotton Jacket',
        description: expect.any(String),
        price: { amount: 55.99, currency: 'GBP' },
        imageUrl: 'https://fakestoreapi.com/img/product-3.jpg',
        category: { id: 'mens-clothing', name: "Men's clothing" },
        rating: { average: 4.7, count: 500 },
      });
    });

    test('trims stray spaces and skips products with unexpected data', async () => {
      const untidy = { ...fakeStoreProducts[1], title: 'Mens Casual Premium Slim Fit T-Shirts ' };
      answerFakeStoreWith([{ id: 99, price: 'free' }, untidy]);

      const products = await productService.getProducts();

      expect(products.map((product) => product.title)).toEqual([
        'Mens Casual Premium Slim Fit T-Shirts',
      ]);
    });

    test('is null for an unknown product', async () => {
      answerFakeStoreWith();

      expect(await productService.getProduct('12345')).toBeNull();
    });
  });

  test.each([
    [
      'answers with an HTTP error',
      () => jest.fn(async () => new Response('Oops', { status: 503 })),
    ],
    ['cannot be reached', () => jest.fn().mockRejectedValue(new Error('ECONNREFUSED'))],
    ['returns something that is not a list', () => jest.fn(async () => Response.json({}))],
  ])('throws when Fake Store %s', async (_situation, makeFetch) => {
    global.fetch = makeFetch();

    await expect(productService.getProducts()).rejects.toThrow();
  });
});
