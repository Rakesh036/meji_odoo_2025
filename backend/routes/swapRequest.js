import express from 'express';
import { 
  createSwapRequest, 
  getMySwapRequests, 
  cancelSwapRequest, 
  acceptSwapRequest, 
  rejectSwapRequest 
} from '../controllers/SwapRequestController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// Create a new swap request - requires authentication
router.post('/create', isLoggedIn, createSwapRequest);

// Get all swap requests for the authenticated user - requires authentication
router.get('/my-requests', isLoggedIn, getMySwapRequests);

// Cancel a swap request - requires authentication
router.put('/cancel/:requestId', isLoggedIn, cancelSwapRequest);

// Accept a swap request - requires authentication
router.put('/accept/:requestId', isLoggedIn, acceptSwapRequest);

// Reject a swap request - requires authentication
router.put('/reject/:requestId', isLoggedIn, rejectSwapRequest);

export default router; 