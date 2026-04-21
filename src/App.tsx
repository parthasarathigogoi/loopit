import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedProfileRoute from './components/ProtectedProfileRoute';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ProductDetail from './pages/ProductDetail';
import Sell from './pages/Sell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Policy from './pages/Policy';

const AppContent: React.FC = () => {
  const location = useLocation();
  // Hide navbar only on login pages and admin panel
  const hideNavbar = location.pathname === '/login' || location.pathname === '/admin';
  // Hide footer on login pages and admin panel
  const hideFooter = location.pathname === '/login' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/login" element={<Login />} />
          <Route path="/policy" element={<Policy />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedProfileRoute>
                <Dashboard />
              </ProtectedProfileRoute>
            } 
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          {/* 404 Fallback - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
