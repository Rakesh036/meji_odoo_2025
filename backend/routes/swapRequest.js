import express from 'express';
import { createSwapRequest } from '../controllers/swapRequestController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// Create a new swap request - requires authentication
router.post('/create', isLoggedIn, createSwapRequest);

export default router; 