import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api/apiClient';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';
import { cottonJacket } from '../helpers/sampleData';

jest.mock('../../src/api/apiClient');

/*
 * Acceptance criterion: Product page
 *   GIVEN I am browsing the products
 *   AND I want to see more details about a specific product
 *   WHEN I click on a product tile
 *   THEN I see the product details page
 */
describe('Product page', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('clicking a product tile opens the product details page', async () => {
    const user = userEvent.setup();

    // GIVEN I am browsing the products
    renderApp('/');

    // WHEN I click on a product tile
    await user.click(await screen.findByRole('link', { name: /Mens Cotton Jacket/ }));

    // THEN I see the product details page
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mens Cotton Jacket' }),
    ).toBeVisible();
    expect(screen.getByRole('img', { name: 'Mens Cotton Jacket' })).toHaveAttribute(
      'src',
      cottonJacket.imageUrl,
    );
    expect(screen.getByText('£55.99')).toBeVisible();
    expect(screen.getByText('4.7 (500 reviews)')).toBeVisible();
    expect(screen.getByText(cottonJacket.description)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Enquire' })).toHaveAttribute(
      'href',
      '/products/3/enquire',
    );
    expect(api.getProduct).toHaveBeenCalledWith('3');
  });

  test('shows where the product sits in the catalogue, with a link back to its category', async () => {
    renderApp('/products/3');

    const categoryLink = await screen.findByRole('link', { name: "Men's clothing" });
    expect(categoryLink).toHaveAttribute('href', '/categories/mens-clothing');
  });

  test('explains when the product does not exist', async () => {
    renderApp('/products/999');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, we could not find that product.',
    );
  });
});
