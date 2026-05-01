import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle, Share2, ShoppingBag } from 'lucide-react';

const Footer: React.FC = () => {
  const shareText = encodeURIComponent('Check out Loopit, a modern resale marketplace for local student deals.');
  const shareUrl = encodeURIComponent(window.location.origin);
  const footerActions = [
    { icon: Globe, href: '/', label: 'Open Loopit home' },
    { icon: Share2, href: `mailto:?subject=Loopit marketplace&body=${shareText}%0A${shareUrl}`, label: 'Share Loopit by email' },
    { icon: MessageCircle, href: `https://wa.me/?text=${shareText}%20${shareUrl}`, label: 'Share Loopit on WhatsApp' },
    { icon: Mail, href: 'mailto:loopitresale@gmail.com', label: 'Email Loopit' },
  ];

  return (
    <footer className="mt-20 border-t border-emerald-100 bg-slate-950 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Loopit</span>
            </div>
            <p className="max-w-md text-sm font-medium leading-7 text-slate-400">
              A modern resale marketplace for students and local communities. Buy smarter, sell faster, and keep useful things moving.
            </p>
            <div className="mt-6 flex gap-3">
              {footerActions.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="rounded-full bg-white/10 p-3 text-white transition hover:bg-emerald-500" aria-label={label} title={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-black text-white">Marketplace</h3>
            <ul className="space-y-3 text-sm font-semibold">
              <li><Link to="/" className="hover:text-emerald-300">Home</Link></li>
              <li><Link to="/listings" className="hover:text-emerald-300">Browse Products</Link></li>
              <li><Link to="/sell" className="hover:text-emerald-300">Sell Product</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-300">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-black text-white">Company</h3>
            <ul className="space-y-3 text-sm font-semibold">
              <li><Link to="/" className="hover:text-emerald-300">About</Link></li>
              <li><a href="mailto:loopitresale@gmail.com" className="hover:text-emerald-300">Contact</a></li>
              <li><Link to="/policy" className="hover:text-emerald-300">Terms & Conditions</Link></li>
              <li><Link to="/policy" className="hover:text-emerald-300">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Loopit. All rights reserved.</p>
          <p>Built for smoother resale experiences.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
