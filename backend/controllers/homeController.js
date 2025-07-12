import { getSkillMatches as getSkillMatchesService } from '../service/userService.js';

/**
 * Get skill matches for the authenticated user
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const getSkillMatches = async (req, res) => {
  try {
    // Get user data from middleware
    const userId = req.userId;
    const user = req.user;
    
    // Call the service function with the authenticated user's ID
    const result = await getSkillMatchesService(userId);
    console.log(result)
    // Send success response
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Home controller error:', error);
    
    // Handle specific errors
    if (error.message === 'User not found') {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
