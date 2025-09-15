"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCSRF } from "@/hooks/useCSRF";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const { getCSRFHeaders, loading: csrfLoading, error: csrfError } = useCSRF();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const csrfHeaders = getCSRFHeaders();
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeaders,
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setMessage("✅ Login successful!");
        router.push("/");
      } else {
        setMessage(`❌ ${data.error || "Login failed"}`);
      }
    } catch (err) {
      setMessage("⚠️ Network error, check backend connection.");
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
              New to Trillionaire Fit?{' '}
              <a href="/register" className="text-black font-medium hover:underline">
                Create an account
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">Welcome back</h2>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your account</p>
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-0 py-3 pr-10 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
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
          </div>

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-xs sm:text-sm text-black hover:underline font-medium"
            >
              Forgot your password?
            </a>
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
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Mobile register link */}
        <div className="mt-4 sm:hidden text-center">
          <p className="text-sm text-gray-600">
            New to Trillionaire Fit?{' '}
            <a href="/register" className="text-black font-medium hover:underline">
              Create an account
            </a>
          </p>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-black hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-black hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}