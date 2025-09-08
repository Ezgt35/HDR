import React, { useState, useRef } from 'react';
import { Upload, FileImage, Video, AlertCircle } from 'lucide-react';
import { FileInfo } from '../types';

interface FileUploadProps {
  onFileUpload: (file: FileInfo) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP) or video (MP4, AVI, MKV, MOV, WebM) file.');
      return;
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const fileInfo: FileInfo = await response.json();
      onFileUpload(fileInfo);
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300">Uploading your file...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-blue-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <FileImage className="w-4 h-4 text-blue-400" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <Video className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-2">
              Upload Your Media
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Drag and drop your photos or videos here, or click to browse. 
              Supported formats: JPEG, PNG, WebP, MP4, AVI, MKV, MOV, WebM
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <Upload className="w-5 h-5" />
              <span>Choose Files</span>
            </button>

            <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4" />
                <span>Images up to 4K</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Videos up to 500MB</span>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;