import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { login, signup } from '../api';
import { ADMIN_EMAIL, normalizeEmail } from '../constants/admin';
import type { AuthFormData } from '../types/app';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        const response = await signup(formData);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/profile');
      } else {
        const response = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate(normalizeEmail(response.data.email) === normalizeEmail(ADMIN_EMAIL) ? '/admin' : '/profile');
      }
    } catch (authError) {
      console.error(authError);
      setError(authError instanceof Error ? authError.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <section className="hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black">Loopit</span>
          </Link>
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Modern resale starts here
            </div>
            <h1 className="max-w-xl text-6xl font-black leading-[1.02] tracking-tight">Join the smarter way to buy and sell locally.</h1>
            <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-slate-400">Save favorites, message sellers, upload listings, and track your resale activity in one clean dashboard.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Fast uploads', 'Verified flow', 'Green deals'].map((item) => (
              <div key={item} className="rounded-3xl bg-white/10 p-5 text-sm font-black backdrop-blur">{item}</div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="text-2xl font-black">Loopit</span>
              </Link>
            </div>
            <div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-3xl font-black tracking-tight">{isSignup ? 'Create account' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {isSignup ? 'Already selling on Loopit?' : 'New to Loopit?'}{' '}
                <button onClick={() => { setIsSignup((value) => !value); setError(''); }} className="font-black text-emerald-600">
                  {isSignup ? 'Login' : 'Sign up'}
                </button>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-black transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <Mail className="h-4 w-4" />
                  Google
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-black transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <ShieldCheck className="h-4 w-4" />
                  Student ID
                </button>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {isSignup && (
                  <Input label="Full name" value={formData.name || ''} placeholder="Rahul Sharma" onChange={(value) => setFormData({ ...formData, name: value })} />
                )}
                <Input label="Email" type="email" value={formData.email} placeholder="you@college.edu" onChange={(value) => setFormData({ ...formData, email: value })} />
                <div>
                  <label className="mb-2 block text-sm font-black">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="••••••••" required className="w-full rounded-2xl bg-slate-100 px-5 py-4 pr-14 font-semibold outline-none transition focus:ring-4 focus:ring-emerald-100 dark:bg-slate-800" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-4 text-slate-400" aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isSignup && <button type="button" className="text-sm font-black text-emerald-600">Forgot password?</button>}

                {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

                <button disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-4 text-lg font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-60">
                  {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) => (
  <div>
    <label className="mb-2 block text-sm font-black">{label}</label>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required className="w-full rounded-2xl bg-slate-100 px-5 py-4 font-semibold outline-none transition focus:ring-4 focus:ring-emerald-100 dark:bg-slate-800" />
  </div>
);

export default Login;
