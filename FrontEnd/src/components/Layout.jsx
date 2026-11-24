import { Component, useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  Link as RouterLink,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { useCategories } from '../api/queries';
import { siteConfig } from '../siteConfig';

/**
 * The frame around every page: the header (store name, search box, category links),
 * the current page in the middle (<Outlet />), and a footer.
 */
export default function Layout() {
  const { pathname, search } = useLocation();

  // Jump back to the top of the window whenever the page changes, like a normal website
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    // A full-height column, so the footer stays at the bottom even on short pages
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="lg">
          {/* On phones the search box wraps below the store name; on wider screens they share a row */}
          <Toolbar disableGutters sx={{ flexWrap: 'wrap', gap: 2, py: 1.5 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              <StorefrontIcon />
              <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
                {siteConfig.storeName}
              </Typography>
            </Box>
            {/* A new search in the address bar resets the box, so it always shows the current search */}
            <SearchBar key={search} />
          </Toolbar>
          <CategoryLinks />
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        {/* A fresh safety net for each page, so an error on one page doesn't stick to the next */}
        <PageErrorBoundary key={pathname}>
          <Outlet />
        </PageErrorBoundary>
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          Proof of concept · Product data from the Fake Store API
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * The search box (acceptance criterion: Search).
 * Clicking "Search" opens the results page for the typed term, e.g. /search?q=jacket.
 */
function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      setError('Please type something to search for');
      return;
    }
    setError('');
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <Box
      component="form"
      role="search"
      noValidate
      onSubmit={handleSubmit}
      // Full width on phones; a fixed width on bigger screens
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: { xs: '100%', sm: 380 } }}
    >
      <TextField
        label="Search products"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        error={Boolean(error)}
        helperText={error}
        size="small"
        fullWidth
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />
      <Button type="submit" variant="contained">
        Search
      </Button>
    </Box>
  );
}

/**
 * A link to every product category (acceptance criterion: Category page).
 * Left out while loading or if loading fails: the page below shows its own message.
 */
function CategoryLinks() {
  const { data: categories } = useCategories();
  if (!categories?.length) return null;

  return (
    <Box
      component="nav"
      aria-label="Product categories"
      // One row of links; on narrow screens it scrolls sideways instead of wrapping
      sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5 }}
    >
      {categories.map((category) => (
        <Button
          key={category.id}
          component={NavLink}
          to={`/categories/${category.id}`}
          size="small"
          // NavLink marks the link of the page being viewed with the "active" class
          sx={{
            flexShrink: 0,
            color: 'text.primary',
            '&.active': { bgcolor: 'action.selected', fontWeight: 700 },
          }}
        >
          {category.name}
        </Button>
      ))}
    </Box>
  );
}

/**
 * A safety net around each page: if a page hits an unexpected error, visitors see a
 * friendly message instead of a blank screen, and the header still works.
 * (React only supports this as a "class" component.)
 */
class PageErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Alert
        severity="error"
        sx={{ alignItems: 'center' }}
        action={
          <Button component={RouterLink} to="/" color="inherit" size="small">
            Go to home page
          </Button>
        }
      >
        Sorry, something went wrong while showing this page. Please try again later.
      </Alert>
    );
  }
}
