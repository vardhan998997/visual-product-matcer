import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get related products
    const relatedProducts = await Product.find({
      _id: { $in: product.relatedProducts || [] }
    })
    .select('name category imageUrl tags colors brand')
    .limit(limit);

    // If not enough related products, find similar products by category and tags
    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $ne: productId, $nin: relatedProducts.map(p => p._id) },
        $or: [
          { category: product.category },
          { tags: { $in: product.tags || [] } },
          { colors: { $in: product.colors || [] } }
        ]
      })
      .select('name category imageUrl tags colors brand')
      .limit(limit - relatedProducts.length);

      relatedProducts.push(...additionalProducts);
    }

    return NextResponse.json({ 
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl,
        tags: product.tags,
        colors: product.colors,
        brand: product.brand,
      },
      relatedProducts 
    });
  } catch (error: any) {
    console.error('API /api/related-products error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


