import { getProduct, searchProducts, sendEnquiry } from '../../src/api/apiClient';
import { ApiError } from '../../src/api/ApiError';

/** Makes the next call to fetch() answer with `body` as JSON and the given status. */
function answerFetchWith(body, status = 200) {
  global.fetch = jest.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

describe('API client', () => {
  afterEach(() => {
    delete global.fetch;
  });

  test('returns the product from the reply', async () => {
    answerFetchWith({ product: { id: '3', title: 'Mens Cotton Jacket' } });

    const product = await getProduct('3');

    expect(product).toEqual({ id: '3', title: 'Mens Cotton Jacket' });
    expect(global.fetch).toHaveBeenCalledWith('/api/products/3', expect.anything());
  });

  test('makes search terms safe to put in a web address', async () => {
    answerFetchWith({ products: [] });

    await searchProducts('t-shirt & jeans');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products?search=t-shirt%20%26%20jeans',
      expect.anything(),
    );
  });

  test('sends an enquiry as JSON', async () => {
    answerFetchWith({ status: 'sent' }, 201);
    const enquiry = {
      productId: '3',
      name: 'Jane',
      email: 'jane@example.com',
      phone: '',
      message: '',
    };

    await sendEnquiry(enquiry);

    expect(global.fetch).toHaveBeenCalledWith('/api/enquiries', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
  });

  test("turns an error reply into an ApiError with the server's message and field problems", async () => {
    answerFetchWith(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Please check the highlighted fields.',
          fields: { email: 'Please enter a valid email address' },
        },
      },
      400,
    );

    const error = await sendEnquiry({}).catch((caught) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Please check the highlighted fields.');
    expect(error.status).toBe(400);
    expect(error.fields).toEqual({ email: 'Please enter a valid email address' });
  });

  test('uses a general message when the error reply is not JSON (e.g. a proxy error page)', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 504,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    }));

    await expect(getProduct('3')).rejects.toMatchObject({
      message: 'Something went wrong. Please try again.',
      status: 504,
    });
  });

  test('explains when the server cannot be reached at all', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getProduct('3')).rejects.toMatchObject({
      message:
        'We could not reach the server. Please check your internet connection and try again.',
      status: 0,
    });
  });

  test('treats a "successful" reply that is not JSON as a failure (it did not come from the API)', async () => {
    // For example, a web host answering /api with the web app's own page
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    }));

    await expect(sendEnquiry({})).rejects.toBeInstanceOf(ApiError);
    await expect(getProduct('3')).rejects.toBeInstanceOf(ApiError);
  });

  test('only reports an enquiry as sent when the API confirms it', async () => {
    answerFetchWith({ something: 'else' }, 200);

    await expect(sendEnquiry({})).rejects.toMatchObject({
      message: 'Something went wrong. Please try again.',
    });
  });
});
