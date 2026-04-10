import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Settings, LogOut, ShieldCheck, Heart, Edit3, Trash2 } from 'lucide-react';
import { fetchUserProducts, deleteProduct } from '../api';
import { auth } from '../firebase';

interface User {
  name?: string;
  email?: string;
  uid?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check Firebase Auth first
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        // User not authenticated, redirect to login
        navigate('/phone-login');
        setAuthLoading(false);
        return;
      }

      // Get user from localStorage or Firebase
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setUser({
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || 'No email',
            uid: firebaseUser.uid,
          });
        }
      } else {
        setUser({
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || 'No email',
          uid: firebaseUser.uid,
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch user data after auth is confirmed
  useEffect(() => {
    if (authLoading || !user) return;

    const getUserData = async () => {
      try {
        const { data } = await fetchUserProducts();
        setUserListings(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setUserListings([]);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteProduct(id);
        setUserListings(userListings.filter(l => l._id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      navigate('/phone-login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    }
  };

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Safety check - should not reach here due to auth redirect, but just in case
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <p className="text-red-600 font-semibold">Unable to load profile. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
              <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-indigo-600 font-black text-4xl mx-auto mb-6">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <h2 className="text-xl font-black text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">{user?.email || 'No email'}</p>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full inline-flex">
                <ShieldCheck className="w-4 h-4" /> Verified Student
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                <button className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-bold group">
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-white" /> Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold group"
                >
                  <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Active Listings", value: userListings.length, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Total Views", value: 234, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
                { label: "Items Sold", value: 12, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-6 group hover:-translate-y-1 transition-all">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* My Listings */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-gray-900">Manage Listings</h2>
                <Link to="/sell" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                  + Add New Item
                </Link>
              </div>

              <div className="space-y-6">
                {userListings.map((listing) => (
                  <div key={listing._id} className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-full sm:w-32 aspect-square rounded-2xl overflow-hidden shadow-md">
                      <img src={listing.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{listing.title}</h3>
                      <p className="text-2xl font-black text-indigo-600 mt-2">₹{listing.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to={`/product/${listing._id}`} className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <Edit3 className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(listing._id)}
                        className="p-4 bg-gray-100 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
