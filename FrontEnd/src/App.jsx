import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import CategoryPage from './pages/CategoryPage';
import EnquiryPage from './pages/EnquiryPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import SearchResultsPage from './pages/SearchResultsPage';

/** Every page in the app, and the web address (URL) it lives at. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="categories/:categoryId" element={<CategoryPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="products/:productId" element={<ProductPage />} />
        <Route path="products/:productId/enquire" element={<EnquiryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
