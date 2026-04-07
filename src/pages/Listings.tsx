import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { fetchProducts } from '../api';
import { categories } from '../data/mockData';

const Listings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(2000);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await fetchProducts();
        setListings(data);
      } catch (error) {
        console.error(error);
      }
    };
    getProducts();
  }, []);

  const filteredListings = listings.filter(item => 
    (selectedCategory === "All" || item.category === selectedCategory) &&
    item.price <= priceRange
  );

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Marketplace</h1>
            <p className="text-gray-500 mt-1">Discover great deals from fellow students</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search items..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-600 hover:bg-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Price Range</h3>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-sm font-bold text-indigo-600">
                <span>₹0</span>
                <span>₹{priceRange}</span>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredListings.map((listing) => (
                <Link key={listing._id} to={`/product/${listing._id}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
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
                      <span className="text-sm font-bold text-indigo-600">View Details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {filteredListings.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No items found matching your filters.</p>
                <button 
                  onClick={() => {setSelectedCategory("All"); setPriceRange(2000);}}
                  className="mt-4 text-indigo-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listings;
