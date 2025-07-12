import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getSkills,
  updateProfile
} from '../controllers/authController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    console.log('Multer - Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/register', upload.single('profilePhoto'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/skills', getSkills);
router.put('/profile/:userId', upload.single('profilePhoto'), updateProfile);

export default router; 