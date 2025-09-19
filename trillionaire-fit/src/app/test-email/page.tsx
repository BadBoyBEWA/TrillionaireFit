'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState('test');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || user?.email,
          type: emailType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setError(`❌ ${data.error}`);
      }
    } catch (err) {
      setError('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-luxury-display text-black mb-2">Email Test Center</h1>
            <p className="text-gray-600 font-luxury-body">
              Test your email configuration and templates
            </p>
          </div>

          <form onSubmit={handleTestEmail} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-luxury-elegant text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user?.email || "Enter email address"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-luxury-body"
                required
              />
            </div>

            <div>
              <label htmlFor="emailType" className="block text-sm font-luxury-elegant text-black mb-2">
                Email Type
              </label>
              <select
                id="emailType"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-luxury-body"
              >
                <option value="test">Simple Test Email</option>
                <option value="password-reset">Password Reset Email</option>
                <option value="order-confirmation">Order Confirmation Email</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-luxury-elegant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-luxury-body">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-luxury-body">{error}</p>
            </div>
          )}

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-luxury-heading text-black mb-4">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600 font-luxury-body">
              <p><strong>1. Configure Email Service:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">node setup-email.js</code></li>
                <li>Or manually create <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> file</li>
                <li>See <code className="bg-gray-200 px-2 py-1 rounded">EMAIL_SETUP.md</code> for details</li>
              </ul>
              
              <p><strong>2. Required Environment Variables:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className="bg-gray-200 px-2 py-1 rounded">SMTP_HOST</code> - Email service host</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">SMTP_PORT</code> - Port (usually 587)</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded">SMTP_USER</code> - Your email username</li>
                <li><code className="bg-gray-200 px-2 py-2 rounded">SMTP_PASS</code> - Your email password/app key</li>
              </ul>

              <p><strong>3. Test Different Email Types:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Simple Test:</strong> Basic email functionality</li>
                <li><strong>Password Reset:</strong> Password reset template</li>
                <li><strong>Order Confirmation:</strong> Order confirmation template</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-black hover:underline font-luxury-elegant"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
