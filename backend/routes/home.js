import express from 'express';
import { getSkillMatches } from '../controllers/homeController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// Home route to get skill matches - requires authentication
router.get('/', isLoggedIn, getSkillMatches);

export default router; 