import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';

interface ProgressTrackerProps {
  progress: number;
  stage: string;
  fileName: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress, stage, fileName }) => {
  const isComplete = progress === 100;

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <Zap className="w-6 h-6 text-blue-500" />
        )}
        <h3 className="text-xl font-semibold text-white">
          {isComplete ? 'Processing Complete!' : 'Processing File'}
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            {fileName}
          </span>
          <span className="text-sm font-medium text-blue-400">
            {progress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              isComplete 
                ? 'bg-green-500' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-300 mb-2">{stage}</p>
        
        {!isComplete && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
          <p className="text-green-300 text-center">
            Your file has been successfully enhanced! You can now download the HD version.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;