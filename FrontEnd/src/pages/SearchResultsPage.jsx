import { Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router';
import { useProductSearch } from '../api/queries';
import { ErrorMessage, LoadingIndicator } from '../components/PageParts';
import ProductGrid from '../components/ProductGrid';
import { siteConfig } from '../siteConfig';

/**
 * Search results (acceptance criterion: Search).
 * The search term comes from the address bar, e.g. /search?q=jacket, so results
 * can be bookmarked or shared. The API decides which products match.
 */
export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get('q') ?? '').trim();
  const { data: products, isPending, isError, error, refetch } = useProductSearch(searchTerm);

  if (!searchTerm) {
    return <Typography>Type a product name in the search box above, then press Search.</Typography>;
  }
  if (isPending) {
    return <LoadingIndicator label="Searching" />;
  }
  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <Stack spacing={3}>
      <title>{`Search: ${searchTerm} | ${siteConfig.storeName}`}</title>
      <Typography variant="h1">Search results for “{searchTerm}”</Typography>

      {products.length === 0 ? (
        <Typography>
          No products match “{searchTerm}”. Try a different word, or browse a category.
        </Typography>
      ) : (
        <>
          <Typography sx={{ color: 'text.secondary' }}>
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </Typography>
          <ProductGrid products={products} />
        </>
      )}
    </Stack>
  );
}
