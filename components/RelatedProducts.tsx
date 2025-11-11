"use client";
import { useState, useEffect } from 'react';
import { Package, ArrowRight } from 'lucide-react';

interface RelatedProduct {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
  tags?: string[];
  colors?: string[];
  brand?: string;
  similarity?: number;
}

interface RelatedProductsProps {
  productId: string;
  limit?: number;
}

export default function RelatedProducts({ productId, limit = 6 }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/related-products?id=${productId}&limit=${limit}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch related products');
        }
        
        setRelatedProducts(data.relatedProducts || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, limit]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">You might also like</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Discovering similar products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-bold text-slate-900">Related Products</h3>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-medium">Unable to load suggestions</p>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <Package className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-900">Related Products</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No similar products found yet</p>
          <p className="text-slate-500 text-sm">Try uploading more products to build connections!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl shadow-lg border border-slate-200 p-6 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full opacity-30 transform translate-x-16 -translate-y-16"></div>
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Package className="w-5 h-5 text-blue-600" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Similar Items 
            <span className="ml-2 text-sm font-normal text-slate-600">
              ({relatedProducts.length} found)
            </span>
          </h3>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {relatedProducts.map((product, index) => (
          <div key={product._id} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 group-hover:shadow-md transition-all duration-300">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {product.similarity && (
                <div className={`absolute top-1.5 right-1.5 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg
                  ${product.similarity > 0.8 ? 'bg-emerald-500' : 
                    product.similarity > 0.6 ? 'bg-blue-500' : 'bg-slate-500'}`}
                >
                  {Math.round(product.similarity * 100)}%
                </div>
              )}

              {/* Animation delay for staggered effect */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ animationDelay: `${index * 50}ms` }}
              ></div>
            </div>
            
            <div className="mt-3 space-y-1">
              <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors" title={product.name}>
                {product.name}
              </h4>
              
              <p className="text-xs text-slate-500 capitalize">{product.category}</p>
              
              {product.brand && (
                <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit">
                  {product.brand}
                </p>
              )}
              
              {product.colors && product.colors.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {product.colors.slice(0, 3).map((color, colorIndex) => (
                    <span
                      key={colorIndex}
                      className="w-3 h-3 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-xs text-slate-400 self-center">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
