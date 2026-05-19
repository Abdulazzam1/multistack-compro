import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CMSLayout        from '@/components/layout/CMSLayout';
import LoginPage        from '@/pages/LoginPage';
import DashboardPage    from '@/pages/DashboardPage';
import BannersPage      from '@/pages/banners/BannersPage';
import CategoriesPage   from '@/pages/categories/CategoriesPage';
import ProductsPage     from '@/pages/products/ProductsPage';
import ProductFormPage  from '@/pages/products/ProductFormPage';
import ServicesPage     from '@/pages/services/ServicesPage';
import PortfolioPage    from '@/pages/portfolio/PortfolioPage';
import NewsPage         from '@/pages/news/NewsPage';
import NewsFormPage     from '@/pages/news/NewsFormPage';
import TestimonialsPage from '@/pages/testimonials/TestimonialsPage';
import AwardsPage       from '@/pages/awards/AwardsPage';
import ContactPage      from '@/pages/contact/ContactPage';
import RFQPage          from '@/pages/rfq/RFQPage';
import SettingsPage     from '@/pages/settings/SettingsPage';

// ── Guard: Arahkan ke /login jika belum login ────────────────────────────
function RequireAuth({ children }) {
  const token = localStorage.getItem('multistack_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login (publik) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Semua route CMS memerlukan autentikasi */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <CMSLayout />
            </RequireAuth>
          }
        >
          <Route index                    element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"         element={<DashboardPage />} />
          <Route path="banners"           element={<BannersPage />} />
          <Route path="categories"        element={<CategoriesPage />} />
          <Route path="products"          element={<ProductsPage />} />
          <Route path="products/new"      element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="services"          element={<ServicesPage />} />
          <Route path="portfolio"         element={<PortfolioPage />} />
          <Route path="news"              element={<NewsPage />} />
          <Route path="news/new"          element={<NewsFormPage />} />
          <Route path="news/:id/edit"     element={<NewsFormPage />} />
          <Route path="testimonials"      element={<TestimonialsPage />} />
          <Route path="awards"            element={<AwardsPage />} />
          <Route path="contact"           element={<ContactPage />} />
          <Route path="rfq"               element={<RFQPage />} />
          <Route path="settings"          element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
