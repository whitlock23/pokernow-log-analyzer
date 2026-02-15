import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadProps {
  onUploadSuccess: () => void;
}

interface UploadResult {
  filename: string;
  status: 'success' | 'error';
  hands_count?: number;
  error?: string;
}

const Upload: React.FC<UploadProps> = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles(prev => [...prev, ...Array.from(newFiles)]);
      setResults([]); // Clear previous results
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // Note: 'files' matches backend param name
    });

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResults(response.data.details);
      setFiles([]); // Clear queue on success
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      // Handle global error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all text-center ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple
          onChange={(e) => handleFiles(e.target.files)} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".csv"
        />
        
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mb-4">
            <UploadCloud size={32} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Support multiple PokerNow CSV files
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>Files to upload ({files.length})</span>
            <button 
              onClick={() => setFiles([])}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {files.map((file, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-md">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleUpload} 
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>Processing...</>
              ) : (
                <>Upload {files.length} Files</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-top-2">
          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-100 dark:border-green-900/30">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Upload Complete</h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.map((res, idx) => (
              <li key={idx} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {res.status === 'success' ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <AlertCircle size={18} className="text-red-500" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{res.filename}</div>
                  {res.status === 'success' ? (
                    <div className="text-xs text-green-600 dark:text-green-400">Processed {res.hands_count} hands</div>
                  ) : (
                    <div className="text-xs text-red-600 dark:text-red-400">{res.error}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Upload;