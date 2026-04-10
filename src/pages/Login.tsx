import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Phone, Lock } from 'lucide-react';
import { login, signup } from '../api';
import { sendOTP, verifyOTP, resetPhoneAuth } from '../services/phoneAuth';

type SignupStep = 'form' | 'phone-verification' | 'complete';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "+91"
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const handlePhoneSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate phone
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(formData.phone);
      setMessage('OTP sent to your phone!');
      setSignupStep('phone-verification');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOTP(otp);
      setVerifiedPhone(formData.phone);
      setMessage('Phone verified! Creating account...');
      
      // Now create the account
      setTimeout(() => handleCreateAccount(), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const response = await signup({
        ...formData,
        phone: verifiedPhone
      });
      localStorage.setItem('user', JSON.stringify(response.data));
      resetPhoneAuth();
      navigate('/profile');
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Account creation failed");
      setSignupStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignup) {
        // Start phone verification during signup
        setSignupStep('phone-verification');
        await sendOTP(formData.phone);
        setMessage('OTP sent to your phone!');
      } else {
        // Regular login
        const response = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/profile');
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setSignupStep('form');
    setError('');
    setMessage('');
    setOtp('');
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "+91"
    });
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
            onClick={handleToggleMode}
            className="text-indigo-600 font-bold hover:underline"
          >
            {isSignup ? "Login here" : "Sign up here"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl shadow-indigo-100/50 border border-gray-100 sm:rounded-[2rem]">
          {!isSignup ? (
            // LOGIN FORM
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
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

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Please wait..." : "Login"} <ArrowRight className="w-6 h-6" />
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
          ) : signupStep === 'form' ? (
            // SIGNUP FORM - STEP 1
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  WhatsApp Number
                </label>
                <input 
                  type="text" 
                  placeholder="+919876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-medium outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">We'll verify this number via OTP</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
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

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-medium">{message}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || formData.phone.length < 10}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Verify Phone & Create Account"} <ArrowRight className="w-6 h-6" />
              </button>
            </form>
          ) : (
            // OTP VERIFICATION - STEP 2
            <form className="space-y-6" onSubmit={handlePhoneVerifyOTP}>
              <div className="text-center">
                <p className="text-gray-700 font-semibold mb-2">Verify Your Phone Number</p>
                <p className="text-gray-600 text-sm">{formData.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Enter OTP
                </label>
                <input 
                  type="text" 
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setOtp(value);
                  }}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-center text-2xl tracking-widest outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">Enter the 6-digit OTP sent to your phone</p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-medium">{message}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Create Account"} <ArrowRight className="w-6 h-6" />
              </button>

              <button 
                type="button"
                onClick={() => setSignupStep('form')}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Back to Form
              </button>
            </form>
          )}
        </div>
      </div>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50"></div>
    </div>
  );
};

export default Login;
