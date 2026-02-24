/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultTabs } from './components/ResultTabs';
import { Favorites } from './components/Favorites';
import { extractDesignFromImage } from './services/geminiService';
import { ExtractedDesign } from './types';
import { Sparkles, Heart, LayoutDashboard, Bookmark } from 'lucide-react';

export default function App() {
  const [currentDesign, setCurrentDesign] = useState<ExtractedDesign | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<ExtractedDesign[]>([]);
  const [view, setView] = useState<'extractor' | 'favorites'>('extractor');

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('vibesnap_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  // Save favorites when changed
  useEffect(() => {
    localStorage.setItem('vibesnap_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleImageSelect = async (base64: string, mimeType: string) => {
    setCurrentImage(base64);
    setIsLoading(true);
    setError(null);
    setView('extractor');

    try {
      const extractedData = await extractDesignFromImage(base64, mimeType);

      const newDesign: ExtractedDesign = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: base64,
        ...extractedData
      };

      setCurrentDesign(newDesign);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '提取设计 DNA 失败');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!currentDesign) return;

    const isFavorite = favorites.some(f => f.id === currentDesign.id);
    if (isFavorite) {
      setFavorites(favorites.filter(f => f.id !== currentDesign.id));
    } else {
      setFavorites([currentDesign, ...favorites]);
    }
  };

  const isCurrentFavorite = currentDesign ? favorites.some(f => f.id === currentDesign.id) : false;

  return (
    <div className="min-h-screen bg-zinc-50 bg-dot-pattern text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => setView('extractor')}
          >
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">VibeSnap</h1>
          </div>

          <nav className="flex items-center space-x-1 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/50">
            <button
              onClick={() => setView('extractor')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'extractor'
                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>提取器</span>
            </button>
            <button
              onClick={() => setView('favorites')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${view === 'favorites'
                ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-black/5'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>灵感库</span>
              {favorites.length > 0 && (
                <span className="ml-1.5 bg-zinc-900 text-white py-0.5 px-2 rounded-full text-[10px] font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'favorites' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">灵感库</h2>
              <p className="text-zinc-500 mt-1 text-sm">您保存的设计提取结果和提示词。</p>
            </div>
            <Favorites
              favorites={favorites}
              onSelect={(design) => {
                setCurrentDesign(design);
                setCurrentImage(design.imageUrl);
                setView('extractor');
              }}
              onRemove={(id) => setFavorites(favorites.filter(f => f.id !== id))}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Input & Preview */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4">输入设计</h2>
                <ImageUploader onImageSelect={handleImageSelect} isLoading={isLoading} />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {currentImage && (
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-3 border-b border-zinc-200/80 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="text-sm font-bold text-zinc-700 ml-2">原图</h3>
                    {currentDesign && (
                      <button
                        onClick={toggleFavorite}
                        className={`p-2 rounded-xl transition-all ${isCurrentFavorite
                          ? 'bg-rose-50 text-rose-500 shadow-sm border border-rose-100'
                          : 'bg-white text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 border border-zinc-200'
                          }`}
                        title={isCurrentFavorite ? "取消收藏" : "收藏"}
                      >
                        <Heart className={`w-4 h-4 ${isCurrentFavorite ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-zinc-100/30">
                    <img
                      src={currentImage}
                      alt="Source"
                      className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-zinc-200/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7 flex flex-col h-full">
              {currentDesign ? (
                <ResultTabs design={currentDesign} />
              ) : (
                <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-zinc-200 border-dashed flex flex-col items-center justify-center text-zinc-400 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-zinc-300" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-700 mb-2">等待解析</h3>
                  <p className="max-w-sm text-sm text-zinc-500 leading-relaxed">上传 UI 截图以提取其设计特征、交互参数，并将其转换为 AI 编程指令。</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
