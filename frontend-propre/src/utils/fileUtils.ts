// src/utils/fileUtils.ts
import { ImageIcon, FileText } from 'lucide-react';

export const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <ImageIcon className="w-5 h-5 text-purple-500" />;
  }
  if (file.name.toLowerCase().endsWith('.pdf')) {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <FileText className="w-5 h-5 text-blue-500" />;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};