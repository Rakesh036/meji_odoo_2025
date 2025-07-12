import { 
  createSwapRequest as createSwapRequestService, 
  getMySwapRequests as getMySwapRequestsService,
  cancelSwapRequest as cancelSwapRequestService,
  acceptSwapRequest as acceptSwapRequestService,
  rejectSwapRequest as rejectSwapRequestService
} from '../service/swapRequestService.js';

/**
 * Create a new swap request
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const createSwapRequest = async (req, res) => {
  try {
    // Get authenticated user data from middleware
    const requesterId = req.userId;
    const { recipientId, skillOffered, skillRequested, message } = req.body;

    // Validate required fields
    if (!recipientId || !skillOffered || !skillRequested) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, skill offered, and skill requested are required'
      });
    }

    // Validate that requester is not trying to create a request to themselves
    if (requesterId === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a swap request to yourself'
      });
    }

    // Call the service function
    const result = await createSwapRequestService({
      requesterId,
      recipientId,
      skillOffered,
      skillRequested,
      message
    });

    // Send success response
    res.status(201).json(result);

  } catch (error) {
    console.error('Swap request controller error:', error);

    // Handle specific errors
    if (error.message === 'Recipient not found') {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    if (error.message === 'Invalid skill validation') {
      return res.status(400).json({
        success: false,
        message: 'Invalid skills. Skills must be from your offered/wanted lists'
      });
    }

    if (error.message === 'Duplicate request exists') {
      return res.status(409).json({
        success: false,
        message: 'A swap request already exists between these users for these skills'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get all swap requests for the authenticated user
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const getMySwapRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type = 'all' // 'sent', 'received', or 'all'
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-50'
      });
    }

    // Call the service function
    const result = await getMySwapRequestsService({
      userId,
      page: pageNum,
      limit: limitNum,
      status,
      type
    });

    // Send success response
    res.status(200).json(result);

  } catch (error) {
    console.error('Get swap requests controller error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Cancel a swap request
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const cancelSwapRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Call the service function
    const result = await cancelSwapRequestService(requestId, userId);

    // Send success response
    res.status(200).json(result);

  } catch (error) {
    console.error('Cancel swap request controller error:', error);

    // Handle specific errors
    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (error.message === 'Unauthorized to cancel this request') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel requests that you sent'
      });
    }

    if (error.message === 'Cannot cancel non-pending request') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Accept a swap request
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const acceptSwapRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Call the service function
    const result = await acceptSwapRequestService(requestId, userId);

    // Send success response
    res.status(200).json(result);

  } catch (error) {
    console.error('Accept swap request controller error:', error);

    // Handle specific errors
    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (error.message === 'Unauthorized to accept this request') {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests sent to you'
      });
    }

    if (error.message === 'Cannot accept non-pending request') {
      return res.status(400).json({
        success: false,
        message: 'Can only accept pending requests'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Reject a swap request
 * @param {Object} req - Express request object (contains user data from middleware)
 * @param {Object} res - Express response object
 */
export const rejectSwapRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Call the service function
    const result = await rejectSwapRequestService(requestId, userId);

    // Send success response
    res.status(200).json(result);

  } catch (error) {
    console.error('Reject swap request controller error:', error);

    // Handle specific errors
    if (error.message === 'Swap request not found') {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (error.message === 'Unauthorized to reject this request') {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests sent to you'
      });
    }

    if (error.message === 'Cannot reject non-pending request') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject pending requests'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
}; 