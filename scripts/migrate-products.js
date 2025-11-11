const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
mongoose.connect(MONGODB_URI);

// Product Schema (matching the updated model)
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

const Product = mongoose.model('Product', ProductSchema);

async function migrateProducts() {
  try {
    console.log('Starting product migration...');
    
    // Get all existing products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      const updates = {};
      let hasUpdates = false;
      
      // Add missing fields with default values
      if (!product.description) {
        updates.description = '';
        hasUpdates = true;
      }
      
      if (!product.tags || product.tags.length === 0) {
        updates.tags = [];
        hasUpdates = true;
      }
      
      if (!product.colors || product.colors.length === 0) {
        updates.colors = [];
        hasUpdates = true;
      }
      
      if (!product.brand) {
        updates.brand = '';
        hasUpdates = true;
      }
      
      if (!product.relatedProducts || product.relatedProducts.length === 0) {
        updates.relatedProducts = [];
        hasUpdates = true;
      }
      
      if (!product.similarityScore) {
        updates.similarityScore = 0;
        hasUpdates = true;
      }
      
      // Update the product if there are changes
      if (hasUpdates) {
        await Product.findByIdAndUpdate(product._id, updates);
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} products`);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    // await Product.collection.createIndex({ category: 1, tags: 1, colors: 1 });
    await Product.collection.createIndex({ category: 1, tags: 1 }); // Only one array field allowed in compound index
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    console.log('Indexes created successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run migration
migrateProducts();


