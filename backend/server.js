import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import sharp from 'sharp';
import Jimp from 'jimp';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ez-HD Backend Server is running!', 
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      upload: '/api/upload',
      processImage: '/api/process-image',
      processVideo: '/api/process-video',
      download: '/api/download/:filename',
      history: '/api/history',
      health: '/api/health'
    }
  });
});

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|avi|mkv|mov|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Processing history
let processingHistory = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedAt: new Date().toISOString()
    };

    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process image endpoint
app.post('/api/process-image', async (req, res) => {
  try {
    const { fileId, filename, options } = req.body;
    const socketId = req.headers['x-socket-id'];
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const inputPath = path.join(__dirname, 'uploads', filename);
    const outputFilename = `processed-${Date.now()}-${filename}`;
    const outputPath = path.join(__dirname, 'processed', outputFilename);

    // Emit progress start
    if (socketId) {
      io.to(socketId).emit('processProgress', { progress: 0, stage: 'Starting image processing...' });
    }

    // Get target dimensions based on quality
    let targetWidth, targetHeight;
    switch (options.quality) {
      case '720p':
        targetWidth = 1280;
        targetHeight = 720;
        break;
      case '1080p':
        targetWidth = 1920;
        targetHeight = 1080;
        break;
      case '2K':
        targetWidth = 2560;
        targetHeight = 1440;
        break;
      case '4K':
        targetWidth = 3840;
        targetHeight = 2160;
        break;
      default:
        targetWidth = 1920;
        targetHeight = 1080;
    }

    // Emit progress update
    if (socketId) {
      io.to(socketId).emit('processProgress', { progress: 20, stage: 'Processing with Sharp...' });
    }

    // Process with Sharp first
    let sharpImage = sharp(inputPath);
    
    // Get original metadata
    const metadata = await sharpImage.metadata();
    
    // Calculate new dimensions maintaining aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio > targetWidth / targetHeight) {
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else {
      targetWidth = Math.round(targetHeight * aspectRatio);
    }

    // Apply Sharp processing
    sharpImage = sharpImage
      .resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      })
      .sharpen()
      .jpeg({ quality: 95 });

    const tempPath = path.join(__dirname, 'processed', `temp-${outputFilename}`);
    await sharpImage.toFile(tempPath);

    if (socketId) {
      io.to(socketId).emit('processProgress', { progress: 60, stage: 'Applying filters with Jimp...' });
    }

    // Process with Jimp for additional filters
    const jimpImage = await Jimp.read(tempPath);
    
    if (options.brightness && options.brightness !== 0) {
      jimpImage.brightness(options.brightness / 100);
    }
    
    if (options.contrast && options.contrast !== 0) {
      jimpImage.contrast(options.contrast / 100);
    }
    
    if (options.sharpen) {
      jimpImage.convolute([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
      ]);
    }

    await jimpImage.writeAsync(outputPath);
    
    // Clean up temp file
    fs.unlinkSync(tempPath);

    if (socketId) {
      io.to(socketId).emit('processProgress', { progress: 100, stage: 'Processing complete!' });
    }

    // Add to history
    const historyEntry = {
      id: uuidv4(),
      originalFile: filename,
      processedFile: outputFilename,
      processedAt: new Date().toISOString(),
      options,
      type: 'image'
    };
    
    processingHistory.unshift(historyEntry);
    if (processingHistory.length > 50) {
      processingHistory = processingHistory.slice(0, 50);
    }

    res.json({
      success: true,
      processedFile: outputFilename,
      downloadUrl: `/api/download/${outputFilename}`
    });

  } catch (error) {
    console.error('Image processing error:', error);
    const socketId = req.headers['x-socket-id'];
    if (socketId) {
      io.to(socketId).emit('processError', { error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Process video endpoint (mock implementation - FFmpeg would be used in production)
app.post('/api/process-video', async (req, res) => {
  try {
    const { filename, options } = req.body;
    const socketId = req.headers['x-socket-id'];
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Mock video processing since FFmpeg is not available in WebContainer
    if (socketId) {
      io.to(socketId).emit('processProgress', { progress: 0, stage: 'Starting video processing...' });
      
      // Simulate processing stages
      setTimeout(() => {
        io.to(socketId).emit('processProgress', { progress: 25, stage: 'Analyzing video stream...' });
      }, 1000);
      
      setTimeout(() => {
        io.to(socketId).emit('processProgress', { progress: 50, stage: 'Upscaling video frames...' });
      }, 2000);
      
      setTimeout(() => {
        io.to(socketId).emit('processProgress', { progress: 75, stage: 'Encoding final video...' });
      }, 3000);
      
      setTimeout(() => {
        io.to(socketId).emit('processProgress', { progress: 100, stage: 'Video processing complete!' });
        
        const historyEntry = {
          id: uuidv4(),
          originalFile: filename,
          processedFile: `processed-${filename}`,
          processedAt: new Date().toISOString(),
          options,
          type: 'video'
        };
        
        processingHistory.unshift(historyEntry);
        
        // Note: In production, you would use FFmpeg here
        res.json({
          success: true,
          processedFile: `processed-${filename}`,
          downloadUrl: `/api/download/processed-${filename}`,
          note: 'Video processing is mocked in this demo. In production, FFmpeg would handle video processing.'
        });
      }, 4000);
    }

  } catch (error) {
    console.error('Video processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'processed', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Get processing history
app.get('/api/history', (req, res) => {
  res.json(processingHistory);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Ez-HD Server running on port ${PORT}`);
  console.log(`Frontend should connect to: http://localhost:${PORT}`);
});