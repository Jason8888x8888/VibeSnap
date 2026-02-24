import React, { useState } from 'react';
import { ExtractedDesign } from '../types';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Info } from 'lucide-react';

interface ResultTabsProps {
  design: ExtractedDesign;
}

export function ResultTabs({ design }: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'prompt'>('tokens');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(design.vibePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyAllTokens = () => {
    const tokensData = {
      summary: design.summary,
      keywords: design.keywords,
      colors: design.colors,
      fonts: design.fonts,
      visualAttributes: design.visualAttributes
    };
    navigator.clipboard.writeText(JSON.stringify(tokensData, null, 2));
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2000);
  };

  const handleCopyItem = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-200 p-2 gap-2 bg-slate-50/50">
        {[
          { id: 'tokens', label: '设计总结' },
          { id: 'prompt', label: '设计提示词' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'tokens' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Summary Section */}
            <div className="relative bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm font-bold text-slate-800">设计风格</h3>
                  {design.styleName && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
                      {design.styleName}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleCopyAllTokens}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-xs font-medium transition-colors shadow-sm flex-shrink-0"
                  title="复制全部 JSON"
                >
                  {copiedTokens ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTokens ? '已复制' : '复制 JSON'}</span>
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">{design.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {design.keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Colors Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">核心色板</h3>
                <span className="text-[10px] text-slate-400 ml-3 bg-slate-100 px-2 py-0.5 rounded-full">点击卡片复制 HEX</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {design.colors.map((color, i) => {
                  const id = `color-${i}`;
                  const isCopied = copiedItem === id;
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleCopyItem(color.hex, id)}
                      className="group relative flex flex-col p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    >
                      <div 
                        className="w-full h-12 rounded-lg shadow-inner border border-black/5 mb-3 flex-shrink-0" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate" title={color.name}>{color.name}</span>
                        <span className="text-xs font-mono text-slate-500 mt-0.5">{color.hex}</span>
                        <span className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight" title={color.usage}>{color.usage}</span>
                      </div>
                      
                      {/* Hover/Active Overlay */}
                      <div className={`absolute inset-0 bg-white/90 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 ${isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isCopied ? (
                          <span className="flex items-center text-emerald-600 text-xs font-bold"><Check className="w-4 h-4 mr-1.5" /> 已复制</span>
                        ) : (
                          <span className="flex items-center text-indigo-600 text-xs font-bold"><Copy className="w-4 h-4 mr-1.5" /> 复制 HEX</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography & Visual Attributes Bento Grid */}
            <div className="flex flex-col gap-8">
              
              {/* Typography */}
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800">字体排版</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {design.fonts.map((font, i) => {
                    const id = `font-${i}`;
                    const isCopied = copiedItem === id;
                    return (
                      <div 
                        key={i} 
                        onClick={() => handleCopyItem(font, id)}
                        className="group relative p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center w-full overflow-hidden"
                      >
                        <span className="truncate pr-8 text-sm">{font}</span>
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm pl-2 py-1 rounded-l-md">
                          {isCopied ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                  {design.fonts.length === 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-sm text-slate-400 text-center col-span-full">
                      未检测到特定字体
                    </div>
                  )}
                </div>
              </div>

              {/* Visual Attributes */}
              <div>
                <div className="flex items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800">视觉属性</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '圆角', value: design.visualAttributes.borderRadius, id: 'attr-radius', desc: '控制元素的边角圆润程度，影响整体的柔和感或锐利感。' },
                    { label: '阴影', value: design.visualAttributes.shadows, id: 'attr-shadows', desc: '提供元素的层次感和深度，常用于卡片、按钮或悬浮状态。' },
                    { label: '边框', value: design.visualAttributes.borders, id: 'attr-borders', desc: '定义元素的边界样式，用于区分内容区块或强调交互状态。' },
                    { label: '间距', value: design.visualAttributes.spacing, id: 'attr-spacing', desc: '决定元素之间的留白策略，影响界面的呼吸感和信息密度。' },
                  ].map((attr) => {
                    const isCopied = copiedItem === attr.id;
                    return (
                      <div 
                        key={attr.id}
                        onClick={() => handleCopyItem(attr.value, attr.id)}
                        className="group flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer relative h-full"
                      >
                        <div className="flex items-center mb-2 pr-6">
                          <span className="text-xs font-semibold text-slate-500">{attr.label}</span>
                          <div className="relative ml-1.5 flex items-center group/tooltip">
                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-lg text-center pointer-events-none leading-relaxed">
                              {attr.desc}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <span className="text-sm font-mono text-slate-800 break-words" title={attr.value}>
                            {attr.value}
                          </span>
                        </div>

                        <div className="absolute top-3.5 right-3.5">
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">设计提示词</h3>
              <button 
                onClick={handleCopyPrompt}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {copiedPrompt ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrompt ? '已复制！' : '复制提示词'}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-sm leading-relaxed shadow-inner border border-slate-800">
              <div className="markdown-body prose prose-invert max-w-none">
                <ReactMarkdown>{design.vibePrompt}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

