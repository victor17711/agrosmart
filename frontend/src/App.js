import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Preloader from './components/Preloader';
import JivoChat from './components/JivoChat';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import DynamicPage from './pages/DynamicPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ServicesPage from './pages/ServicesPage';
import AboutUsPage from './pages/AboutUsPage';
import CatalogPage from './pages/CatalogPage';
import MyAccountPage from './pages/MyAccountPage';
import CatalogCategoryPage from './pages/CatalogCategoryPage';
import FAQPage from './pages/FAQPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ContactPage from './pages/ContactPage';
import BrandsPage from './pages/BrandsPage';
import BrandPage from './pages/BrandPage';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import ContentManagement from './pages/admin/ContentManagement';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import BrandsManagement from './pages/admin/BrandsManagement';
import UsersManagement from './pages/admin/UsersManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import RequestsManagement from './pages/admin/RequestsManagement';
import Settings from './pages/admin/Settings';
import Pages from './pages/admin/Pages';
import GiftsManagement from './pages/admin/GiftsManagement';
import GiftConditionsManagement from './pages/admin/GiftConditionsManagement';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Wrapper component to handle route changes and preloader (ONLY for public pages)
const RouteChangeHandler = ({ children }) => {
  // const location = useLocation();
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   // Skip preloader for admin routes
  //   if (location.pathname.startsWith('/admin')) {
  //     setLoading(false);
  //     return;
  //   }

  //   setLoading(true);
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 1000); // 1 seconds preloader

  //   return () => clearTimeout(timer);
  // }, [location.pathname]);

  // if (loading) {
  //   return <Preloader />;
  // }

  return children;
};

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdmin();
  
  // Wait for loading to complete before redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  // Helper function to create routes with and without /ru prefix
  const createDualRoutes = (path, element) => {
    return (
      <>
        <Route path={path} element={element} />
        <Route path={`/ru${path}`} element={element} />
      </>
    );
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="App">
                <ScrollToTop />
                <RouteChangeHandler>
                  {/* <JivoChat /> */}
                <Routes>
                  {/* Public Routes - with RO and RU versions */}
                  {createDualRoutes("/", (
                    <>
                      <Navbar />
                      <HomePage />
                      <Footer />
                    </>
                  ))}

                {/* Contact Page Route */}
                {createDualRoutes("/contact", (
                  <>
                    <Navbar />
                    <ContactPage />
                    <Footer />
                  </>
                ))}

                {/* Brands Page Route */}
                {createDualRoutes("/brands", (
                  <>
                    <Navbar />
                    <BrandsPage />
                    <Footer />
                  </>
                ))}

                {/* Brand Detail Page Route */}
                {createDualRoutes("/brand/:slug", (
                  <>
                    <Navbar />
                    <BrandPage />
                    <Footer />
                  </>
                ))}

                {/* Search Results Route */}
                {createDualRoutes("/search", (
                  <>
                    <Navbar />
                    <SearchResultsPage />
                    <Footer />
                  </>
                ))}

                {/* Dynamic Page Route */}
                {createDualRoutes("/page/:slug", (
                  <>
                    <Navbar />
                    <DynamicPage />
                    <Footer />
                  </>
                ))}

                {/* Category Page Route */}
                {createDualRoutes("/category/:slug", (
                  <>
                    <Navbar />
                    <CategoryPage />
                    <Footer />
                  </>
                ))}

                {/* Product Detail Page Route */}
                {createDualRoutes("/product/:id", (
                  <>
                    <Navbar />
                    <ProductDetailPage />
                    <Footer />
                  </>
                ))}

                {/* Cart Page Route */}
                {createDualRoutes("/cart", (
                  <>
                    <Navbar />
                    <CartPage />
                    <Footer />
                  </>
                ))}

                {/* Checkout Page Route */}
                {createDualRoutes("/checkout", (
                  <>
                    <Navbar />
                    <CheckoutPage />
                    <Footer />
                  </>
                ))}

                {/* Services Page Route */}
                {createDualRoutes("/servicii", (
                  <>
                    <Navbar />
                    <ServicesPage />
                    <Footer />
                  </>
                ))}

                {/* About Us Page Route */}
                {createDualRoutes("/despre-noi", (
                  <>
                    <Navbar />
                    <AboutUsPage />
                    <Footer />
                  </>
                ))}

                {/* Catalog Page Route */}
                {createDualRoutes("/catalog", (
                  <>
                    <Navbar />
                    <CatalogPage />
                    <Footer />
                  </>
                ))}

                {/* Catalog Page Detail Route */}
                {createDualRoutes("/catalog/:categoryId", (
                  <>
                    <Navbar />
                    <CatalogCategoryPage />
                    <Footer />
                  </>
                ))}

                {/* FAQ Page Route */}
                {createDualRoutes("/intrebari-frecvente", (
                  <>
                    <Navbar />
                    <FAQPage />
                    <Footer />
                  </>
                ))}

                {/* Order Success Page Route */}
                {createDualRoutes("/order-success", (
                  <>
                    <Navbar />
                    <OrderSuccessPage />
                    <Footer />
                  </>
                ))}

                {/* My Account Page Route */}
                {createDualRoutes("/contul-meu", (
                  <>
                    <Navbar />
                    <MyAccountPage />
                    <Footer />
                  </>
                ))}

                {/* 404 Page Route */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <NotFound />
                    <Footer />
                  </>
                } />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute>
                    <Dashboard />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/products" element={
                  <AdminProtectedRoute>
                    <ProductsManagement />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/categories" element={
                  <AdminProtectedRoute>
                    <CategoriesManagement />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/brands" element={
                  <AdminProtectedRoute>
                    <BrandsManagement />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <AdminProtectedRoute>
                    <UsersManagement />
                  </AdminProtectedRoute>
                } />
                
                <Route path="/admin/orders" element={
                  <AdminProtectedRoute>
                    <OrdersManagement />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/settings" element={
                  <AdminProtectedRoute>
                    <Settings />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/requests" element={
                  <AdminProtectedRoute>
                    <RequestsManagement />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/content" element={
                  <AdminProtectedRoute>
                    <ContentManagement />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/pages" element={
                  <AdminProtectedRoute>
                    <Pages />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/gifts" element={
                  <AdminProtectedRoute>
                    <GiftsManagement />
                  </AdminProtectedRoute>
                } />

                <Route path="/admin/gift-conditions" element={
                  <AdminProtectedRoute>
                    <GiftConditionsManagement />
                  </AdminProtectedRoute>
                } />

                {/* Redirect /admin to /admin/dashboard */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
              </RouteChangeHandler>
              
              <Toaster />
            </div>
          </CartProvider>
          </LanguageProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
