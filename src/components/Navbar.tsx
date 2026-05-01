import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Heart, Menu, Moon, PlusCircle, Search, ShoppingBag, Sun, User, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('loopit-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('loopit-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(search.trim() ? `/listings?search=${encodeURIComponent(search.trim())}` : '/listings');
    setMobileOpen(false);
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-black transition ${
        location.pathname === to
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
      onClick={() => setMobileOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">Loopit</span>
          </Link>

          <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search furniture, kettle, notes..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:ring-emerald-400/10"
            />
          </form>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {navLink('/listings', 'Browse')}
            {user && navLink('/sell', 'Sell')}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button onClick={() => setDarkMode((value) => !value)} className="rounded-full p-3 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/profile" className="hidden rounded-full p-3 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:block" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <button className="hidden rounded-full p-3 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:block" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            {user ? (
              <>
                <Link to="/sell" className="hidden items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 sm:flex">
                  <PlusCircle className="h-4 w-4" />
                  Sell
                </Link>
                <Link to="/profile" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-emerald-500 hover:text-white dark:bg-slate-800 dark:text-slate-200">
                  <User className="h-5 w-5" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                Login
              </Link>
            )}
            <button className="rounded-full p-3 text-slate-600 lg:hidden dark:text-slate-300" onClick={() => setMobileOpen((value) => !value)} aria-label="Toggle menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-4 border-t border-slate-100 py-4 lg:hidden dark:border-slate-800">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Loopit" className="w-full rounded-2xl bg-slate-100 py-3 pl-12 pr-4 text-sm font-semibold outline-none dark:bg-slate-900 dark:text-white" />
            </form>
            <div className="flex flex-col gap-2">
              {navLink('/', 'Home')}
              {navLink('/listings', 'Browse')}
              {user && navLink('/sell', 'Sell item')}
              {user && navLink('/profile', 'Profile')}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
