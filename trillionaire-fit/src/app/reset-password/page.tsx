'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCSRF } from '@/hooks/useCSRF';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(95); // 1 minute 35 seconds (90 + 5 second buffer)
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCSRFHeaders, loading: csrfLoading, error: csrfError } = useCSRF();

  // Extract token from URL
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setMessage('❌ Invalid or missing reset token');
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (token && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setMessage('❌ Reset link has expired. Please request a new one.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [token, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8 || password.length > 15) {
      setMessage('❌ Password must be between 8 and 15 characters');
      setLoading(false);
      return;
    }

    try {
      const csrfHeaders = getCSRFHeaders();
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
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
          <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Reset password</h2>
          <p className="text-sm sm:text-base text-gray-600">Enter your new password</p>
          {timeLeft > 0 && (
            <div className="mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 rounded-full">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Link expires in {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || timeLeft <= 0}
                className="w-full px-0 py-3 pr-10 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || timeLeft <= 0}
              >
                {showPassword ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Password must be 8-15 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || timeLeft <= 0}
                className="w-full px-0 py-3 pr-10 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || timeLeft <= 0}
              >
                {showConfirmPassword ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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

          {timeLeft <= 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Your reset link has expired. Please request a new one.
              </p>
              <a
                href="/forgot-password"
                className="text-black font-medium hover:underline"
              >
                Request new reset link
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || timeLeft <= 0}
            className="w-full bg-black text-white py-3 sm:py-4 px-6 text-sm sm:text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2"></div>
                Resetting password...
              </div>
            ) : (
              'Reset password'
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