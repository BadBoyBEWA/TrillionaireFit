import mongoose, { Schema, Document } from 'mongoose';

// Force refresh the model to prevent caching issues
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  designer: string;
  price: number;
  originalPrice?: number;
  images: string[];
  gender: 'men' | 'women' | 'unisex';
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  isPreowned: boolean;
  condition?: 'excellent' | 'very-good' | 'good' | 'fair';
  stock: {
    [size: string]: {
      [color: string]: number;
    };
  };
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  careInstructions?: string;
  shippingInfo?: {
    freeShipping: boolean;
    estimatedDays: number;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  designer: {
    type: String,
    required: [true, 'Designer name is required'],
    trim: true,
    maxlength: [100, 'Designer name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    type: String,
    required: true
  }],
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['men', 'women', 'unisex'],
      message: 'Gender must be men, women, or unisex'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  sizes: [{
    type: String,
    required: true
  }],
  colors: [{
    type: String,
    required: true
  }],
  materials: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  isPreowned: {
    type: Boolean,
    default: false
  },
  condition: {
    type: String,
    enum: {
      values: ['excellent', 'very-good', 'good', 'fair'],
      message: 'Condition must be excellent, very-good, good, or fair'
    }
  },
  stock: {
    type: Map,
    of: Map,
    default: {}
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  careInstructions: {
    type: String,
    maxlength: [500, 'Care instructions cannot exceed 500 characters']
  },
  shippingInfo: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    estimatedDays: {
      type: Number,
      min: [1, 'Estimated days must be at least 1'],
      max: [30, 'Estimated days cannot exceed 30']
    }
  },
  seo: {
    title: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true,
  collection: 'products',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ProductSchema.index({ name: 'text', description: 'text', designer: 'text' });
ProductSchema.index({ gender: 1, category: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ isPreowned: 1, condition: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for total stock
ProductSchema.virtual('totalStock').get(function() {
  let total = 0;
  if (this.stock && this.stock instanceof Map) {
    for (const sizeStock of this.stock.values()) {
      if (sizeStock instanceof Map) {
        for (const colorStock of sizeStock.values()) {
          total += colorStock;
        }
      }
    }
  }
  return total;
});

// Pre-save middleware to generate SKU if not provided
ProductSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.gender.toUpperCase().substring(0, 2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
