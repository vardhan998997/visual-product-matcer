"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  id?: string;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  tags?: string[];
  colors?: string[];
  imageUrl: string;
  relatedProducts?: Product[];
  createdAt: string;
}

export default function AdminPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (res.ok) {
          setItems(data.products || []);
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(data.products.map((p: Product) => p.category))).sort() as string[];
          setCategories(uniqueCategories);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item? This will also remove the uploaded file.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(p => p._id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = selectedCategory 
    ? items.filter(item => item.category.toLowerCase().includes(selectedCategory.toLowerCase()))
    : items;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
      
      <div className="bg-white rounded shadow p-4 mb-6">
        <p className="text-sm text-gray-700">
          New items can only be added after analyzing an image on the Home page. Use Analyze Image → Save to Catalog.
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All Products ({items.length})</h2>
        {loading && <div className="text-gray-600">Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="text-gray-600">No products in database yet.</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                  className={`absolute top-2 right-2 px-3 py-1 rounded text-white text-sm ${
                    deletingId === item._id ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deletingId === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              
              <div className="p-4">
                <div className="font-semibold text-lg mb-2">{item.name}</div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Category:</span> {item.category}
                </div>
                
                {item.brand && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Brand:</span> {item.brand}
                  </div>
                )}
                
                {item.description && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Description:</span> {item.description}
                  </div>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.colors && item.colors.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Colors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.colors.map((color, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {item.relatedProducts && item.relatedProducts.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Related Products ({item.relatedProducts.length}):
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.relatedProducts.slice(0, 3).map((related, index) => (
                        <div key={index}>• {related.name}</div>
                      ))}
                      {item.relatedProducts.length > 3 && (
                        <div>... and {item.relatedProducts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2">
                  ID: {item._id}
                </div>
                <div className="text-xs text-gray-400">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

