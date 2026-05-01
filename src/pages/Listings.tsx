import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/mockData';
import type { Product } from '../types/app';

const Listings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState(5000);
  const [condition, setCondition] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

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

  const updateFilters = (updates: { category?: string; search?: string }) => {
    const nextParams = new URLSearchParams(searchParams);
    if (updates.category !== undefined) {
      if (updates.category === 'All') {
        nextParams.delete('category');
      } else {
        nextParams.set('category', updates.category);
      }
    }
    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        nextParams.set('search', updates.search);
      } else {
        nextParams.delete('search');
      }
    }
    setSearchParams(nextParams, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !query || product.title.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesCondition = condition === 'All' || product.condition === condition;
      return matchesSearch && matchesCategory && matchesCondition && product.price <= priceRange;
    });
  }, [condition, priceRange, products, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-emerald-100 bg-white/70 px-4 py-10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Marketplace
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Explore Loopit deals</h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-slate-600 dark:text-slate-300">
                Search, filter, favorite, and discover second-hand products from sellers around you.
              </p>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => updateFilters({ search: event.target.value })}
                placeholder="Search items..."
                className="w-full rounded-full border border-slate-200 bg-white py-4 pl-12 pr-5 text-sm font-bold outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-emerald-500" />
            <h2 className="font-black">Filters</h2>
          </div>

          <div className="space-y-7">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Categories</p>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => updateFilters({ category })}
                    className={`rounded-2xl px-4 py-2.5 text-left text-sm font-black transition ${
                      selectedCategory === category
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Condition</p>
              <select value={condition} onChange={(event) => setCondition(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950">
                {['All', 'Like new', 'Good', 'Used', 'Needs repair'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Max Price</p>
              <input type="range" min="0" max="5000" step="100" value={priceRange} onChange={(event) => setPriceRange(Number(event.target.value))} className="w-full accent-emerald-500" />
              <div className="mt-2 flex justify-between text-sm font-black text-emerald-600">
                <span>₹0</span>
                <span>₹{priceRange}</span>
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-black text-slate-500">{filteredProducts.length} products found</p>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">Infinite scroll ready</span>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[1.75rem] bg-slate-200 dark:bg-slate-800" />)}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl font-black">No items found</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">Try a different search, category, condition, or price range.</p>
              <button onClick={() => { updateFilters({ category: 'All', search: '' }); setCondition('All'); setPriceRange(5000); }} className="mt-5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Listings;
