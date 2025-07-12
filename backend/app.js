import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import homeRoutes from './routes/home.js';
import swapRequestRoutes from './routes/swapRequest.js';
import { createUploadsDir } from './utils/fileUtils.js';

// Load environment variables first
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Connect to MongoDB
connectDB();

// Create uploads directory for profile photos
createUploadsDir();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    console.log('Static file request:', path);
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  next();
});

// Test route to check uploads directory
app.get('/api/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    const files = fs.readdirSync(uploadsDir);
    
    // Test if a specific file exists
    const { filename } = req.query;
    let fileExists = null;
    if (filename) {
      const filePath = path.join(uploadsDir, filename);
      fileExists = fs.existsSync(filePath);
    }
    
    res.json({ 
      message: 'Uploads directory contents',
      uploadsDir,
      files,
      fileExists,
      testFile: filename
    });
  } catch (error) {
    res.json({ 
      message: 'Error reading uploads directory',
      error: error.message,
      uploadsDir 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/swapRequest', swapRequestRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 