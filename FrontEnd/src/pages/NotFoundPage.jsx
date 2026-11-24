import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { siteConfig } from '../siteConfig';

/** Shown for any web address that doesn't match a page. */
export default function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <title>{`Page not found | ${siteConfig.storeName}`}</title>
      <Typography variant="h1">Page not found</Typography>
      <Typography>Sorry, there is no page at this address.</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go to the home page
      </Button>
    </Stack>
  );
}
