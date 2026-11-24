const request = require('supertest');
const app = require('../../server');

describe('General API behaviour', () => {
  test('GET /api/health reports that the API is running', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('responses carry standard security headers and do not reveal the framework', async () => {
    const response = await request(app).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  // These are answered by Express itself (there is no custom error handler), with the right status
  test.each([
    ['an unknown route', () => request(app).get('/api/no-such-route'), 404],
    ['a badly encoded web address', () => request(app).get('/api/products/%ZZ'), 400],
    [
      'a body that is not valid JSON',
      () =>
        request(app).post('/api/enquiries').set('Content-Type', 'application/json').send('{ "a": '),
      400,
    ],
    [
      'a body larger than 10 KB',
      () =>
        request(app)
          .post('/api/enquiries')
          .send({ message: 'x'.repeat(11_000) }),
      413,
    ],
  ])('%s gets the right error status', async (_case, sendRequest, expectedStatus) => {
    const response = await sendRequest();

    expect(response.status).toBe(expectedStatus);
  });
});

describe('When Fake Store is down', () => {
  const friendlyError = {
    code: 'PRODUCTS_UNAVAILABLE',
    message: 'Sorry, products are unavailable right now. Please try again shortly.',
  };

  test('an error reply from Fake Store becomes a 502 with a friendly message', async () => {
    global.fetch = jest.fn(async () => new Response('Server error', { status: 500 }));

    const response = await request(app).get('/api/products');

    expect(response.status).toBe(502);
    expect(response.body.error).toEqual(friendlyError);
  });

  test('a network failure becomes a 502, without internal details', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('getaddrinfo ENOTFOUND fakestore.test'));

    const response = await request(app).get('/api/categories');

    expect(response.status).toBe(502);
    expect(response.body.error).toEqual(friendlyError);
    expect(JSON.stringify(response.body)).not.toContain('ENOTFOUND');
  });
});
