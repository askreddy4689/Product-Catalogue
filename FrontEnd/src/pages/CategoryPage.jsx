import { Box, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import { useCategoryPage } from '../api/queries';
import { ErrorMessage, LoadingIndicator, PageBreadcrumbs } from '../components/PageParts';
import ProductGrid from '../components/ProductGrid';
import { siteConfig } from '../siteConfig';

/**
 * A category's page (acceptance criterion: Category page).
 * Shows the category's top rated products first, then its other products.
 * The API decides which products are "top rated" (its TOP_RATED_COUNT setting, 5 by default).
 */
export default function CategoryPage() {
  const { categoryId } = useParams();
  const { data, isPending, isError, error, refetch } = useCategoryPage(categoryId);

  if (isPending) {
    return <LoadingIndicator label="Loading products" />;
  }
  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const { category, topRatedProducts, additionalProducts } = data;
  return (
    <Stack spacing={5}>
      <title>{`${category.name} | ${siteConfig.storeName}`}</title>

      <Box>
        <PageBreadcrumbs current={category.name} />
        <Typography variant="h1">{category.name}</Typography>
      </Box>

      <ProductGrid title="Top rated" products={topRatedProducts} />

      {/* Left out when every product in the category is already shown as top rated */}
      {additionalProducts.length > 0 && (
        <ProductGrid title={`More in ${category.name}`} products={additionalProducts} />
      )}
    </Stack>
  );
}
