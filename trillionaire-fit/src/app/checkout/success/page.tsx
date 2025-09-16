'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    designer: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  payment?: {
    status: string;
  };
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const { navigate } = useNavigationWithLoading();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data.order);
        
        // If order is still pending, try to verify payment
        if (data.order && data.order.status === 'pending') {
          await verifyPayment(data.order.orderNumber);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const verifyPayment = async (orderNumber: string) => {
    try {
      setVerifyingPayment(true);
      
      const response = await fetch('/api/payments/paystack/manual-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: orderNumber })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(prev => prev ? { ...prev, status: 'confirmed', payment: { ...prev.payment, status: 'completed' } } : prev);
        console.log('Payment verified successfully');
      } else {
        console.log('Payment verification failed, but continuing...');
      }
    } catch (err) {
      console.log('Payment verification error:', err);
    } finally {
      setVerifyingPayment(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">TRILLIONAIRE FIT</h1>
            </div>
            <div className="text-sm text-gray-500">
              Order Confirmation
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Message */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-green-600 text-6xl sm:text-8xl mb-4">✓</div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-black mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="bg-gray-100 px-4 py-2 rounded-lg inline-block">
            <span className="text-sm font-medium text-gray-700">Order #</span>
            <span className="text-sm font-mono text-black ml-1">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Items */}
          <div>
            <h2 className="text-lg font-semibold text-black mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">IMG</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-black truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600">{item.designer}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-black">
                    ₦{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-black mb-4">Order Summary</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Status</span>
                <span className={`text-sm font-medium ${
                  order.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <span className={`text-sm font-medium ${
                  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-sm font-semibold text-black">₦{order.total.toFixed(2)}</span>
              </div>
              {order.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estimated Delivery</span>
                  <span className="text-sm text-black">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-black mb-3">Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.email}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment verification status */}
        {verifyingPayment && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <p className="text-sm text-gray-600">Verifying payment...</p>
            </div>
          </div>
        )}


        {/* Action Buttons */}
        <div className="mt-8 sm:mt-12 text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 border border-black text-black font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
