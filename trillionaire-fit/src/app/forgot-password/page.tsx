'use client';

import { useState } from 'react';
import { useCSRF } from '@/hooks/useCSRF';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { getCSRFHeaders, loading: csrfLoading, error: csrfError } = useCSRF();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const csrfHeaders = getCSRFHeaders();
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ If an account with that email exists, we have sent password reset instructions.');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (csrfLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (csrfError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="text-red-600 mb-4 text-lg font-medium">⚠️ Security Error</div>
            <p className="text-gray-600 mb-6">{csrfError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-black text-white px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">TRILLIONAIRE FIT</h1>
            </div>
            <div className="hidden sm:block text-sm text-gray-500">
              Remember your password?{' '}
              <a href="/login" className="text-black font-medium hover:underline">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Forgot password?</h2>
          <p className="text-sm sm:text-base text-gray-600">Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>

          {message && (
            <div className={`text-sm p-4 rounded-none border-l-4 ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border-green-400' 
                : 'bg-red-50 text-red-800 border-red-400'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 sm:py-4 px-6 text-sm sm:text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                Sending reset link...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        {/* Mobile login link */}
        <div className="mt-4 sm:hidden text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-black font-medium hover:underline">Sign in</a>
          </p>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-black hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}