import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock, MapPin, Search, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/app';

const categories = [
  { name: 'Utensils', label: 'Kitchen-ready', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'Appliances', label: 'Campus essentials', tone: 'bg-sky-100 text-sky-700' },
  { name: 'Furniture', label: 'Room upgrades', tone: 'bg-violet-100 text-violet-700' },
  { name: 'Other', label: 'Hidden finds', tone: 'bg-amber-100 text-amber-700' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const trendingProducts = useMemo(() => [...products].sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price).slice(0, 4), [products]);
  const recentProducts = products.slice(0, 8);
  const recommendedProducts = products.filter((product) => !product.sold).slice(0, 4);

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    navigate(searchQuery.trim() ? `/listings?search=${encodeURIComponent(searchQuery.trim())}` : '/listings');
  };

  return (
    <main className="overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Premium student resale marketplace
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Buy less new. <span className="text-emerald-500">Loop</span> more value.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 dark:text-slate-300">
              Discover verified local deals, save favorites, chat with sellers, and list your items in minutes with Cloudinary-powered uploads.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[2rem] border border-white bg-white/85 p-3 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:flex-row dark:border-slate-800 dark:bg-slate-900/80">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search induction, chair, plates..."
                  className="w-full rounded-3xl bg-slate-100 py-4 pl-12 pr-4 text-sm font-bold outline-none transition focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-7 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600">
                Find Deals
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: MapPin, text: 'Local pickup' },
                { icon: BadgeCheck, text: 'Verified sellers' },
                { icon: Clock, text: 'Fresh uploads' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  <Icon className="h-4 w-4 text-emerald-500" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-8 rounded-[3rem] bg-emerald-400/20 blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-white/80 bg-white/75 p-4 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <div className="grid grid-cols-2 gap-4">
                {(products.length ? products.slice(0, 4) : placeholderProducts).map((product, index) => (
                  <div key={product.id} className={`overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-lg transition hover:-translate-y-1 dark:bg-slate-800 ${index === 1 ? 'translate-y-8' : ''}`}>
                    <img src={product.image || '/item-placeholder.svg'} alt={product.title} className="aspect-[4/3] w-full object-cover" onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')} />
                    <div className="p-4">
                      <p className="truncate text-sm font-black">{product.title}</p>
                      <p className="mt-1 font-black text-emerald-600">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button key={category.name} onClick={() => navigate(`/listings?category=${category.name}`)} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <span className={`mb-5 inline-flex rounded-2xl px-4 py-2 text-sm font-black ${category.tone}`}>{category.name}</span>
              <h3 className="text-xl font-black">{category.label}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{products.filter((product) => product.category === category.name).length} listings</p>
            </button>
          ))}
        </div>
      </section>

      <PromoBanner />

      <ProductSection title="Trending Products" subtitle="High-interest finds moving fast" icon={TrendingUp} products={trendingProducts} loading={loading} />
      <ProductSection title="Recently Added" subtitle="Fresh listings from your community" icon={Clock} products={recentProducts} loading={loading} />
      <ProductSection title="Recommended Items" subtitle="Good deals worth saving" icon={Zap} products={recommendedProducts} loading={loading} />

      <Link to="/sell" className="fixed bottom-6 right-6 z-30 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 transition hover:-translate-y-1 hover:bg-emerald-600 sm:hidden" aria-label="Sell product">
        <ArrowRight className="h-6 w-6" />
      </Link>
    </main>
  );
};

const ProductSection = ({ title, subtitle, icon: Icon, products, loading }: { title: string; subtitle: string; icon: React.ElementType; products: Product[]; loading: boolean }) => (
  <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
          {title}
        </div>
        <h2 className="text-3xl font-black tracking-tight">{subtitle}</h2>
      </div>
      <Link to="/listings" className="hidden items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950 sm:inline-flex">
        View all
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    {loading ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200 dark:bg-slate-800" />)}</div>
    ) : products.length === 0 ? (
      <div className="rounded-[2rem] border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
        <p className="text-lg font-black">No products yet</p>
        <p className="mt-2 text-sm font-semibold text-slate-500">New uploads will appear here automatically.</p>
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    )}
  </section>
);

const PromoBanner = () => (
  <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl shadow-emerald-950/20 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-black text-emerald-300">Seller boost</p>
          <h2 className="text-3xl font-black tracking-tight">List your item with rich photos and get discovered faster.</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-400">Cloudinary uploads, category filters, and marketplace search help buyers find exactly what you post.</p>
        </div>
        <Link to="/sell" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-0.5">
          Start selling
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

const placeholderProducts: Product[] = [
  { id: 'placeholder-1', title: 'Wooden Study Chair', price: 700, category: 'Furniture', location: 'Campus', image: '/item-placeholder.svg', userId: '', status: 'approved', description: '', condition: 'Like new' },
  { id: 'placeholder-2', title: 'Electric Kettle', price: 450, category: 'Appliances', location: 'Hostel B', image: '/item-placeholder.svg', userId: '', status: 'approved', description: '', condition: 'Good' },
  { id: 'placeholder-3', title: 'Steel Plates Set', price: 220, category: 'Utensils', location: 'PG Block', image: '/item-placeholder.svg', userId: '', status: 'approved', description: '', condition: 'Used' },
  { id: 'placeholder-4', title: 'Room Lamp', price: 350, category: 'Other', location: 'Hostel A', image: '/item-placeholder.svg', userId: '', status: 'approved', description: '', condition: 'Good' },
];

export default Home;
