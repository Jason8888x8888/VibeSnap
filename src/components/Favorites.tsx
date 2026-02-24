import React from 'react';
import { ExtractedDesign } from '../types';
import { Trash2 } from 'lucide-react';

interface FavoritesProps {
  favorites: ExtractedDesign[];
  onSelect: (design: ExtractedDesign) => void;
  onRemove: (id: string) => void;
}

export function Favorites({ favorites, onSelect, onRemove }: FavoritesProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white/50 backdrop-blur-sm rounded-3xl border border-zinc-200 border-dashed text-zinc-400 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium">暂无收藏。提取一些设计并保存在这里吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((design) => (
        <div 
          key={design.id} 
          className="group relative bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-300"
          onClick={() => onSelect(design)}
        >
          <div className="aspect-video w-full overflow-hidden bg-zinc-100 relative border-b border-zinc-100">
            <img 
              src={design.imageUrl} 
              alt="设计预览" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/5 transition-colors" />
          </div>
          
          <div className="p-5">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {design.keywords.slice(0, 3).map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-zinc-200/50">
                  {kw}
                </span>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              {design.colors.slice(0, 5).map((color, i) => (
                <div 
                  key={i} 
                  className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            
            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
              {design.summary}
            </p>
          </div>

          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(design.id);
              }}
              className="p-2 bg-white/95 backdrop-blur-sm text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm border border-zinc-200/50"
              title="取消收藏"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
