import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for User document
export interface IUser extends Document {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'buyer' | 'admin';
  createdAt: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  addresses: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
  }>;
}

// TypeScript interface for User input (without _id, __v, etc.)
export interface IUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'buyer' | 'admin';
}

// User schema definition
const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // Remove length validation for hashed passwords
    // Length validation is handled in the API routes for the original password
  },
  role: {
    type: String,
    enum: ['buyer', 'admin'],
    default: 'buyer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetToken: {
    type: String,
    required: false
  },
  resetTokenExpiry: {
    type: Date,
    required: false
  },
  addresses: [{
    _id: {
      type: String,
      required: true
    },
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
      trim: true
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
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: false // We're manually handling createdAt
});

// Prevent model overwrite issues with hot reload in Next.js
// Force schema refresh by deleting the existing model first
if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
