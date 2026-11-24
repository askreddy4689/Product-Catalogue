import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import * as api from './apiClient';

/*
 * React hooks that load data for the pages, built on TanStack Query.
 *
 * Each query hook returns { data, isPending, isError, isSuccess, error, refetch }.
 * Results are cached, so the same data is not downloaded twice in a row.
 * The first item of each `queryKey` names the data; the rest says which part of it.
 */

/**
 * Creates the cache for data loaded from the API. Product data changes rarely, so it is
 * reused for 5 minutes (going "back" to a page is instant). After a temporary problem
 * (network or server trouble) it tries once more; "not found" is shown straight away.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < 1 && (error.status === 0 || error.status >= 500),
      },
    },
  });
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => api.getCategories() });
}

export function useTopRatedProducts() {
  return useQuery({ queryKey: ['top-rated'], queryFn: () => api.getTopRatedProducts() });
}

export function useCategoryPage(categoryId) {
  return useQuery({
    queryKey: ['category-page', categoryId],
    queryFn: () => api.getCategoryPage(categoryId),
  });
}

export function useProductSearch(searchTerm) {
  return useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => api.searchProducts(searchTerm),
    enabled: searchTerm.length > 0, // don't search for nothing
  });
}

export function useProduct(productId) {
  return useQuery({ queryKey: ['product', productId], queryFn: () => api.getProduct(productId) });
}

/** Sending an enquiry changes something (an email is sent), so it is a "mutation", not a query. */
export function useSendEnquiry() {
  return useMutation({ mutationFn: (enquiry) => api.sendEnquiry(enquiry) });
}
