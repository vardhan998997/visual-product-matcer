import { Upload, Image as ImageIcon, Search, Sparkles, Camera, Zap } from 'lucide-react';
import React from 'react';

export type UploadFormProps = {
  image: string | null;
  setImage: (img: string | null) => void;
  setDominantColor: (color: string | null) => void;
  setFile: (file: File | null) => void;
  analyzed: boolean;
  inferredColor: string | null;
  inferredCategory: string | null;
  inferredName: string;
  onAnalyze?: () => void;
  onSearch: () => void;
  onSave: () => void;
  analyzing?: boolean;
};

const UploadForm: React.FC<UploadFormProps> = (props) => {
  const { image, setImage, setDominantColor, setFile, analyzed, inferredColor, inferredCategory, inferredName, onAnalyze, onSearch, onSave, analyzing } = props;
  
  const extractDominantColor = (src: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        const step = 10 * 4;
        for (let i = 0; i < data.length; i += step) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setDominantColor(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
        }
      };
      img.onerror = () => setDominantColor(null);
      img.src = src;
    } catch {
      setDominantColor(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setImage(dataUrl);
        extractDominantColor(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImage(url);
    if (!url) return;
    fetch('/api/fetch-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).then(async (res) => {
      if (!res.ok) return;
      const data = await res.json();
      if (data?.dataUrl) extractDominantColor(data.dataUrl);
    }).catch(() => {});
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-30 transform -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-200 to-transparent rounded-full opacity-20 transform translate-x-16 translate-y-16"></div>
      
      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Camera className="w-6 h-6 text-blue-600" />
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Upload & Discover
        </h2>
        <p className="text-slate-600 text-sm">
          Share your product photo and find similar items instantly
        </p>
      </div>

      {/* Upload Section */}
      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload */}
          <label className="group flex items-center gap-3 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl px-6 py-4 cursor-pointer transition-all duration-300 hover:bg-blue-50/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-3 w-full">
              <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="text-slate-700 font-medium block">Choose File</span>
                <span className="text-slate-500 text-xs">JPG, PNG, WebP</span>
              </div>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          {/* URL Input */}
          <div className="flex items-center gap-3 border-2 border-slate-300 hover:border-purple-400 rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-purple-50/50 group">
            <div className="p-2 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <input
                type="url"
                placeholder="Or paste an image URL..."
                className="w-full outline-none bg-transparent text-slate-700 placeholder-slate-400"
                value={image && image.startsWith('http') ? image : ''}
                onChange={handleUrlChange}
              />
              <span className="text-slate-500 text-xs">From anywhere on the web</span>
            </div>
          </div>
        </div>

        {/* Image Preview */}
        {image && (
          <div className="mt-6 text-center">
            <div className="inline-block relative">
              <div className="relative overflow-hidden rounded-2xl shadow-lg border-4 border-white">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-h-48 max-w-full object-contain bg-slate-50" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              
              {/* Floating analysis indicator */}
              {analyzed && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                  <Zap className="w-4 h-4" />
                </div>
              )}
            </div>
            
            {/* Analysis Results */}
            {analyzed && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  AI Analysis Results
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-slate-700 text-sm">Product Name</span>
                    </div>
                    <p className="text-slate-900 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                      {inferredName || 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-semibold text-slate-700 text-sm">Category</span>
                    </div>
                    <p className="text-slate-900 font-medium bg-slate-50 px-3 py-2 rounded-lg capitalize">
                      {inferredCategory || 'Uncategorized'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="font-semibold text-slate-700 text-sm">Dominant Color</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg">
                      {inferredColor && (
                        <span 
                          className="w-6 h-6 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200" 
                          style={{ backgroundColor: inferredColor }}
                        />
                      )}
                      <span className="text-slate-900 font-medium">
                        {inferredColor || 'Not detected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {onAnalyze && (
            <button
              className={`group relative overflow-hidden px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center gap-3 font-semibold text-sm
                ${analyzing 
                  ? 'bg-slate-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105'
                }`}
              onClick={onAnalyze}
              disabled={!image || analyzing}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Magic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>
          )}
          
          <button
            className={`group relative overflow-hidden px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center gap-3 font-semibold text-sm
              ${!image || !analyzed 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white hover:shadow-xl hover:scale-105'
              }`}
            onClick={onSearch}
            disabled={!image || !analyzed}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <Search className="w-4 h-4" />
            <span>Find Matches</span>
          </button>
          
          <button
            className={`group relative overflow-hidden px-8 py-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center gap-3 font-semibold text-sm
              ${!image || !analyzed 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-xl hover:scale-105'
              }`}
            onClick={onSave}
            disabled={!image || !analyzed}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white rounded border-r-transparent"></div>
              <span>Save to Catalog</span>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        {!image && (
          <div className="text-center mt-6">
            <p className="text-slate-500 text-sm">
              👆 Start by uploading an image or pasting a URL to begin the magic
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;