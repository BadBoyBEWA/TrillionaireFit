'use client';

import React from 'react';

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple Test Page
        </h1>
        <p className="text-lg text-gray-600">
          This is a simple test page to check if the server is working.
        </p>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Environment Variables Check
          </h3>
          <div className="space-y-2 text-blue-800">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-3 ${process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>NEXT_PUBLIC_FLW_PUBLIC_KEY: {process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY ? '✅ Set' : '❌ Missing'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-3 bg-gray-400"></span>
              <span>FLW_SECRET_KEY: 🔒 Server-side only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
