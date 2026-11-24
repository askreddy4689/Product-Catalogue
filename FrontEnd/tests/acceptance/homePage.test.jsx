import { screen, within } from '@testing-library/react';
import * as api from '../../src/api/apiClient';
import { ApiError } from '../../src/api/ApiError';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';

jest.mock('../../src/api/apiClient');

/*
 * Acceptance criterion: Home page
 *   GIVEN I have chosen 5 products to be "top rated"
 *   WHEN I am viewing the home page
 *   THEN I see those 5 featured products
 *
 * Agreed: the API chooses the 5 (the highest rated across the catalogue; see its tests).
 */
describe('Home page', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('shows the 5 top rated products, in the order the API gives them', async () => {
    // GIVEN 5 products are "top rated" (the sample data), WHEN I am viewing the home page
    renderApp('/');

    // THEN I see those 5 featured products
    const topRated = await screen.findByRole('region', { name: 'Top rated' });
    const productNames = within(topRated)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(productNames).toEqual([
      'WD 4TB Gaming Drive',
      'Silicon Power 256GB SSD',
      'Mens Cotton Jacket',
      'Mens Casual Premium Slim Fit T-Shirts',
      'WD 2TB Portable Hard Drive',
    ]);
  });

  test('also links to every category, and no longer lists all products', async () => {
    renderApp('/');

    const categorySection = await screen.findByRole('region', { name: 'Shop by category' });
    expect(await within(categorySection).findByRole('link', { name: 'Electronics' })).toBeVisible();
    expect(within(categorySection).getByRole('link', { name: "Men's clothing" })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'All products' })).not.toBeInTheDocument();
  });

  test('offers "Try again" when the top rated products could not be loaded', async () => {
    api.getTopRatedProducts.mockRejectedValue(
      new ApiError('Sorry, products are unavailable right now. Please try again shortly.', {
        status: 502,
      }),
    );

    renderApp('/');

    expect(await screen.findByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
