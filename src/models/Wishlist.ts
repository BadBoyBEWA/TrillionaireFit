import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
WishlistSchema.index({ user: 1 });
WishlistSchema.index({ products: 1 });

// Virtual for product count
WishlistSchema.virtual('productCount').get(function() {
  return this.products.length;
});

export const Wishlist = models.Wishlist || model('Wishlist', WishlistSchema);


