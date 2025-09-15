// Paystack configuration and utilities

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

export const paystackConfig: PaystackConfig = {
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'
};

export interface PaystackTransaction {
  reference: string;
  amount: number;
  email: string;
  currency: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: Record<string, any>;
      risk_action: string;
      international_format_phone: string;
    };
    plan: any;
    split: any;
    order_id: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any;
    source: any;
    fees_breakdown: any;
  };
}

// Initialize Paystack transaction
export async function initializePaystackTransaction(transaction: PaystackTransaction): Promise<PaystackResponse> {
  const response = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${paystackConfig.secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transaction)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

// Verify Paystack transaction
export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`${paystackConfig.baseUrl}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${paystackConfig.secretKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return response.json();
}

// Format amount for Paystack (convert to kobo for NGN)
export function formatAmountForPaystack(amount: number, currency: string = 'NGN'): number {
  if (currency === 'NGN') {
    return Math.round(amount * 100); // Convert to kobo
  }
  return Math.round(amount * 100); // Convert to cents for other currencies
}

// Format amount from Paystack (convert from kobo to NGN)
export function formatAmountFromPaystack(amount: number, currency: string = 'NGN'): number {
  if (currency === 'NGN') {
    return amount / 100; // Convert from kobo
  }
  return amount / 100; // Convert from cents for other currencies
}
