const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Product Schema
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

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read existing JSON data
    const productsPath = path.join(process.cwd(), 'products.json');
    if (!fs.existsSync(productsPath)) {
      console.log('No products.json found. Starting with empty database.');
      return;
    }

    const jsonData = fs.readFileSync(productsPath, 'utf-8');
    const products = JSON.parse(jsonData);

    console.log(`Found ${products.length} products to migrate`);

    // Clear existing data
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    const productDocs = products.map(product => ({
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await Product.insertMany(productDocs);
    console.log(`Successfully migrated ${productDocs.length} products to MongoDB`);

    // Verify migration
    const count = await Product.countDocuments();
    console.log(`Database now contains ${count} products`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();

