import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { fetchProducts } from '../api';
import type { Product } from '../types/app';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recentListings, setRecentListings] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await fetchProducts();
        setAllProducts(data);
        setRecentListings(data.slice(0, 4));
      } catch (error: unknown) {
        console.error(error);
      }
    };
    getProducts();
  }, []);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return allProducts.length;
    return allProducts.filter(p => p.category === category).length;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/listings');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-indigo-50 to-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Don't throw it. <br />
              <span className="text-indigo-600">LoopIt.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              The student marketplace for used utensils and household items. 
              Built for students, by students. Save money, live circular.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                placeholder="Search for induction, plates, kettle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-100 bg-white shadow-2xl shadow-indigo-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-lg"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-2xl font-semibold hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Find Deals
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <MapPin className="w-4 h-4 text-indigo-500" /> All Hostels
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Student Verified
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <Clock className="w-4 h-4 text-blue-500" /> Daily Updates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
              <p className="text-gray-600 mt-2">Find exactly what you need for your room</p>
            </div>
            <Link to="/listings" className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Utensils", icon: "🥣", color: "bg-blue-100 text-blue-600" },
              { name: "Appliances", icon: "☕", color: "bg-yellow-100 text-yellow-600" },
              { name: "Furniture", icon: "🛏️", color: "bg-orange-100 text-orange-600" },
              { name: "Other", icon: "📦", color: "bg-green-100 text-green-600" },
            ].map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => navigate(`/listings?category=${cat.name}`)}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-2xl mb-6`}>
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-500">{getCategoryCount(cat.name)} listings</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recently Added</h2>
            <p className="text-gray-600 mt-2">New items from students leaving campus</p>
          </div>
          <Link to="/listings" className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {recentListings.map((listing) => (
            <Link key={listing.id} to={`/product/${listing.id}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={listing.image} 
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  crossOrigin="anonymous"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {listing.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {listing.title}
                  </h3>
                  <span className="text-lg font-extrabold text-indigo-600">₹{listing.price}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs text-gray-400 font-medium">By {listing.seller?.name || 'Student'}</span>
                  <span className="text-sm font-bold text-indigo-600">Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;
