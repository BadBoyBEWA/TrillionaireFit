import mongoose, { Schema, Document } from 'mongoose';

// Force refresh the model to prevent caching issues
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    name: string;
    designer: string;
    image: string;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  payment: {
    method: 'paystack' | 'cash_on_delivery';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    flutterwaveReference?: string;
    flutterwaveTransactionId?: string;
    paystackReference?: string;
    paystackTransactionId?: string;
    transactionId?: string;
    amount: number;
    upfrontAmount?: number;
    remainingAmount?: number;
    currency: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: {
      type: String,
      required: true
    },
    designer: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Nigeria'
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  billingAddress: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['paystack', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    flutterwaveReference: {
      type: String,
      trim: true
    },
    flutterwaveTransactionId: {
      type: String,
      trim: true
    },
    paystackReference: {
      type: String,
      trim: true
    },
    paystackTransactionId: {
      type: String,
      trim: true
    },
    transactionId: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    upfrontAmount: {
      type: Number,
      min: 0
    },
    remainingAmount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'NGN'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ createdAt: -1 });

// Order number is now generated manually in the API route

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
