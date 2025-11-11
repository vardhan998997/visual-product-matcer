import { Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b border-slate-200 py-5 px-8 flex items-center justify-between relative">
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <Zap className="text-blue-600 w-7 h-7 relative z-10" />
          <div className="absolute -top-1 -left-1 w-9 h-9 bg-blue-100 rounded-full opacity-60 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Visual<span className="text-blue-600">Match</span>
          </h1>
          <p className="text-xs text-slate-500 -mt-1">Smart product discovery</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        
        <Link 
          href="/admin" 
          className="text-sm text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/60 border border-transparent hover:border-slate-200"
        >
          Admin
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-1/3 w-24 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-40"></div>
    </nav>
  );
}