import { Upload } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Upload Log Files
      </h3>
      <p className="text-gray-500 mb-4">
        Drag and drop your log files here, or click to browse
      </p>
      <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
        Select File
        <input
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".log,.txt,.json"
        />
      </label>
      <p className="text-xs text-gray-400 mt-4">
        Supports: Apache, Nginx, Syslog, JSON, and generic log formats
      </p>
    </div>
  );
}
