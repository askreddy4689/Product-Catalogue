import { Alert, Box, Breadcrumbs, Button, CircularProgress, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

/** Small pieces that many pages share. */

/** A spinner shown while data loads. `label` is read out by screen readers. */
export function LoadingIndicator({ label = 'Loading' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress aria-label={label} />
    </Box>
  );
}

/**
 * A friendly error box. When the thing asked for doesn't exist (404) it offers a link
 * home; for other (usually temporary) problems it offers "Try again", if `onRetry` is given.
 */
export function ErrorMessage({ error, onRetry }) {
  let action = null;
  if (error?.status === 404) {
    action = (
      <Button component={RouterLink} to="/" color="inherit" size="small">
        Go to home page
      </Button>
    );
  } else if (onRetry) {
    action = (
      <Button color="inherit" size="small" onClick={() => onRetry()}>
        Try again
      </Button>
    );
  }

  return (
    <Alert severity="error" action={action} sx={{ alignItems: 'center' }}>
      {error?.message || 'Something went wrong. Please try again.'}
    </Alert>
  );
}

/**
 * The "you are here" trail above a page title, e.g. Home › Men's clothing › Mens Cotton Jacket.
 * `links` are the pages between Home and this one; `current` is this page's name.
 */
export function PageBreadcrumbs({ links = [], current }) {
  return (
    <Breadcrumbs aria-label="Breadcrumb" separator="›" sx={{ mb: 1 }}>
      <Link component={RouterLink} to="/" underline="hover" color="inherit">
        Home
      </Link>
      {links.map((link) => (
        <Link key={link.to} component={RouterLink} to={link.to} underline="hover" color="inherit">
          {link.label}
        </Link>
      ))}
      <Typography aria-current="page" sx={{ color: 'text.primary' }}>
        {current}
      </Typography>
    </Breadcrumbs>
  );
}
