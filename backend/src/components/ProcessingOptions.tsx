import React, { useState } from 'react';
import { Settings, Sliders, Play } from 'lucide-react';
import { ProcessingOptions as ProcessingOptionsType } from '../types';

interface ProcessingOptionsProps {
  fileType: 'image' | 'video';
  onProcess: (options: ProcessingOptionsType) => void;
  disabled: boolean;
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({ fileType, onProcess, disabled }) => {
  const [options, setOptions] = useState<ProcessingOptionsType>({
    quality: '1080p',
    brightness: 0,
    contrast: 0,
    sharpen: false,
    frameRate: '30fps',
    format: 'mp4'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess(options);
  };

  const qualityOptions = [
    { value: '720p', label: '720p HD (1280x720)' },
    { value: '1080p', label: '1080p Full HD (1920x1080)' },
    { value: '2K', label: '2K QHD (2560x1440)' },
    { value: '4K', label: '4K UHD (3840x2160)' }
  ];

  const frameRateOptions = [
    { value: '30fps', label: '30 FPS' },
    { value: '60fps', label: '60 FPS' }
  ];

  const formatOptions = [
    { value: 'mp4', label: 'MP4' },
    { value: 'mkv', label: 'MKV' },
    { value: 'webm', label: 'WebM' }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-semibold text-white">Processing Options</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Output Quality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {qualityOptions.map((quality) => (
              <button
                key={quality.value}
                type="button"
                onClick={() => setOptions(prev => ({ ...prev, quality: quality.value as any }))}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  options.quality === quality.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{quality.value}</div>
                <div className="text-xs opacity-75">{quality.label.split(' (')[1]?.replace(')', '')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Image-specific options */}
        {fileType === 'image' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Sliders className="w-4 h-4 text-blue-500" />
              <h4 className="text-lg font-medium text-white">Image Filters</h4>
            </div>

            {/* Brightness */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brightness: {options.brightness}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.brightness}
                onChange={(e) => setOptions(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contrast: {options.contrast}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={options.contrast}
                onChange={(e) => setOptions(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Sharpen */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sharpen"
                checked={options.sharpen}
                onChange={(e) => setOptions(prev => ({ ...prev, sharpen: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="sharpen" className="text-sm font-medium text-gray-300">
                Apply sharpening filter
              </label>
            </div>
          </div>
        )}

        {/* Video-specific options */}
        {fileType === 'video' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Play className="w-4 h-4 text-blue-500" />
              <h4 className="text-lg font-medium text-white">Video Options</h4>
            </div>

            {/* Frame Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frame Rate
              </label>
              <select
                value={options.frameRate}
                onChange={(e) => setOptions(prev => ({ ...prev, frameRate: e.target.value as any }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {frameRateOptions.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Output Format
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {formatOptions.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Process Button */}
        <button
          type="submit"
          disabled={disabled}
          className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
            disabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
          }`}
        >
          {disabled ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start HD Enhancement</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProcessingOptions;