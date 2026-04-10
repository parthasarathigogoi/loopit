import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedProfileRoute from './components/ProtectedProfileRoute';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ProductDetail from './pages/ProductDetail';
import Sell from './pages/Sell';
import Login from './pages/Login';
import PhoneLogin from './pages/PhoneLogin';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

const AppContent: React.FC = () => {
  const location = useLocation();
  // Hide navbar only on login pages and admin panel
  const hideNavbar = location.pathname === '/login' || location.pathname === '/phone-login' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-white">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/login" element={<Login />} />
        <Route path="/phone-login" element={<PhoneLogin />} />
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
