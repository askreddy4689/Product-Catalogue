import { render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import App from '../../src/App';
import AppProviders from '../../src/AppProviders';

// In tests, show errors straight away instead of retrying
function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

/**
 * Renders the whole app, opened at the web address `route`, just as a visitor would see it.
 * (Each test file replaces the API client with mocks, so no server is needed.)
 */
export function renderApp(route = '/') {
  return render(
    <AppProviders queryClient={createTestQueryClient()}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </AppProviders>,
  );
}

/** Renders a single component with the app's theme and data cache around it. */
export function renderWithProviders(ui) {
  return render(<AppProviders queryClient={createTestQueryClient()}>{ui}</AppProviders>);
}
