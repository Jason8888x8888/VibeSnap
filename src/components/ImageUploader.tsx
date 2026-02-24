import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export function ImageUploader({ onImageSelect, isLoading }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelect(result, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-200 ease-in-out",
        isDragging ? "border-zinc-900 bg-zinc-100/80 scale-[0.99]" : "border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50 hover:border-zinc-400",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileInput}
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-zinc-500">
        {isLoading ? (
          <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
        ) : (
          <div className="p-4 bg-white rounded-full shadow-sm border border-zinc-100">
            <UploadCloud className="w-8 h-8 text-zinc-400" />
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-700">
            {isLoading ? "正在提取 DNA..." : "点击、拖拽或粘贴图片"}
          </p>
          {!isLoading && (
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">
              支持 PNG, JPG, WEBP 格式
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
