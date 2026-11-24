import { useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './api/queries';
import { theme } from './theme';

/**
 * Wraps the app in what every page needs:
 *  - the look and feel (the MUI theme, plus CssBaseline for consistent browser defaults)
 *  - the cache for data loaded from the API (TanStack Query)
 *
 * The tests render the app inside this too, so they see it exactly as visitors do.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {import('@tanstack/react-query').QueryClient} [props.queryClient]  tests pass their own
 */
export default function AppProviders({ children, queryClient }) {
  // Create the cache once and keep it while the page is open
  const [client] = useState(() => queryClient ?? createQueryClient());

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
