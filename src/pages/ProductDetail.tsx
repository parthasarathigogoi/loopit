import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, MessageCircle, ArrowLeft, ShieldCheck, Share2, Heart } from 'lucide-react';
import { fetchProduct } from '../api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      try {
        if (id) {
          const { data } = await fetchProduct(id);
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
        <Link to="/listings" className="text-indigo-600 font-bold hover:underline">Back to marketplace</Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${product.seller?.phone}?text=Hi ${product.seller?.name}, I'm interested in your ${product.title} listed on LoopIt.`;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-600 hover:text-red-500 shadow-lg transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-black text-indigo-600">₹{product.price}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-medium bg-gray-50 px-4 py-2.5 rounded-2xl inline-flex">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {product.location}
              </div>
            </div>

            <div className="space-y-8">
              {/* WhatsApp Contact Action */}
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 shadow-xl shadow-green-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-6 h-6" /> Contact via WhatsApp
              </a>

              {/* Description */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Seller Profile</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <ShieldCheck className="w-4 h-4 fill-yellow-500" />
                    <span className="text-sm font-bold">Student Verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {product.seller?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{product.seller?.name || 'Student'}</h4>
                    <p className="text-sm text-gray-500 font-medium mt-1">Local Student Seller</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 text-sm font-semibold transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
