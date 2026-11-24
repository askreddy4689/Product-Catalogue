import { ApiError } from './ApiError';

/**
 * The only place where the web app talks to the backend API.
 * Pages never call `fetch` themselves, so if the API changes, only this file changes.
 *
 * Requests go to /api on the same address as the web app. During development,
 * Vite forwards them to the API server (see vite.config.mjs).
 * The shapes of the data returned are described in docs/api.md.
 */
const API_BASE_PATH = '/api';
const GENERAL_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export async function getCategories() {
  const { categories } = await request('/categories');
  return categories;
}

/** Returns { category, topRatedProducts, additionalProducts } */
export function getCategoryPage(categoryId) {
  return request(`/categories/${encodeURIComponent(categoryId)}/products`);
}

/** The home page's featured products: the highest rated across the catalogue */
export async function getTopRatedProducts() {
  const { products } = await request('/products/top-rated');
  return products;
}

export async function searchProducts(searchTerm) {
  const { products } = await request(`/products?search=${encodeURIComponent(searchTerm)}`);
  return products;
}

export async function getProduct(productId) {
  const { product } = await request(`/products/${encodeURIComponent(productId)}`);
  return product;
}

/** @param {{ productId: string, name: string, email: string, phone: string, message: string }} enquiry */
export async function sendEnquiry(enquiry) {
  const reply = await request('/enquiries', { method: 'POST', body: JSON.stringify(enquiry) });
  // Only say "Thank you" when the API confirms the email was sent
  if (reply.status !== 'sent') {
    throw new ApiError(GENERAL_ERROR_MESSAGE, { status: 0 });
  }
  return reply;
}

/**
 * Sends a request to the API and returns the JSON reply.
 * Any failure becomes an ApiError with a message the page can show as it is.
 */
async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, { method, headers, body });
  } catch {
    throw new ApiError(
      'We could not reach the server. Please check your internet connection and try again.',
      { status: 0 },
    );
  }

  // The reply may not be JSON (e.g. a proxy's error page), so don't fail while reading it
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.error?.message ?? GENERAL_ERROR_MESSAGE, {
      status: response.status,
      code: data?.error?.code,
      fields: data?.error?.fields,
    });
  }

  // A "successful" reply that isn't JSON did not come from our API. For example, a web host
  // or a Wi-Fi login page answered instead. Treat it as a failure, never as a success.
  if (data === null) {
    throw new ApiError(GENERAL_ERROR_MESSAGE, { status: 0 });
  }
  return data;
}
