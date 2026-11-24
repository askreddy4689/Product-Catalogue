import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useCategories, useTopRatedProducts } from '../api/queries';
import { ErrorMessage, LoadingIndicator } from '../components/PageParts';
import ProductGrid from '../components/ProductGrid';
import { siteConfig } from '../siteConfig';

/**
 * The landing page (acceptance criterion: Home page): a welcome, the 5 featured
 * "top rated" products, and a link to each category.
 * The API picks the featured products: the highest rated across the whole catalogue.
 */
export default function HomePage() {
  const topRated = useTopRatedProducts();
  const categories = useCategories();

  return (
    <Stack spacing={5}>
      <title>{siteConfig.storeName}</title>

      <Box>
        <Typography variant="h1" gutterBottom>
          Welcome
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 640 }}>
          Browse by category or search for a product. When you find something you like, open it and
          press Enquire: our sales team will get back to you.
        </Typography>
      </Box>

      {topRated.isPending && <LoadingIndicator label="Loading top rated products" />}
      {topRated.isError && <ErrorMessage error={topRated.error} onRetry={topRated.refetch} />}
      {topRated.isSuccess && <ProductGrid title="Top rated" products={topRated.data} />}

      <Box component="section" aria-labelledby="shop-by-category">
        <Typography id="shop-by-category" variant="h2" sx={{ mb: 2 }}>
          Shop by category
        </Typography>
        {categories.isPending && <LoadingIndicator label="Loading categories" />}
        {categories.isError && (
          <ErrorMessage error={categories.error} onRetry={categories.refetch} />
        )}
        {categories.isSuccess && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {categories.data.map((category) => (
              <Button
                key={category.id}
                component={RouterLink}
                to={`/categories/${category.id}`}
                variant="outlined"
                size="large"
              >
                {category.name}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
}
