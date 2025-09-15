# Paystack Integration Setup Guide

## Step 1: Get Paystack Credentials

1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up or log in to your account
3. Go to **Settings** > **API Keys & Webhooks**
4. Copy your **Test Public Key** and **Test Secret Key**

## Step 2: Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_BASE_URL=https://api.paystack.co

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 3: Install Paystack Package

Run this command in your terminal:

```bash
npm install @paystack/inline-js
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Add items to your cart
3. Go to checkout
4. Fill in shipping information
5. Select "Paystack" as payment method
6. Click "Pay with Paystack"
7. You'll be redirected to Paystack's payment page

## Step 5: Test Payment

Use these test card numbers:

- **Successful Payment**: 4084084084084081
- **Failed Payment**: 4000000000000002
- **Insufficient Funds**: 4000000000009995

**CVV**: Use any 3 digits
**Expiry**: Use any future date

## Step 6: Webhook Setup (Optional)

For production, set up webhooks:

1. Go to **Settings** > **Webhooks** in Paystack Dashboard
2. Add webhook URL: `https://yourdomain.com/api/payments/paystack/webhook`
3. Select events: `charge.success`, `charge.failed`

## Features Included

✅ Order creation and management
✅ Paystack payment integration
✅ Cash on delivery option
✅ Order confirmation page
✅ Mobile responsive design
✅ Error handling
✅ Stock management
✅ Tax calculation (7.5% VAT)
✅ Free shipping over ₦50,000

## Next Steps

1. Test the complete flow
2. Set up production Paystack keys
3. Configure webhooks for production
4. Add email notifications
5. Set up order tracking
