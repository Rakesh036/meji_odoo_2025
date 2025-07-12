import express from 'express';
import { getSkillMatches } from '../controllers/homeController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isLoggedIn, getSkillMatches);

export default router; 