import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
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
        <Route path="/profile" element={<Dashboard />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute adminEmail="admin@loopit.com">
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
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
