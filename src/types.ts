export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface ProcessingOptions {
  quality: '720p' | '1080p' | '2K' | '4K';
  brightness: number;
  contrast: number;
  sharpen: boolean;
  frameRate: '30fps' | '60fps';
  format: 'mp4' | 'mkv' | 'webm';
}

export interface HistoryEntry {
  id: string;
  originalFile: string;
  processedFile: string;
  processedAt: string;
  options: ProcessingOptions;
  type: 'image' | 'video';
}