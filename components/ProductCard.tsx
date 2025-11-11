import { motion } from 'framer-motion';
import { Tag, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  similarity: number;
  brand?: string;
  description?: string;
  tags?: string[];
  colors?: string[];
  relatedProducts?: any[];
}

export default function ProductCard({ 
  id, 
  name, 
  category, 
  imageUrl, 
  similarity, 
  brand, 
  description, 
  tags, 
  colors,
  relatedProducts 
}: ProductCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const isHighMatch = similarity > 0.8;
  const isGoodMatch = similarity > 0.6;

  return (
    <motion.div
      // variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 p-5 flex flex-col gap-3 cursor-pointer relative overflow-hidden group
        ${isHighMatch ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50' : 
          isGoodMatch ? 'border-blue-200 bg-gradient-to-br from-white to-blue-50' : 
          'border-slate-200 hover:border-slate-300'}`}
    >
      {/* Decorative corner element */}
      <div className={`absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8
        ${isHighMatch ? 'bg-emerald-100' : isGoodMatch ? 'bg-blue-100' : 'bg-slate-100'} opacity-60`}></div>
      
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl bg-slate-50">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Match percentage badge */}
        <div className={`absolute -top-2 -right-2 px-2.5 py-1 text-white text-xs font-bold rounded-full shadow-lg transform rotate-12
          ${isHighMatch ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 
            isGoodMatch ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 
            'bg-gradient-to-r from-slate-500 to-gray-600'}`}
        >
          {Math.round(similarity * 100)}%
        </div>

        {/* Heart icon for favorites */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="w-4 h-4 text-white drop-shadow-lg hover:fill-red-500 hover:text-red-500 cursor-pointer" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={name}>
            {name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-sm text-slate-600 capitalize">{category}</span>
            {isHighMatch && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
          </div>
        </div>
        
        {brand && (
          <div className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg w-fit">
            {brand}
          </div>
        )}
        
        {description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={description}>
            {description}
          </p>
        )}
      </div>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full border border-slate-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-slate-400 font-medium self-center">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {colors && colors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Colors:</span>
          <div className="flex gap-1.5">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="relative group/color"
              >
                <span
                  className="block w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {color}
                </div>
              </div>
            ))}
            {colors.length > 4 && (
              <span className="text-xs text-slate-400 font-medium self-center ml-1">
                +{colors.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
      
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex -space-x-1">
            {[...Array(Math.min(3, relatedProducts.length))].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border border-white shadow-sm"></div>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {relatedProducts.length} similar {relatedProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}
    </motion.div>
  );
}
