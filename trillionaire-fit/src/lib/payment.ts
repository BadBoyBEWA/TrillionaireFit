import Transaction from '@/models/Transaction';
import { connectDB } from './mongodb';

// TypeScript interfaces for payment utilities
export interface PaymentSummary {
  totalAmount: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
}

export interface TransactionFilters {
  status?: 'pending' | 'successful' | 'failed' | 'cancelled';
  customerEmail?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}

/**
 * Get payment summary statistics
 * 
 * @returns Promise<PaymentSummary> - Summary of all transactions
 */
export async function getPaymentSummary(): Promise<PaymentSummary> {
  try {
    await connectDB();

    const [
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions
    ] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'successful' }),
      Transaction.countDocuments({ status: 'failed' }),
      Transaction.countDocuments({ status: 'pending' })
    ]);

    const totalAmount = await Transaction.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      totalAmount: totalAmount[0]?.total || 0,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions
    };
  } catch (error) {
    console.error('Error getting payment summary:', error);
    throw new Error('Failed to get payment summary');
  }
}

/**
 * Get transactions with optional filtering
 * 
 * @param filters - Optional filters for transactions
 * @returns Promise<ITransaction[]> - Array of transactions
 */
export async function getTransactions(filters: TransactionFilters = {}) {
  try {
    await connectDB();

    const query: any = {};

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.customerEmail) {
      query.customerEmail = new RegExp(filters.customerEmail, 'i');
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .lean();

    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to get transactions');
  }
}

/**
 * Get transaction by ID
 * 
 * @param transactionId - The transaction ID to find
 * @returns Promise<ITransaction | null> - Transaction or null if not found
 */
export async function getTransactionById(transactionId: string) {
  try {
    await connectDB();

    const transaction = await Transaction.findOne({ transactionId });
    return transaction;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    throw new Error('Failed to get transaction');
  }
}

/**
 * Update transaction status
 * 
 * @param transactionId - The transaction ID to update
 * @param status - New status for the transaction
 * @returns Promise<boolean> - Success status
 */
export async function updateTransactionStatus(
  transactionId: string, 
  status: 'pending' | 'successful' | 'failed' | 'cancelled'
): Promise<boolean> {
  try {
    await connectDB();

    const result = await Transaction.updateOne(
      { transactionId },
      { status, updatedAt: new Date() }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
}

/**
 * Format currency amount for display
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: NGN)
 * @returns Formatted currency string
 */
export function formatPaymentAmount(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate unique transaction reference
 * 
 * @param prefix - Optional prefix for the reference
 * @returns Unique transaction reference
 */
export function generateTransactionRef(prefix: string = 'tx'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate payment amount
 * 
 * @param amount - Amount to validate
 * @returns boolean - Whether amount is valid
 */
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000000; // Max 10M NGN
}

/**
 * Validate customer email
 * 
 * @param email - Email to validate
 * @returns boolean - Whether email is valid
 */
export function validateCustomerEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate customer phone number (Nigerian format)
 * 
 * @param phone - Phone number to validate
 * @returns boolean - Whether phone is valid
 */
export function validateCustomerPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian phone number
  return /^(234|0)?[789][01]\d{8}$/.test(cleanPhone);
}

