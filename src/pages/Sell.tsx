import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Camera, Tag, MapPin, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { createProduct, uploadImage } from '../api';

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    location: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Utensils", "Appliances", "Furniture", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let imageUrl = 'https://via.placeholder.com/400';
      
      // Upload image if provided (non-blocking - use fallback if upload fails)
      if (imageFile) {
        try {
          const { data: uploadData } = await uploadImage(imageFile);
          imageUrl = uploadData.url;
        } catch (uploadError) {
          console.warn('Image upload failed, using placeholder:', uploadError);
          // Continue with placeholder image - don't block product creation
        }
      }
      
      // Create Product
      await createProduct({
        ...formData,
        price: Number(formData.price),
        image: imageUrl
      });
      
      alert('Product posted successfully!');
      navigate('/listings');
    } catch (error) {
      console.error(error);
      alert("Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl mb-6">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">List Your Item</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Give your essentials a second home. Simple, fast, and student-only.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-50/50">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-900 uppercase tracking-widest">Item Photos</label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-600 hover:text-indigo-600 transition-all bg-gray-50 cursor-pointer">
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-bold">{imageFile ? "Change Photo" : "Add Photo"}</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {imageFile && (
                      <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" /> Item Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prestige Kettle"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" /> Category
                    </label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all font-medium appearance-none outline-none"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-indigo-600 font-bold">₹</span> Price
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" /> Location
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hostel A"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Condition, age, etc..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none outline-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Post Item"} <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-bold">Safe Selling</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-indigo-100">
                <li>• Meet in public campus areas</li>
                <li>• Prefer UPI payments</li>
                <li>• Verify Student ID</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
              <div className="flex items-center gap-3 mb-6 text-gray-900">
                <HelpCircle className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold">Quick Tips</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-gray-500">
                <li>• Mention any warranty</li>
                <li>• Be honest about scratches</li>
                <li>• Good lighting helps sell 2x faster</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
