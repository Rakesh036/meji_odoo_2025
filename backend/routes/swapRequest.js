import express from 'express';
import { createSwapRequest, getMySwapRequests } from '../controllers/SwapRequestController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// Create a new swap request - requires authentication
router.post('/create', isLoggedIn, createSwapRequest);

// Get all swap requests for the authenticated user - requires authentication
router.get('/my-requests', isLoggedIn, getMySwapRequests);

export default router; 