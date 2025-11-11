import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

interface Product {
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

type Props = {
  products: Product[];
};

export default function ResultsGrid({ products }: Props) {
  if (!products.length) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute -z-10 top-10 left-1/4 w-3 h-3 bg-blue-200 rounded-full opacity-40"></div>
      <div className="absolute -z-10 bottom-20 right-1/3 w-2 h-2 bg-purple-200 rounded-full opacity-50"></div>
      <div className="absolute -z-10 top-1/3 right-1/4 w-1 h-1 bg-emerald-300 rounded-full opacity-60"></div>
      
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </motion.div>
  );
}