import mongoose, { Document, Schema, model, models } from 'mongoose';

// Transaction interface for TypeScript
export interface ITransaction extends Document {
  transactionId: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  flutterwaveRef?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction schema
const TransactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate transactions
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'cancelled'],
    default: 'pending',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'NGN'
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  flutterwaveRef: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'transactions'
});

// Index for efficient queries
TransactionSchema.index({ customerEmail: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

export const Transaction = models.Transaction || model('Transaction', TransactionSchema);

