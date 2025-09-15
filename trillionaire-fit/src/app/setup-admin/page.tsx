'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreateAdmin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }
      
      setMessage(`✅ Admin user created successfully!
      
📧 Email: admin@trillionairefit.com
🔑 Password: admin123

⚠️ Please change the password after first login!

You can now login and access the admin dashboard.`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">TRILLIONAIRE FIT</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-light text-black mb-2">Admin Setup</h2>
          <p className="text-gray-600">Create an admin user to access the admin dashboard</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded whitespace-pre-line">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-black mb-2">Admin Credentials</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> admin@trillionairefit.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ This is a default password. Please change it after first login!
            </p>
          </div>

          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="w-full bg-black text-white py-4 px-6 text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Creating Admin...
              </div>
            ) : (
              'Create Admin User'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              After creating the admin user, you can{' '}
              <a href="/login" className="text-black hover:underline font-medium">
                login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
