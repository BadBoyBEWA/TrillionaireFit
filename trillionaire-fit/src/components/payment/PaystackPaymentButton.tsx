'use client';

import React, { useState } from 'react';

interface PaystackPaymentButtonProps {
  amount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  currency?: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (transaction: any) => void;
  onError?: (error: any) => void;
}

export default function PaystackPaymentButton({ 
  amount = 5000,
  customerName,
  customerEmail,
  customerPhone,
  currency = 'NGN',
  orderId,
  orderNumber,
  userId,
  className = '',
  disabled = false,
  onSuccess,
  onError
}: PaystackPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || isLoading) return;
    
    try {
      setIsLoading(true);
      
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          orderId,
          email: customerEmail
        }),
      });
      
      const data = await res.json();
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        console.error('Paystack checkout error:', data.error);
        const errorMessage = data.error || 'Unknown error';
        if (onError) {
          onError(errorMessage);
        } else {
          alert('Payment failed: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('Paystack checkout error:', error);
      const errorMessage = (error as Error).message;
      if (onError) {
        onError(errorMessage);
      } else {
          alert('Payment failed: ' + errorMessage);
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`
        w-full bg-black text-white py-3 sm:py-4 px-6 text-sm sm:text-base font-medium 
        hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 
        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] 
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        `Pay ₦${amount.toLocaleString()} with Paystack`
      )}
    </button>
  );
}

