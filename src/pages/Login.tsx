import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { login, signup } from '../api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = isSignup ? await signup(formData) : await login({ email: formData.email, password: formData.password });
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/profile');
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-indigo-600 tracking-tight">LoopIt</span>
        </Link>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          {isSignup ? "Create an account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          {isSignup ? "Already have an account? " : "New to LoopIt? "}
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isSignup ? "Login here" : "Sign up here"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl shadow-indigo-100/50 border border-gray-100 sm:rounded-[2rem]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                  <input 
                    type="text" 
                    placeholder="+919876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">College Email</label>
              <input 
                type="email" 
                placeholder="rahul@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Please wait..." : (isSignup ? "Create Account" : "Login")} <ArrowRight className="w-6 h-6" />
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">Or</span>
              </div>
            </div>

            <Link
              to="/phone-login"
              className="w-full py-5 border-2 border-gray-200 text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              Continue with Phone OTP
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
