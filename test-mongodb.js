require('dotenv').config({ path: '../.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Testing:786@testing1.mofkubg.mongodb.net/Product_list?retryWrites=true&w=majority&appName=Testing1';

console.log('MONGODB_URI:', MONGODB_URI);

async function dropInvalidIndexes() {
  await mongoose.connect(MONGODB_URI);
  const collection = mongoose.connection.db.collection('products');
  const indexes = await collection.indexes();
  for (const idx of indexes) {
    if (idx.key.tags && idx.key.colors) {
      console.log('Dropping invalid index:', idx.name);
      await collection.dropIndex(idx.name);
    }
  }
  await mongoose.disconnect();
  console.log('Done.');
}

dropInvalidIndexes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
