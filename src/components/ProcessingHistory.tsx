import React from 'react';
import { History, Download, FileImage, Video, Calendar, Settings } from 'lucide-react';
import { HistoryEntry } from '../types';

interface ProcessingHistoryProps {
  history: HistoryEntry[];
  onDownload: (filename: string) => void;
}

const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({ history, onDownload }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'bg-purple-600';
      case '2K': return 'bg-blue-600';
      case '1080p': return 'bg-green-600';
      case '720p': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <History className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Processing History</h2>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Processing History</h3>
          <p className="text-gray-500">
            Your processed files will appear here once you start enhancing photos or videos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {entry.type === 'video' ? (
                      <Video className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FileImage className="w-5 h-5 text-blue-500" />
                    )}
                    <h3 className="text-lg font-semibold text-white">
                      {entry.originalFile}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getQualityBadgeColor(entry.options.quality)}`}>
                      {entry.options.quality}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDate(entry.processedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>
                        {entry.type === 'video' 
                          ? `${entry.options.frameRate} ${entry.options.format?.toUpperCase()}`
                          : `${entry.options.brightness}% brightness, ${entry.options.contrast}% contrast`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Processing Options Summary */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.options.sharpen && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                        Sharpened
                      </span>
                    )}
                    {entry.options.brightness !== 0 && (
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">
                        Brightness: {entry.options.brightness > 0 ? '+' : ''}{entry.options.brightness}%
                      </span>
                    )}
                    {entry.options.contrast !== 0 && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
                        Contrast: {entry.options.contrast > 0 ? '+' : ''}{entry.options.contrast}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDownload(entry.processedFile)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ml-4"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessingHistory;