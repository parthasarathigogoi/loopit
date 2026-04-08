import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { sendOTP, verifyOTP, resetPhoneAuth } from '../services/phoneAuth';
import { auth } from '../firebase';

type AuthStep = 'phone' | 'otp' | 'success';

const PhoneLogin: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [userPhone, setUserPhone] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Check if already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate phone number
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phoneNumber);
      setUserPhone(phoneNumber);
      setStep('otp');
      setMessage('OTP sent successfully! Check your phone.');
      setResendTimer(30); // 30 seconds cooldown
      setPhoneNumber(''); // Clear phone field
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(otp);
      setStep('success');
      setMessage('Phone number verified successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        resetPhoneAuth();
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setOtp('');
    setLoading(true);

    try {
      await sendOTP(userPhone);
      setMessage('OTP resent successfully!');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setPhoneNumber(userPhone);
    setError('');
    setMessage('');
    resetPhoneAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* reCAPTCHA Container */}
      <div id="recaptcha-container" className="fixed bottom-0 right-0 z-50"></div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-6">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">LoopIt</h1>
          <p className="text-white/80">Sign in with your phone number</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 outline-none transition-all bg-gray-50 text-lg font-medium"
                />
                <p className="text-xs text-gray-500 mt-2">
                  ℹ️ Enter your phone number with country code (e.g., +91 for India)
                </p>
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
                disabled={loading || phoneNumber.length < 10}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Sign in with email
                </button>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <p className="text-center text-gray-600 mb-6">
                  <strong>OTP sent to {userPhone}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, '');
                    setOtp(value);
                  }}
                  disabled={loading}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 outline-none transition-all bg-gray-50 text-2xl font-bold text-center tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the 6-digit OTP sent to your phone
                </p>
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
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    disabled={loading}
                    className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || resendTimer > 0}
                    className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <p className="text-center text-gray-500 text-xs">
                  Didn't receive the OTP? Check your spam folder or try resending.
                </p>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full animate-pulse">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to LoopIt!
                </h2>
                <p className="text-gray-600">
                  Your phone number has been verified successfully.
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Redirecting to homepage...
              </p>

              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div className="bg-green-600 h-full w-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          We'll never share your phone number. Authentication is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default PhoneLogin;
