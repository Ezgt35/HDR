import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FilePreview from './components/FilePreview';
import ProcessingOptions from './components/ProcessingOptions';
import ProgressTracker from './components/ProgressTracker';
import ProcessingHistory from './components/ProcessingHistory';
import { FileInfo, ProcessingOptions as ProcessingOptionsType, HistoryEntry } from './types';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('processProgress', (data) => {
      setProgress(data.progress);
      setProgressStage(data.stage);
      
      if (data.progress === 100) {
        setTimeout(() => {
          setIsProcessing(false);
          fetchHistory();
        }, 1000);
      }
    });

    newSocket.on('processError', (data) => {
      console.error('Processing error:', data.error);
      setIsProcessing(false);
      setProgress(0);
      setProgressStage('Processing failed');
    });

    // Fetch initial history
    fetchHistory();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/history');
      const historyData = await response.json();
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleFileUpload = (file: FileInfo) => {
    setUploadedFile(file);
    setProcessedFile(null);
    setProgress(0);
    setProgressStage('');
  };

  const handleProcessFile = async (options: ProcessingOptionsType) => {
    if (!uploadedFile || !socket) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressStage('Preparing...');

    try {
      const isVideo = uploadedFile.mimetype.startsWith('video/');
      const endpoint = isVideo ? '/api/process-video' : '/api/process-image';
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-socket-id': socket.id || ''
        },
        body: JSON.stringify({
          fileId: uploadedFile.id,
          filename: uploadedFile.filename,
          options
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessedFile(result.processedFile);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setIsProcessing(false);
      setProgress(0);
      setProgressStage('Processing failed');
    }
  };

  const handleDownload = (filename: string) => {
    const downloadUrl = `http://localhost:3001/api/download/${filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setProcessedFile(null);
    setProgress(0);
    setProgressStage('');
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upload & Process
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Processing History
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="space-y-8">
            {/* File Upload Section */}
            {!uploadedFile && (
              <div className="max-w-4xl mx-auto">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            )}

            {/* File Preview and Processing Options */}
            {uploadedFile && !isProcessing && (
              <div className="grid lg:grid-cols-2 gap-8">
                <FilePreview 
                  file={uploadedFile} 
                  processedFile={processedFile}
                  onReset={resetUpload}
                  onDownload={handleDownload}
                />
                <ProcessingOptions 
                  fileType={uploadedFile.mimetype.startsWith('video/') ? 'video' : 'image'}
                  onProcess={handleProcessFile}
                  disabled={isProcessing}
                />
              </div>
            )}

            {/* Progress Tracker */}
            {isProcessing && (
              <div className="max-w-2xl mx-auto">
                <ProgressTracker 
                  progress={progress} 
                  stage={progressStage}
                  fileName={uploadedFile?.originalName || ''}
                />
              </div>
            )}
          </div>
        ) : (
          <ProcessingHistory 
            history={history} 
            onDownload={handleDownload}
          />
        )}
      </main>
    </div>
  );
}

export default App;