import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ProtectedProfileRoute from './components/ProtectedProfileRoute';

const Home = lazy(() => import('./pages/Home'));
const Listings = lazy(() => import('./pages/Listings'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Sell = lazy(() => import('./pages/Sell'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Policy = lazy(() => import('./pages/Policy'));

const ChunkLoadRecovery: React.FC = () => {
  useEffect(() => {
    const recoverFromStaleChunk = (message: string) => {
      const isChunkLoadError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('error loading dynamically imported module');

      if (!isChunkLoadError || sessionStorage.getItem('chunk-reload-attempted') === 'true') {
        return;
      }

      sessionStorage.setItem('chunk-reload-attempted', 'true');
      window.location.reload();
    };

    const handleError = (event: ErrorEvent) => {
      recoverFromStaleChunk(event.message || '');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      recoverFromStaleChunk(String(event.reason?.message || event.reason || ''));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  // Hide navbar only on login pages and admin panel
  const hideNavbar = location.pathname === '/login' || location.pathname === '/admin';
  // Hide footer on login pages and admin panel
  const hideFooter = location.pathname === '/login' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 flex flex-col dark:bg-slate-950 dark:text-white">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <p className="text-sm font-semibold text-gray-600">Loading page...</p>
              </div>
            </div>
          }
        >
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
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ChunkLoadRecovery />
      <AppContent />
    </Router>
  );
};

export default App;
