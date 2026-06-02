'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, UserPlus, LogIn, Shield, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setValidationErrors([]);
    setSuccess('');
  };

  const getValidationError = (field) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccess('Authentication successful! Logging in...');
      } else {
        await register(email, password, role);
        setSuccess('Registration successful! Redirecting to dashboard...');
      }
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Establishing secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-950">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-brand-200 to-emerald-400 bg-clip-text text-transparent">
            Primetrade.ai
          </h1>
          <p className="text-sm text-slate-400 mt-2">Enterprise Task Management Portal</p>
        </div>

        {/* Card Body */}
        <div className="glass-premium rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
          
          {/* Section Indicator */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 text-brand-400" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  Register Account
                </>
              )}
            </h2>
            
            <button
              onClick={toggleAuthMode}
              type="button"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors focus:outline-none"
            >
              {isLogin ? 'Need an account?' : 'Already registered?'}
            </button>
          </div>

          {/* Form Banner Notifications */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-sm font-medium">
              {success}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-900 border ${getValidationError('email') ? 'border-red-500' : 'border-slate-850'} text-slate-100 placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all`}
                />
              </div>
              {getValidationError('email') && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{getValidationError('email')}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-900 border ${getValidationError('password') ? 'border-red-500' : 'border-slate-850'} text-slate-100 placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all`}
                />
              </div>
              {getValidationError('password') && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{getValidationError('password')}</p>
              )}
            </div>

            {/* Role Field - conditional registration input */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  System Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* User Role Card */}
                  <label
                    htmlFor="role-user"
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      role === 'user'
                        ? 'border-brand-500 bg-brand-950/20 text-slate-100'
                        : 'border-slate-850 bg-slate-900/50 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Standard User</span>
                    </div>
                    <input
                      id="role-user"
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === 'user'}
                      onChange={() => setRole('user')}
                      className="sr-only"
                    />
                  </label>

                  {/* Admin Role Card */}
                  <label
                    htmlFor="role-admin"
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      role === 'admin'
                        ? 'border-brand-500 bg-brand-950/20 text-slate-100'
                        : 'border-slate-850 bg-slate-900/50 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                    <input
                      id="role-admin"
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="sr-only"
                    />
                  </label>

                </div>
                {getValidationError('role') && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{getValidationError('role')}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="submit-auth-btn"
              type="submit"
              disabled={submitting}
              className={`w-full rounded-xl py-3.5 px-4 font-semibold text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isLogin
                  ? 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Please wait...
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign Into Portal
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Intern Account
                </>
              )}
            </button>

          </form>

        </div>

        {/* Technical Stack Tag Footer */}
        <div className="mt-8 text-center text-[11px] text-slate-600 flex justify-center gap-3">
          <span>Next.js App Router</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>JWT Secure Auth</span>
        </div>

      </div>
    </div>
  );
}
