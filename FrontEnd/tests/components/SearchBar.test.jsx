import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api/apiClient';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';

jest.mock('../../src/api/apiClient');

describe('SearchBar', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('asks for a search term instead of searching for nothing', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByRole('textbox', { name: 'Search products' }), '   ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(screen.getByText('Please type something to search for')).toBeVisible();
    expect(api.searchProducts).not.toHaveBeenCalled();
  });

  test('ignores spaces around the search term', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByRole('textbox', { name: 'Search products' }), '  jacket  ');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Search results for “jacket”',
    );
    expect(api.searchProducts).toHaveBeenCalledWith('jacket');
  });

  test('can search by pressing Enter', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByRole('textbox', { name: 'Search products' }), 'ssd{Enter}');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Search results for “ssd”',
    );
  });
});
