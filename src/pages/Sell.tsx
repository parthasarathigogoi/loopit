import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Camera, Tag, MapPin, ArrowRight, ShieldCheck, HelpCircle, Sparkles, Navigation } from 'lucide-react';
import { createProduct, uploadImage } from '../api';

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const fallbackImageUrl = '/item-placeholder.svg';
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    location: "",
    condition: "Good",
    description: "",
  });
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Utensils", "Appliances", "Furniture", "Other"];

  const mapSrc = locationCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lng - 0.01}%2C${locationCoords.lat - 0.01}%2C${locationCoords.lng + 0.01}%2C${locationCoords.lat + 0.01}&layer=mapnik&marker=${locationCoords.lat}%2C${locationCoords.lng}`
    : '';

  const handleUseCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Location is not supported in this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };
        setLocationCoords(coords);
        setFormData((current) => ({
          ...current,
          location: current.location || `${coords.lat}, ${coords.lng}`,
        }));
        setLocationLoading(false);
      },
      () => {
        setLocationError('Unable to access location. You can still enter it manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let imageUrl = fallbackImageUrl;
      
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
        image: imageUrl,
        locationLat: locationCoords?.lat ?? null,
        locationLng: locationCoords?.lng ?? null,
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
    <div className="min-h-screen bg-slate-50 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mb-6">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">List Your Item</h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto dark:text-slate-300">
            Give your essentials a second home. Simple, fast, and student-only.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-50/60 dark:bg-slate-900 dark:border-slate-800">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-widest dark:text-slate-100">Item Photos</label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-600 hover:text-emerald-600 transition-all bg-gray-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800">
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
                      <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" /> Item Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prestige Kettle"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-600 transition-all font-medium outline-none dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" /> Category
                    </label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-emerald-600 transition-all font-medium appearance-none outline-none dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">₹</span> Price
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-600 transition-all font-medium outline-none dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Location
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hostel A"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-600 transition-all font-medium outline-none dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="text-sm font-bold flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-600" /> Map Location
                      </label>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Use current location to attach precise pickup coordinates.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationLoading}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {locationLoading ? 'Locating...' : 'Use my location'}
                    </button>
                  </div>
                  {locationError && <p className="text-sm font-bold text-rose-600">{locationError}</p>}
                  {locationCoords && (
                    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <iframe title="Selected pickup location map" src={mapSrc} className="h-56 w-full" loading="lazy" />
                      <div className="flex flex-col gap-2 p-4 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>Lat {locationCoords.lat}, Lng {locationCoords.lng}</span>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${locationCoords.lat},${locationCoords.lng}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                          Open in Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Product Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-emerald-600 transition-all font-medium appearance-none outline-none dark:bg-slate-800 dark:text-white"
                  >
                    {["Like new", "Good", "Used", "Needs repair"].map(condition => <option key={condition} value={condition}>{condition}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Condition, age, etc..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-600 transition-all font-medium resize-none outline-none dark:bg-slate-800 dark:text-white"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Posting..." : "Post Item"} <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-950 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-bold">Safe Selling</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-slate-300">
                <li>• Meet in public campus areas</li>
                <li>• Prefer UPI payments</li>
                <li>• Verify Student ID</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
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
