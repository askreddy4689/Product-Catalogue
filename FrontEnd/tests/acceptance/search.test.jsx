import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api/apiClient';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';
import { cottonJacket } from '../helpers/sampleData';

jest.mock('../../src/api/apiClient');

/*
 * Acceptance criterion: Search
 *   GIVEN I am looking for a specific product
 *   AND I have entered a search term in the search bar
 *   WHEN I click the search button
 *   THEN I only see products that have text matching that search term
 *
 * Which products match is decided by the API (tested in Backend/tests/api/search.test.js).
 * These tests check the web app sends the term and shows only what comes back.
 */
describe('Search', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('clicking Search shows only the products matching the search term', async () => {
    const user = userEvent.setup();
    api.searchProducts.mockResolvedValue([cottonJacket]);

    // GIVEN I am looking for a specific product (the home page lists every product)
    renderApp('/');
    expect(await screen.findByRole('link', { name: /Slim Fit T-Shirts/ })).toBeVisible();

    // AND I have entered a search term in the search bar
    await user.type(screen.getByRole('textbox', { name: 'Search products' }), 'jacket');

    // WHEN I click the search button
    await user.click(screen.getByRole('button', { name: 'Search' }));

    // THEN I only see products that have text matching that search term
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Search results for “jacket”' }),
    ).toBeVisible();
    expect(screen.getByText('1 product found')).toBeVisible();
    expect(screen.getByRole('link', { name: /Mens Cotton Jacket/ })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Slim Fit T-Shirts/ })).not.toBeInTheDocument();
    expect(api.searchProducts).toHaveBeenCalledWith('jacket');
  });

  test('says so when no products match', async () => {
    api.searchProducts.mockResolvedValue([]);

    renderApp('/search?q=submarine');

    expect(
      await screen.findByText(
        'No products match “submarine”. Try a different word, or browse a category.',
      ),
    ).toBeVisible();
  });

  test('the search box shows the current search term on the results page', async () => {
    renderApp('/search?q=jacket');

    expect(screen.getByRole('textbox', { name: 'Search products' })).toHaveValue('jacket');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('jacket');
  });
});
