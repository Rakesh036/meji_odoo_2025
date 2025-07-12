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

router.post('/create', isLoggedIn, createSwapRequest);
router.get('/my-requests', isLoggedIn, getMySwapRequests);
router.put('/cancel/:requestId', isLoggedIn, cancelSwapRequest);
router.put('/accept/:requestId', isLoggedIn, acceptSwapRequest);
router.put('/reject/:requestId', isLoggedIn, rejectSwapRequest);

export default router; 