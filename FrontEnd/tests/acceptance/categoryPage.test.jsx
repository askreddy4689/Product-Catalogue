import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api/apiClient';
import { ApiError } from '../../src/api/ApiError';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';
import { cottonJacket, mensClothing, slimFitTShirt } from '../helpers/sampleData';

jest.mock('../../src/api/apiClient');

/** The product names shown in a section of the page, in order. */
function productNamesIn(section) {
  return within(section)
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);
}

/*
 * Acceptance criterion: Category page
 *   GIVEN my products are organised into categories
 *   WHEN I click on a category link
 *   THEN I see top rated products for that category
 *   AND I see additional products in that category
 */
describe('Category page', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('clicking a category link shows its top rated products and its additional products', async () => {
    const user = userEvent.setup();

    // GIVEN my products are organised into categories
    renderApp('/');
    const categoryLinks = await screen.findByRole('navigation', { name: 'Product categories' });

    // WHEN I click on a category link
    await user.click(within(categoryLinks).getByRole('link', { name: 'Electronics' }));

    // THEN I see top rated products for that category
    expect(await screen.findByRole('heading', { level: 1, name: 'Electronics' })).toBeVisible();
    expect(productNamesIn(screen.getByRole('region', { name: 'Top rated' }))).toEqual([
      'WD 4TB Gaming Drive',
      'Silicon Power 256GB SSD',
      'WD 2TB Portable Hard Drive',
      'SanDisk SSD PLUS 1TB',
      'Acer 21.5 inch Full HD Monitor',
    ]);

    // AND I see additional products in that category
    expect(productNamesIn(screen.getByRole('region', { name: 'More in Electronics' }))).toEqual([
      'Samsung 49 inch Curved Gaming Monitor',
    ]);
    expect(api.getCategoryPage).toHaveBeenCalledWith('electronics');
  });

  test('leaves out the "More in" section when every product in the category is top rated', async () => {
    api.getCategoryPage.mockResolvedValue({
      category: mensClothing,
      topRatedProducts: [cottonJacket, slimFitTShirt],
      additionalProducts: [],
    });

    renderApp('/categories/mens-clothing');

    expect(await screen.findByRole('region', { name: 'Top rated' })).toBeVisible();
    expect(screen.queryByRole('region', { name: /More in/ })).not.toBeInTheDocument();
  });

  test('explains when the category does not exist, with a way back home', async () => {
    api.getCategoryPage.mockRejectedValue(
      new ApiError('Sorry, we could not find that category.', { status: 404 }),
    );

    renderApp('/categories/garden-furniture');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, we could not find that category.',
    );
    expect(screen.getByRole('link', { name: 'Go to home page' })).toBeVisible();
  });

  test('offers "Try again" when products could not be loaded, and recovers', async () => {
    const user = userEvent.setup();
    api.getCategoryPage.mockRejectedValueOnce(
      new ApiError('Sorry, products are unavailable right now. Please try again shortly.', {
        status: 502,
      }),
    );

    renderApp('/categories/electronics');
    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('region', { name: 'Top rated' })).toBeVisible();
  });
});
