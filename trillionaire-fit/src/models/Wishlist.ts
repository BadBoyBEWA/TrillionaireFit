import mongoose, { Schema, Document } from 'mongoose';

// Force refresh the model to prevent caching issues
if (mongoose.models.Wishlist) {
  delete mongoose.models.Wishlist;
}

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

const Wishlist = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default Wishlist;


