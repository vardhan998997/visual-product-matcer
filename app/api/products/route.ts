// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ensure Node runtime on Vercel

// Configure Cloudinary (env vars must be set in .env / Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ---------- GET ----------
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = {};
    if (category) {
      query = { category: { $regex: category, $options: 'i' } };
    }

    const products = await Product.find(query)
      .populate('relatedProducts', 'name category imageUrl')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('API /api/products GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ---------- POST ----------
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const tags = String(formData.get('tags') || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const colors = String(formData.get('colors') || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    const brand = String(formData.get('brand') || '').trim();
    const imageUrlInput = String(formData.get('imageUrl') || '').trim();
    const file = formData.get('imageFile') as File | null;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Missing name or category' },
        { status: 400 }
      );
    }

    // Upload helper
    const uploadToCloudinary = async (input: Buffer | string) => {
      // If input is a buffer (file), use upload_stream; if string (URL or data URI), use upload
      if (typeof input !== 'string') {
        const result: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'visual-product-matcher' },
            (err, res) => (err ? reject(err) : resolve(res))
          );
          stream.end(input);
        });
        return result as { secure_url: string; public_id: string };
      } else {
        const result = await cloudinary.uploader.upload(input, {
          folder: 'visual-product-matcher',
        });
        return result as unknown as { secure_url: string; public_id: string };
      }
    };

    let imageUrl = '';
    // 1) File upload case
    if (file && file instanceof File && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const res = await uploadToCloudinary(buffer);
      imageUrl = res.secure_url;
    }
    // 2) Remote URL or data: URL provided
    else if (imageUrlInput) {
      // Cloudinary can ingest https URLs or data URIs directly
      const res = await uploadToCloudinary(imageUrlInput);
      imageUrl = res.secure_url;
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Provide imageFile or imageUrl' },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      category,
      description,
      tags,
      colors,
      brand,
      imageUrl,
    });

    const savedProduct = await product.save();

    // Update related
    await updateRelatedProducts(String(savedProduct._id), category, tags);

    return NextResponse.json({ product: savedProduct }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/products POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ---------- DELETE ----------
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(idParam);
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Remove this product from other docs' relatedProducts
    await Product.updateMany(
      { relatedProducts: product._id },
      { $pull: { relatedProducts: product._id } }
    );

    // Best-effort delete Cloudinary asset if URL is from Cloudinary
    try {
      const urlStr = String(product.imageUrl || '');
      if (urlStr.includes('res.cloudinary.com')) {
        const publicId = extractCloudinaryPublicId(urlStr);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch(() => {});
        }
      }
    } catch {
      // ignore cloudinary deletion errors
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API /api/products DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ---------- Helpers ----------
async function updateRelatedProducts(
  productId: string,
  category: string,
  tags: string[]
) {
  try {
    const relatedQuery: any = {
      _id: { $ne: productId },
      $or: [
        { category: { $regex: category, $options: 'i' } },
        { tags: { $in: tags.map(t => new RegExp(t, 'i')) } },
      ],
    };

    const relatedProducts = await Product.find(relatedQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id');

    await Product.findByIdAndUpdate(productId, {
      relatedProducts: relatedProducts.map(p => p._id),
    });

    for (const relatedProduct of relatedProducts) {
      await Product.findByIdAndUpdate(relatedProduct._id, {
        $addToSet: { relatedProducts: productId },
      });
    }
  } catch (error) {
    console.error('Error updating related products:', error);
  }
}

/**
 * Extract Cloudinary public_id from a secure_url.
 * Works for: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder...>/<name>.<ext>
 */
function extractCloudinaryPublicId(secureUrl: string): string | null {
  try {
    const u = new URL(secureUrl);
    const parts = u.pathname.split('/').filter(Boolean); // ["<cloud>", "image", "upload", "v169...", "folder", "name.jpg"]
    const uploadIdx = parts.findIndex(p => p === 'upload');
    if (uploadIdx === -1) return null;

    // after 'upload' might be a version segment like v1699999999
    const afterUpload = parts.slice(uploadIdx + 1);
    const first = afterUpload[0] || '';
    const rest = first.startsWith('v') ? afterUpload.slice(1) : afterUpload;

    if (rest.length === 0) return null;

    // remove file extension from last segment
    const last = rest[rest.length - 1];
    const lastNoExt = last.replace(/\.[^/.]+$/, '');
    const withoutLast = rest.slice(0, -1);

    const publicId = [...withoutLast, lastNoExt].join('/');
    return publicId || null;
  } catch {
    return null;
  }
}