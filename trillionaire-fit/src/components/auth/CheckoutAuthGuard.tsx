'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CheckoutAuthGuardProps {
  children: React.ReactNode;
}

export default function CheckoutAuthGuard({ children }: CheckoutAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLoginPrompt(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">TRILLIONAIRE FIT</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Login Prompt */}
        <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Sign in to continue</h2>
            <p className="text-sm sm:text-base text-gray-600">You need to be signed in to complete your purchase</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-black text-white py-3 sm:py-4 px-6 text-sm sm:text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign in
            </button>

            <button
              onClick={() => router.push('/register')}
              className="w-full bg-white text-black py-3 sm:py-4 px-6 text-sm sm:text-base font-medium border border-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create account
            </button>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-black hover:underline font-medium">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
