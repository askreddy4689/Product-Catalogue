import * as api from '../../src/api/apiClient';
import { ApiError } from '../../src/api/ApiError';
import { allProducts, categories, electronicsCategoryPage, topRatedProducts } from './sampleData';

/**
 * Gives every API call a sensible answer based on the sample data, so each test
 * only needs to set up the calls it is actually about.
 *
 * Each test file must also replace the real API client with Jest mocks, using:
 *   jest.mock('../../src/api/apiClient');
 */
export function answerApiCallsWithSampleData() {
  api.getCategories.mockResolvedValue(categories);
  api.getTopRatedProducts.mockResolvedValue(topRatedProducts);
  api.getCategoryPage.mockResolvedValue(electronicsCategoryPage);
  api.searchProducts.mockResolvedValue([]);
  api.getProduct.mockImplementation(async (productId) => {
    const product = allProducts.find((item) => item.id === productId);
    if (!product) {
      throw new ApiError('Sorry, we could not find that product.', { status: 404 });
    }
    return product;
  });
  api.sendEnquiry.mockResolvedValue({ status: 'sent' });
}
