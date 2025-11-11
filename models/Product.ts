import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  colors: [{
    type: String,
    trim: true,
  }],
  brand: {
    type: String,
    trim: true,
    default: '',
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  similarityScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better search performance
// ProductSchema.index({ category: 1, tags: 1, colors: 1 });
ProductSchema.index({ category: 1, tags: 1 }); // Only one array field allowed in compound index
ProductSchema.index({ name: 'text', description: 'text' });

interface IProduct extends mongoose.Document {
  name: string;
  category: string;
  imageUrl: string;
  description?: string;
  tags?: string[];
  colors?: string[];
  brand?: string;
  relatedProducts?: mongoose.Types.ObjectId[];
  similarityScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const Product = (mongoose.models.Product as mongoose.Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
