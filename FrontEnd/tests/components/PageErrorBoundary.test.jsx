import { screen } from '@testing-library/react';
import * as api from '../../src/api/apiClient';
import { answerApiCallsWithSampleData } from '../helpers/mockApi';
import { renderApp } from '../helpers/render';

jest.mock('../../src/api/apiClient');

describe('PageErrorBoundary', () => {
  beforeEach(() => answerApiCallsWithSampleData());

  test('shows a friendly message instead of a blank page when a page breaks, and keeps the header', async () => {
    // React reports the page's error in the console; keep the test output tidy
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Data in an unexpected shape makes the category page fail while showing itself
    api.getCategoryPage.mockResolvedValue({});

    renderApp('/categories/electronics');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sorry, something went wrong while showing this page.',
    );
    expect(screen.getByRole('link', { name: 'Go to home page' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Search products' })).toBeVisible();

    consoleError.mockRestore();
  });
});
