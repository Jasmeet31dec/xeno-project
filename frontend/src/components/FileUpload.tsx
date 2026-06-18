import React, { useState, useRef } from 'react';
import { Upload, FileType, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (jobId: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }
    setError(null);
    onUploadSuccess(file as any);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive ? "border-primary bg-indigo-50" : "border-slate-300 hover:border-primary"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center">
          <div className="p-4 bg-indigo-100 rounded-full mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload transaction dataset</h3>
          <p className="text-slate-500 mb-6">Drag and drop your CSV file here, or click to browse</p>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <FileType size={16} /> <span>CSV format</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={16} /> <span>Auto-validation</span>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
    </div>
  );
};
