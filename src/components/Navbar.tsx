import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, PlusCircle, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-indigo-600 tracking-tight">LoopIt</span>
          </Link>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for induction, kettle..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/listings" className={`text-sm font-medium hover:text-indigo-600 ${location.pathname === '/listings' ? 'text-indigo-600' : 'text-gray-600'}`}>Browse</Link>
            
            {user ? (
              <>
                <Link to="/sell" className="hidden sm:flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  Sell Item
                </Link>
                <Link to="/profile" className={`p-2 rounded-full transition-colors ${location.pathname === '/profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <User className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
