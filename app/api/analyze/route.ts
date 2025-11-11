import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Google Gemini configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_ID = process.env.GEMINI_MODEL_ID || 'gemini-1.5-flash';

async function inlineImageFromUrl(url: string): Promise<{ mime_type: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    return { mime_type: contentType, data: buffer.toString('base64') };
  } catch {
    return null;
  }
}

function inlineImageFromDataUrl(dataUrl: string): { mime_type: string; data: string } | null {
  const m = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
  if (!m) return null;
  return { mime_type: m[1] || 'image/jpeg', data: m[2] };
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY env var' }, { status: 500 });
    }

    const { image } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    let inlineImage: { mime_type: string; data: string } | null = null;
    if (image.startsWith('http')) inlineImage = await inlineImageFromUrl(image);
    else if (image.startsWith('data:')) inlineImage = inlineImageFromDataUrl(image);
    if (!inlineImage) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
    }

    const prompt = `You are a product image analyzer. Extract comprehensive product details.
Respond ONLY with strict JSON (no backticks, no prose) using exactly this schema:
{"name": string, "category": string, "brand": string, "description": string, "color_names": string[], "tags": string[]}
Rules:
- "category" must be one of: Shoes, Jackets, Hoodies, T-Shirts, Pants, Dresses, Shorts, Skirts, Sweaters, Accessory, Electronics, Furniture, Food, Vehicle, Animal, Plant, Building, People, Sports, Nature, Artwork, Other.
- "brand" should be the brand name if visible, otherwise empty string
- "description" should be a brief 1-2 sentence description
- "color_names" should be 1-3 main colors
- "tags" should be 5-10 relevant keywords/tags
- Prefer Accessory for sunglasses, bags, watches, jewelry; Electronics for phones, laptops, cameras; T-Shirts for tees; Pants for jeans/chinos/trousers.
- Keep values concise and accurate.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL_ID)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const body = {
      contents: [
        { parts: [ { text: prompt }, { inline_data: inlineImage } ] }
      ],
      generationConfig: { temperature: 0.2, topP: 0.9 },
    } as any;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: `Gemini error ${resp.status}: ${text}` }, { status: 502 });
    }
    const json = await resp.json();
    const candidate = json?.candidates?.[0];
    const textOut = candidate?.content?.parts?.find((p: any) => typeof p.text === 'string')?.text || '';

    let parsed: any;
    try {
      parsed = JSON.parse(textOut);
    } catch {
      const m = textOut.match(/\{[\s\S]*\}/);
      if (!m) return NextResponse.json({ error: 'Gemini response was not valid JSON' }, { status: 502 });
      parsed = JSON.parse(m[0]);
    }

    const name: string = String(parsed?.name || '').trim() || 'Uploaded Item';
    const category: string = String(parsed?.category || '').trim();
    const brand: string = String(parsed?.brand || '').trim();
    const description: string = String(parsed?.description || '').trim();
    const colorNames: string[] = Array.isArray(parsed?.color_names) ? parsed.color_names.slice(0, 3) : [];
    const tagsArr: string[] = Array.isArray(parsed?.tags) ? parsed.tags.slice(0, 10) : [];

    const analysis = {
      description: { captions: name ? [{ text: name, confidence: 1 }] : [] },
      tags: tagsArr.map(t => ({ name: String(t), confidence: 1 })),
      categories: category ? [{ name: category, score: 1 }] : [],
      brands: brand ? [{ name: brand, confidence: 1 }] : [],
      color: { dominantColors: colorNames },
      // Additional fields for enhanced product model
      enhancedData: {
        name,
        category,
        brand,
        description,
        colors: colorNames,
        tags: tagsArr,
      }
    };

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

