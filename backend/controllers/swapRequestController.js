import { createSwapRequest as createSwapRequestService } from '../service/swapRequestService.js';

export const createSwapRequest = async (req, res) => {
  try {
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