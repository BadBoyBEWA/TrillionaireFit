'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { useAuth } from '@/context/AuthContext';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import CheckoutAuthGuard from '@/components/auth/CheckoutAuthGuard';
import PaystackPaymentButton from '@/components/payment/PaystackPaymentButton';
import { useToast } from '@/hooks/useToast';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export default function CheckoutPage() {
  return (
    <CheckoutAuthGuard>
      <CheckoutContent />
    </CheckoutAuthGuard>
  );
}

function CheckoutContent() {
  const { state, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useNavigationWithLoading();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cash_on_delivery'>('paystack');

  const shipping = subtotal > 50000 ? 0 : 2000; // Free shipping over ₦50,000
  const tax = Math.round(subtotal * 0.075); // 7.5% VAT
  const total = subtotal + shipping + tax;
  
  // Cash on Delivery: 50% upfront payment
  const upfrontPayment = paymentMethod === 'cash_on_delivery' ? Math.round(total * 0.5) : total;
  const remainingPayment = paymentMethod === 'cash_on_delivery' ? total - upfrontPayment : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Paystack payment success
  const handlePaymentSuccess = async (transaction: any) => {
    try {
      setIsProcessingPayment(true);
      
      // Update order with payment details
      const updateResponse = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'paid',
          paymentDetails: {
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            currency: transaction.currency,
            method: 'paystack'
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update order with payment details');
      }

      showToast('Payment successful! Your order has been confirmed.', 'success');
      clearCart();
      navigate(`/checkout/success?order=${orderId}`);
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Payment successful but failed to update order. Please contact support.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Paystack payment error
  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    showToast('Payment failed. Please try again.', 'error');
    setIsProcessingPayment(false);
  };

  // Handle form submission for order creation
  const handleOrderCreation = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderItems: OrderItem[] = state.items.map(item => ({
        productId: item.product._id || item.product.id || '',
        quantity: item.quantity,
        price: item.product.price
      }));

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: formData,
          paymentMethod,
          notes: ''
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      setOrderId(orderData.order.id);
      setOrderCreated(true);

      // For cash on delivery, redirect immediately
      if (paymentMethod === 'cash_on_delivery') {
        navigate(`/checkout/success?order=${orderData.order.id}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (orderCreated && paymentMethod === 'cash_on_delivery') {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed and will be delivered to your address.
        </p>
        <button 
          onClick={() => {
            clearCart();
            navigate('/');
          }}
          className="btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const hasItems = state.items.length > 0;

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
              Checkout
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
          {/* Checkout Form */}
          <section className="lg:col-span-2">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-light text-black mb-2">Checkout</h1>
              <p className="text-sm sm:text-base text-gray-600">Complete your purchase</p>
            </div>

            {!hasItems ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-luxury-heading text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 font-luxury-body">Add some items to your cart to continue</p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-black text-black text-sm sm:text-base font-luxury-elegant hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Shipping Information */}
                <div>
                  <h2 className="text-lg sm:text-xl font-luxury-heading text-black mb-4 sm:mb-6">Shipping Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-luxury-elegant text-black mb-2">First name *</label>
                        <input 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                          placeholder="Enter your first name" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-luxury-elegant text-black mb-2">Last name *</label>
                        <input 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                          placeholder="Enter your last name" 
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-luxury-elegant text-black mb-2">Email address *</label>
                      <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                        placeholder="Enter your email" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-luxury-elegant text-black mb-2">Phone number *</label>
                      <input 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                        placeholder="+234 800 000 0000" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-luxury-elegant text-black mb-2">Address *</label>
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                        placeholder="Enter your address" 
                        rows={3}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-luxury-elegant text-black mb-2">City *</label>
                        <input 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                          placeholder="Enter your city" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-luxury-elegant text-black mb-2">State *</label>
                        <input 
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                          placeholder="Enter your state" 
                          required 
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-luxury-elegant text-black mb-2">ZIP code *</label>
                        <input 
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-0 py-3 border-0 border-b border-gray-300 focus:border-black focus:ring-0 text-sm sm:text-base placeholder-gray-400 bg-transparent transition-colors" 
                          placeholder="Enter your ZIP" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg sm:text-xl font-luxury-elegant text-black mb-4 sm:mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'paystack')}
                        className="text-blue-600"
                      />
                      <div>
                        <span className="font-medium">Paystack</span>
                        <p className="text-sm text-gray-600">Card payments, Bank transfers, USSD</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash_on_delivery')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-600">Pay 50% now, 50% on delivery</p>
                        {paymentMethod === 'cash_on_delivery' && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>• Upfront: ₦{upfrontPayment.toFixed(2)}</p>
                            <p>• On delivery: ₦{remainingPayment.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </label>
          </div>
          </div>

                {/* Payment Button */}
                {!orderCreated ? (
                  <button
                    onClick={handleOrderCreation}
                    disabled={loading}
                    className="w-full bg-black text-white py-3 sm:py-4 px-6 text-sm sm:text-base font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Order...' : 'Continue to Payment'}
                  </button>
                ) : paymentMethod === 'paystack' ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      Order created successfully! Complete your payment below.
                    </div>
                    <PaystackPaymentButton
                      amount={upfrontPayment}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      customerEmail={formData.email}
                      customerPhone={formData.phone}
                      currency="NGN"
                      orderId={orderId}
                      orderNumber={orderId} // You might want to get the actual order number
                      userId={user?.userId}
                      disabled={isProcessingPayment}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      className="w-full"
                    />
                  </div>
                ) : null}
              </div>
            )}
      </section>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-luxury-elegant text-black mb-4 sm:mb-6">Order Summary</h2>
              
          {hasItems ? (
                <div className="space-y-3 sm:space-y-4">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-luxury-elegant text-black truncate">{item.product.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{item.product.designer}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-xs sm:text-sm font-luxury-elegant text-black flex-shrink-0">
                        ₦{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                </div>
              ))}
                  
                  <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                      <span>₦{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `₦${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (7.5%)</span>
                      <span>₦{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-luxury-elegant text-black">
                      <span>Total</span>
                      <span>₦{total.toFixed(2)}</span>
                    </div>
                    {paymentMethod === 'cash_on_delivery' && (
                      <>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Upfront Payment (50%)</span>
                            <span>₦{upfrontPayment.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Remaining (on delivery)</span>
                            <span>₦{remainingPayment.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
              </div>
            </div>
          ) : (
                <p className="text-sm sm:text-base text-gray-600">No items in cart</p>
          )}
        </div>
      </aside>
        </div>
      </div>
    </div>
  );
}
