'use client';

import React from 'react';
import StripePaymentButton from '@/components/payment/StripePaymentButton';

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Stripe Payment Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test the Stripe payment integration with this demo form.
            Make sure to configure your environment variables before testing.
          </p>
        </div>

        {/* Payment Form */}
        <div className="flex justify-center">
          <StripePaymentButton amount={5000} />
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Testing Instructions
          </h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                1
              </span>
              <p>Ensure your <code className="bg-blue-100 px-2 py-1 rounded text-sm">.env.local</code> file contains your Stripe keys</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                2
              </span>
              <p>Use test card number: <strong>4242 4242 4242 4242</strong> (Visa)</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                3
              </span>
              <p>Use any future expiry date (e.g., 12/25) and any 3-digit CVC</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-sm font-semibold mr-3 mt-0.5">
                4
              </span>
              <p>Check the admin panel to see recorded transactions</p>
            </div>
          </div>
        </div>

        {/* Environment Check */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            Environment Variables Check
          </h3>
          <div className="space-y-2 text-yellow-800">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-3 bg-gray-400"></span>
              <span>STRIPE_SECRET_KEY: 🔒 Server-side only</span>
            </div>
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${process.env.MONGODB_URI ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>MONGODB_URI: {process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}</span>
            </div>
          </div>
          {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
            <p className="mt-4 text-sm text-yellow-700">
              Please configure your Stripe keys in <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> to test payments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
