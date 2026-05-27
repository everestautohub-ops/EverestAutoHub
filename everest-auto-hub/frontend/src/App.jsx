import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState, useEffect } from 'react';
import { FiPhone, FiArrowUp } from 'react-icons/fi';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Services from './pages/Services';
import Appointment from './pages/Appointment';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminNotices from './pages/admin/AdminNotices';
import AdminTransactions from './pages/admin/AdminTransactions';
import NoticePopup from './components/NoticePopup';

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const ProtectedUser = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login?redirect=/profile" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
};

const PublicLayout = ({ children }) => {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <NoticePopup />
      {/* Floating Call Button */}
      <a
        href="tel:+61290000000"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          background: 'var(--primary)', color: '#fff',
          width: '52px', height: '52px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(249,115,22,0.5)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: 'pulse-call 2.5s infinite',
        }}
        title="Call Us"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <FiPhone size={22} />
      </a>
      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '86px', right: '24px', zIndex: 999,
            background: 'var(--bg-3)', color: 'var(--text)',
            border: '1px solid var(--border)',
            width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow)', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Back to top"
        >
          <FiArrowUp size={18} />
        </button>
      )}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/appointment" element={<PublicLayout><Appointment /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/shop/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/profile" element={<PublicLayout><ProtectedUser><Profile /></ProtectedUser></PublicLayout>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="site-content" element={<AdminSiteContent />} />
        <Route path="home" element={<AdminSiteContent />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CurrencyProvider>
              <CartProvider>
                <AppRoutes />
                <ToasterWithTheme />
              </CartProvider>
            </CurrencyProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function ToasterWithTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#242424' : '#ffffff',
          color: isDark ? '#f8f9fa' : '#1a1a1a',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        },
        success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
      }}
    />
  );
}
