import React, { useState, useCallback } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFileSelect, 
  accept = '.csv,.xlsx', 
  maxSizeMB = 10,
  className 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  }, []);

  const validateAndSelect = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxSizeMB}MB limit.`);
      return;
    }
    
    // Simplistic type check (can be improved based on accept string)
    const isCsvOrXlsx = file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
    if (!isCsvOrXlsx) {
      setError('Only CSV and XLSX files are supported.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-500/5" : "border-slate-700 bg-slate-800/30 hover:bg-slate-800/50",
          error && "border-red-500 bg-red-500/5"
        )}
      >
        <input 
          type="file" 
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
              <File className="w-8 h-8" />
            </div>
            <p className="text-white font-medium mb-1">{selectedFile.name}</p>
            <p className="text-sm text-slate-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:text-blue-400 transition-colors">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-400">CSV or XLSX (Max. {maxSizeMB}MB)</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 flex items-center text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};
