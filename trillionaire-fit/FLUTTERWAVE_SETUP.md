# Flutterwave Payment Integration Setup

This guide explains how to set up Flutterwave payment integration in your Next.js application.

## Prerequisites

1. **Flutterwave Account**: Sign up at [https://dashboard.flutterwave.com/](https://dashboard.flutterwave.com/)
2. **Node.js**: Version 16 or higher
3. **MongoDB**: Local or Atlas instance

## Installation

The required packages are already installed in your project:

```bash
npm install flutterwave-react-v3 flutterwave-node-v3
```

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Flutterwave Configuration
FLW_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-here
FLW_SECRET_KEY=FLWSECK_TEST-your-secret-key-here

# Database (if not already configured)
MONGODB_URI=mongodb://localhost:27017/trillionaire-fit
```

### Getting Your Flutterwave Keys

1. **Login to Flutterwave Dashboard**: Go to [https://dashboard.flutterwave.com/](https://dashboard.flutterwave.com/)
2. **Navigate to Settings**: Click on "Settings" in the sidebar
3. **API Keys**: Click on "API Keys" tab
4. **Copy Keys**: 
   - Copy the "Public Key" for `FLW_PUBLIC_KEY`
   - Copy the "Secret Key" for `FLW_SECRET_KEY`

**Note**: Use test keys for development and live keys for production.

## Components Overview

### 1. CheckoutButton Component
- **Location**: `src/components/payment/CheckoutButton.tsx`
- **Purpose**: Reusable payment button component
- **Props**:
  - `amount`: Payment amount (number)
  - `customerName`: Customer's full name (string)
  - `customerEmail`: Customer's email (string)
  - `customerPhone`: Customer's phone number (string)
  - `currency`: Currency code (string, default: 'NGN')
  - `className`: Additional CSS classes (string, optional)
  - `disabled`: Disable button (boolean, optional)
  - `onSuccess`: Success callback (function, optional)
  - `onError`: Error callback (function, optional)

### 2. Transaction Model
- **Location**: `src/models/Transaction.ts`
- **Purpose**: MongoDB schema for storing transactions
- **Fields**:
  - `transactionId`: Unique transaction identifier
  - `status`: Transaction status (pending, successful, failed, cancelled)
  - `amount`: Payment amount
  - `currency`: Currency code
  - `customerName`: Customer name
  - `customerEmail`: Customer email
  - `customerPhone`: Customer phone
  - `flutterwaveRef`: Flutterwave reference
  - `paymentMethod`: Payment method used
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

### 3. API Verification Route
- **Location**: `src/app/api/verify/route.ts`
- **Purpose**: Server-side payment verification
- **Method**: POST
- **Body**: `{ transaction_id: string }`
- **Response**: Transaction details and verification status

### 4. Payment Utilities
- **Location**: `src/lib/payment.ts`
- **Purpose**: Helper functions for payment operations
- **Functions**:
  - `getPaymentSummary()`: Get payment statistics
  - `getTransactions()`: Get filtered transactions
  - `getTransactionById()`: Get specific transaction
  - `updateTransactionStatus()`: Update transaction status
  - `formatPaymentAmount()`: Format currency display
  - `generateTransactionRef()`: Generate unique reference
  - `validatePaymentAmount()`: Validate payment amount
  - `validateCustomerEmail()`: Validate email format
  - `validateCustomerPhone()`: Validate Nigerian phone number

## Usage Examples

### Basic Usage

```tsx
import CheckoutButton from '@/components/payment/CheckoutButton';

function PaymentPage() {
  const handleSuccess = (transaction) => {
    console.log('Payment successful:', transaction);
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <CheckoutButton
      amount={5000}
      customerName="John Doe"
      customerEmail="john@example.com"
      customerPhone="08012345678"
      currency="NGN"
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### Advanced Usage with Form

```tsx
import { useState } from 'react';
import CheckoutButton from '@/components/payment/CheckoutButton';

function PaymentForm() {
  const [formData, setFormData] = useState({
    amount: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form>
      <input
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleInputChange}
        placeholder="Amount"
      />
      <input
        type="text"
        name="customerName"
        value={formData.customerName}
        onChange={handleInputChange}
        placeholder="Full Name"
      />
      <input
        type="email"
        name="customerEmail"
        value={formData.customerEmail}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        type="tel"
        name="customerPhone"
        value={formData.customerPhone}
        onChange={handleInputChange}
        placeholder="Phone Number"
      />
      
      <CheckoutButton
        amount={formData.amount}
        customerName={formData.customerName}
        customerEmail={formData.customerEmail}
        customerPhone={formData.customerPhone}
        onSuccess={(transaction) => {
          console.log('Payment successful:', transaction);
          // Handle success (redirect, show confirmation, etc.)
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
          // Handle error (show error message, etc.)
        }}
      />
    </form>
  );
}
```

## Admin Dashboard

### View Transactions
- **URL**: `/admin/transactions`
- **Features**:
  - Payment summary statistics
  - Transaction list with filtering
  - Export functionality
  - Real-time status updates

### Transaction Management
- View all transactions
- Filter by status, date, customer
- Export transaction data
- Monitor payment success rates

## Security Features

1. **Server-side Verification**: All payments are verified on the server
2. **Duplicate Prevention**: Transaction IDs are unique to prevent duplicates
3. **Input Validation**: All inputs are validated before processing
4. **Environment Variables**: Sensitive keys are stored securely
5. **HTTPS Required**: Production requires HTTPS for security

## Testing

### Test Mode
- Use Flutterwave test keys for development
- Test cards are available in Flutterwave documentation
- All test transactions are sandboxed

### Test Cards (Nigeria)
- **Visa**: 4187427415564246
- **Mastercard**: 5438898014560229
- **Verve**: 5061460410120223210

### Test Phone Numbers
- **MTN**: 08012345678
- **Airtel**: 08022345678
- **9mobile**: 08032345678

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Retry mechanism for failed requests
2. **Validation Errors**: Clear error messages for invalid inputs
3. **Payment Failures**: User-friendly error messages
4. **Server Errors**: Graceful fallback for server issues

## Production Deployment

### Environment Setup
1. **Switch to Live Keys**: Update environment variables with live keys
2. **Enable HTTPS**: Ensure your domain has SSL certificate
3. **Update Callback URLs**: Configure webhook URLs in Flutterwave dashboard
4. **Database Backup**: Ensure MongoDB is properly backed up

### Monitoring
- Monitor transaction success rates
- Set up alerts for failed payments
- Track payment processing times
- Monitor API usage and limits

## Support

For issues or questions:
1. **Flutterwave Documentation**: [https://developer.flutterwave.com/](https://developer.flutterwave.com/)
2. **Flutterwave Support**: Available through dashboard
3. **Project Issues**: Check the project's issue tracker

## Changelog

### Version 1.0.0
- Initial Flutterwave integration
- CheckoutButton component
- Transaction model and API
- Admin dashboard integration
- Comprehensive error handling
- TypeScript support

