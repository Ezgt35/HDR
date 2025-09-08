import React from 'react';
import { FileImage, Video, Download, RotateCcw, CheckCircle } from 'lucide-react';
import { FileInfo } from '../types';

interface FilePreviewProps {
  file: FileInfo;
  processedFile?: string | null;
  onReset: () => void;
  onDownload: (filename: string) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, processedFile, onReset, onDownload }) => {
  const isVideo = file.mimetype.startsWith('video/');
  const fileUrl = `http://localhost:3001/uploads/${file.filename}`;
  
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          {isVideo ? <Video className="w-5 h-5 text-blue-500" /> : <FileImage className="w-5 h-5 text-blue-500" />}
          <span>File Preview</span>
        </h3>
        
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* File Info */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-white mb-2">{file.originalName}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <span className="text-gray-500">Type:</span> {file.mimetype}
          </div>
          <div>
            <span className="text-gray-500">Size:</span> {formatFileSize(file.size)}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Original File</h4>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          {isVideo ? (
            <video 
              src={fileUrl} 
              controls 
              className="w-full max-h-64 rounded-lg"
              preload="metadata"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img 
              src={fileUrl} 
              alt="Preview" 
              className="w-full max-h-64 object-contain rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Download Section */}
      {processedFile && (
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-medium text-white">Processing Complete!</h4>
          </div>
          
          <button
            onClick={() => onDownload(processedFile)}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Download HD Version</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FilePreview;