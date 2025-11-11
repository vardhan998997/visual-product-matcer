export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

function keywordFromColorName(name?: string | null) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  if (n.includes('red')) return 'red';
  if (n.includes('blue')) return 'blue';
  if (n.includes('green')) return 'green';
  if (n.includes('yellow')) return 'yellow';
  if (n.includes('white')) return 'white';
  if (n.includes('black')) return 'black';
  if (n.includes('gray') || n.includes('grey')) return 'gray';
  if (n.includes('purple')) return 'purple';
  if (n.includes('orange')) return 'orange';
  if (n.includes('pink')) return 'pink';
  return null;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const keywords = Array.isArray(body?.keywords) ? body.keywords.map((k: any) => String(k).toLowerCase()) : [];
    const queryName = typeof body?.name === 'string' ? body.name.toLowerCase() : '';
    const queryCategory = typeof body?.category === 'string' ? body.category.toLowerCase() : '';
    const queryImage = typeof body?.image === 'string' ? body.image : '';
    const queryBrand = typeof body?.brand === 'string' ? body.brand.toLowerCase() : '';
    const queryColors = Array.isArray(body?.colors) ? body.colors.map((c: any) => String(c).toLowerCase()) : [];
    const limit = parseInt(body?.limit || '20');

    // Build search query
    let query: any = {};
    let searchText = '';

    // Text search for name and description
    if (queryName || queryCategory || queryBrand) {
      searchText = `${queryName} ${queryCategory} ${queryBrand}`.trim();
    }

    // Category filter
    if (queryCategory) {
      query.category = { $regex: queryCategory, $options: 'i' };
    }

    // Brand filter
    if (queryBrand) {
      query.brand = { $regex: queryBrand, $options: 'i' };
    }

    // Color filter
    if (queryColors.length > 0) {
      query.colors = { $in: queryColors.map((c: string) => new RegExp(c, 'i')) };
    }

    // Tag filter
    if (keywords.length > 0) {
      query.tags = { $in: keywords.map((k: string) => new RegExp(k, 'i')) };
    }

    let products;
    if (searchText) {
      // Use text search if we have search terms
      products = await Product.find(
        { $text: { $search: searchText }, ...query },
        { score: { $meta: "textScore" } }
      )
      .populate('relatedProducts', 'name category imageUrl tags colors')
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(limit);
    } else {
      // Use regular query
      products = await Product.find(query)
        .populate('relatedProducts', 'name category imageUrl tags colors')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    const results = products.map((product: any) => {
      const hay = `${product.name || ''} ${product.category || ''} ${product.brand || ''} ${product.description || ''} ${(product.tags || []).join(' ')} ${(product.colors || []).join(' ')}`.toLowerCase();
      let score = 0;

      // Exact same image boost (highest priority)
      if (queryImage && typeof product.imageUrl === 'string' && product.imageUrl && queryImage === product.imageUrl) {
        score = 1;
      } else {
        // Category exact match (0.8)
        if (queryCategory) {
          const productCategory = String(product.category || '').toLowerCase();
          if (productCategory === queryCategory) {
            score += 0.8;
          } else if (productCategory.includes(queryCategory) || queryCategory.includes(productCategory)) {
            score += 0.5;
          }
        }

        // Brand match (0.6)
        if (queryBrand && product.brand) {
          const productBrand = String(product.brand).toLowerCase();
          if (productBrand === queryBrand) {
            score += 0.6;
          } else if (productBrand.includes(queryBrand) || queryBrand.includes(productBrand)) {
            score += 0.3;
          }
        }

        // Color matches (0.4)
        if (queryColors.length > 0 && product.colors) {
          const productColors = product.colors.map((c: string) => c.toLowerCase());
          const colorMatches = queryColors.filter((qc: string) => 
            productColors.some((pc: string) => pc.includes(qc) || qc.includes(pc))
          );
          if (colorMatches.length > 0) {
            score += Math.min(0.4, colorMatches.length * 0.2);
          }
        }

        // Name overlap (0.3)
        if (queryName) {
          const nameTokens = queryName.split(/[^a-z0-9]+/g).filter(Boolean);
          let nameMatches = 0;
          for (const t of nameTokens) if (hay.includes(t)) nameMatches++;
          if (nameMatches > 0) score += Math.min(0.3, nameMatches * 0.1);
        }

        // Tag/keyword matches (0.2)
        if (keywords.length > 0 && product.tags) {
          const productTags = product.tags.map((t: string) => t.toLowerCase());
          const tagMatches = keywords.filter((k: string) => 
            productTags.some((pt: string) => pt.includes(k) || k.includes(pt))
          );
          if (tagMatches.length > 0) {
            score += Math.min(0.2, tagMatches.length * 0.05);
          }
        }

        // Related products bonus (0.1)
        if (product.relatedProducts && product.relatedProducts.length > 0) {
          score += Math.min(0.1, product.relatedProducts.length * 0.02);
        }
      }

      return { 
        id: product._id.toString(),
        name: product.name,
        category: product.category,
        description: product.description,
        brand: product.brand,
        tags: product.tags || [],
        colors: product.colors || [],
        imageUrl: product.imageUrl,
        relatedProducts: product.relatedProducts || [],
        similarity: Math.max(0, Math.min(1, score))
      };
    }).sort((a: any, b: any) => b.similarity - a.similarity || a.id.localeCompare(b.id));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('API /api/search error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
