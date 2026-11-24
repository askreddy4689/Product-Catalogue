import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router';
import { useProduct } from '../api/queries';
import { ErrorMessage, LoadingIndicator, PageBreadcrumbs } from '../components/PageParts';
import { ProductRating } from '../components/ProductGrid';
import { siteConfig } from '../siteConfig';
import { formatPrice } from '../utils/formatPrice';

/**
 * The product details page (acceptance criterion: Product page),
 * with the Enquire button that leads to the enquiry form.
 */
export default function ProductPage() {
  const { productId } = useParams();
  const { data: product, isPending, isError, error, refetch } = useProduct(productId);

  if (isPending) {
    return <LoadingIndicator label="Loading product" />;
  }
  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <Stack spacing={3}>
      <title>{`${product.title} | ${siteConfig.storeName}`}</title>
      <PageBreadcrumbs
        links={[{ label: product.category.name, to: `/categories/${product.category.id}` }]}
        current={product.title}
      />

      {/* Picture and details side by side on wide screens; picture on top on phones */}
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Paper
          variant="outlined"
          sx={{ p: 3, display: 'flex', justifyContent: 'center', bgcolor: 'common.white' }}
        >
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.title}
            sx={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }}
          />
        </Paper>

        <Stack spacing={2}>
          <Typography variant="h1">{product.title}</Typography>
          <ProductRating rating={product.rating} />
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {formatPrice(product.price)}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>{product.description}</Typography>
          <Box>
            {/* A link styled as a button: it opens the enquiry form page */}
            <Button
              component={RouterLink}
              to={`/products/${product.id}/enquire`}
              variant="contained"
              size="large"
            >
              Enquire
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
