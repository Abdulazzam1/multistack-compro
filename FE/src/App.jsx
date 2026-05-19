import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import PortfolioDetail from './pages/PortfolioDetail';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index              element={<HomePage />} />
          <Route path="tentang-kami" element={<AboutPage />} />
          <Route path="produk"       element={<ProductsPage />} />
          <Route path="produk/:slug" element={<ProductDetailPage />} />
          <Route path="layanan"      element={<ServicesPage />} />
          <Route path="portfolio"    element={<PortfolioPage />} />
          <Route path="portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="informasi"    element={<NewsPage />} />
          <Route path="informasi/:slug" element={<NewsDetailPage />} />
          <Route path="kontak"       element={<ContactPage />} />
          <Route path="*"            element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
