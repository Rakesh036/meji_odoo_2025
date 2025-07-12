import SwapRequest from '../models/SwapRequest.js';
import User from '../models/User.js';

/**
 * Create a new swap request
 * @param {Object} params - Parameters for creating swap request
 * @param {string} params.requesterId - ID of the user making the request
 * @param {string} params.recipientId - ID of the user receiving the request
 * @param {string} params.skillOffered - Skill being offered by requester
 * @param {string} params.skillRequested - Skill being requested from recipient
 * @param {string} params.message - Optional message
 * @returns {Object} Created swap request
 */
export const createSwapRequest = async ({ requesterId, recipientId, skillOffered, skillRequested, message }) => {
  try {
    console.log('\n\n\n----------------------\ncreateSwapRequest', requesterId, recipientId, skillOffered, skillRequested, message);
    // Find both users
    const [requester, recipient] = await Promise.all([
      User.findById(requesterId),
      User.findById(recipientId)
    ]);

    // Validate recipient exists
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Validate recipient is public and not banned
    if (!recipient.isPublic || recipient.isBanned) {
      throw new Error('Cannot send request to this user');
    }

    // Validate skills
    // Check if requester actually offers the skill they're offering
    if (!requester.skillsOffered.includes(skillOffered)) {
      throw new Error('Invalid skill validation');
    }

    // Check if recipient actually offers the skill being requested
    if (!recipient.skillsOffered.includes(skillRequested)) {
      throw new Error('Invalid skill validation');
    }

    // Check if there's already a pending request between these users for these skills
    const existingRequest = await SwapRequest.findOne({
      requester: requesterId,
      recipient: recipientId,
      skillOffered: skillOffered,
      skillRequested: skillRequested,
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Duplicate request exists');
    }

    // Create the swap request
    const swapRequest = new SwapRequest({
      requester: requesterId,
      recipient: recipientId,
      skillOffered: skillOffered,
      skillRequested: skillRequested,
      message: message || '',
      status: 'pending'
    });

    await swapRequest.save();

    // Populate user details for response
    await swapRequest.populate([
      { path: 'requester', select: 'name email location profilePhoto' },
      { path: 'recipient', select: 'name email location profilePhoto' }
    ]);

    return {
      success: true,
      message: 'Swap request created successfully',
      swapRequest: {
        id: swapRequest._id,
        requester: swapRequest.requester,
        recipient: swapRequest.recipient,
        skillOffered: swapRequest.skillOffered,
        skillRequested: swapRequest.skillRequested,
        status: swapRequest.status,
        message: swapRequest.message,
        createdAt: swapRequest.createdAt
      }
    };

  } catch (error) {
    console.error('Swap request service error:', error);
    throw error;
  }
};

/**
 * Get all swap requests for a user with pagination and filtering
 * @param {Object} params - Parameters for fetching swap requests
 * @param {string} params.userId - ID of the user
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.status - Filter by status (optional)
 * @param {string} params.type - Filter by type: 'sent', 'received', or 'all' (default: 'all')
 * @returns {Object} Paginated swap requests organized by status
 */
export const getMySwapRequests = async ({ userId, page = 1, limit = 10, status, type = 'all' }) => {
  try {
    // Build query based on type
    let query = {};
    
    if (type === 'sent') {
      query.requester = userId;
    } else if (type === 'received') {
      query.recipient = userId;
    } else {
      // 'all' - get both sent and received
      query.$or = [
        { requester: userId },
        { recipient: userId }
      ];
    }

    // Add status filter if provided
    if (status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await SwapRequest.countDocuments(query);

    // Get paginated results with populated user details
    const swapRequests = await SwapRequest.find(query)
      .populate([
        { path: 'requester', select: 'name email location profilePhoto' },
        { path: 'recipient', select: 'name email location profilePhoto' }
      ])
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Organize by status
    const organized = {
      pending: [],
      accepted: [],
      rejected: [],
      cancelled: []
    };

    // Add request type (sent/received) to each request
    const requestsWithType = swapRequests.map(request => {
      const requestObj = request.toObject();
      const isSent = request.requester.toString() === userId;
      requestObj.requestType = isSent ? 'sent' : 'received';
      
      // Debug logging
      console.log('Request type determination:', {
        requestId: request._id,
        requesterId: request.requester.toString(),
        recipientId: request.recipient.toString(),
        userId: userId,
        isSent,
        requestType: requestObj.requestType,
        requesterName: request.requester.name,
        recipientName: request.recipient.name
      });
      
      return requestObj;
    });

    // Categorize by status
    requestsWithType.forEach(request => {
      organized[request.status].push(request);
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      data: {
        requests: organized,
        summary: {
          total: totalCount,
          pending: organized.pending.length,
          accepted: organized.accepted.length,
          rejected: organized.rejected.length,
          cancelled: organized.cancelled.length
        }
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    };

  } catch (error) {
    console.error('Get swap requests service error:', error);
    throw error;
  }
};

/**
 * Cancel a swap request
 * @param {string} requestId - ID of the swap request
 * @param {string} userId - ID of the user attempting to cancel
 * @returns {Object} Updated swap request
 */
export const cancelSwapRequest = async (requestId, userId) => {
  try {
    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate([
        { path: 'requester', select: 'name email location profilePhoto' },
        { path: 'recipient', select: 'name email location profilePhoto' }
      ]);

    if (!swapRequest) {
      throw new Error('Swap request not found');
    }

    // Check if user is the requester (only requester can cancel)
    console.log('\n\n---- swapRequest.requester.toString(): ', swapRequest.requester._id.toString());
    console.log('userId: ', userId);
    if (!swapRequest.requester._id.equals(userId)) {
      throw new Error('Unauthorized to cancel this request');
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      throw new Error('Cannot cancel non-pending request');
    }

    // Update the status to cancelled
    swapRequest.status = 'cancelled';
    await swapRequest.save();

    return {
      success: true,
      message: 'Swap request cancelled successfully',
      swapRequest: {
        id: swapRequest._id,
        requester: swapRequest.requester,
        recipient: swapRequest.recipient,
        skillOffered: swapRequest.skillOffered,
        skillRequested: swapRequest.skillRequested,
        status: swapRequest.status,
        message: swapRequest.message,
        createdAt: swapRequest.createdAt,
        updatedAt: swapRequest.updatedAt
      }
    };

  } catch (error) {
    console.error('Cancel swap request service error:', error);
    throw error;
  }
};

/**
 * Accept a swap request
 * @param {string} requestId - ID of the swap request
 * @param {string} userId - ID of the user attempting to accept
 * @returns {Object} Updated swap request
 */
export const acceptSwapRequest = async (requestId, userId) => {
  try {
    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate([
        { path: 'requester', select: 'name email location profilePhoto' },
        { path: 'recipient', select: 'name email location profilePhoto' }
      ]);

    if (!swapRequest) {
      throw new Error('Swap request not found');
    }

    // Check if user is the recipient (only recipient can accept)
    if (!swapRequest.recipient._id.equals(userId)) {
      throw new Error('Unauthorized to accept this request');
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      throw new Error('Cannot accept non-pending request');
    }

    // Update the status to accepted
    swapRequest.status = 'accepted';
    await swapRequest.save();

    return {
      success: true,
      message: 'Swap request accepted successfully',
      swapRequest: {
        id: swapRequest._id,
        requester: swapRequest.requester,
        recipient: swapRequest.recipient,
        skillOffered: swapRequest.skillOffered,
        skillRequested: swapRequest.skillRequested,
        status: swapRequest.status,
        message: swapRequest.message,
        createdAt: swapRequest.createdAt,
        updatedAt: swapRequest.updatedAt
      }
    };

  } catch (error) {
    console.error('Accept swap request service error:', error);
    throw error;
  }
};

/**
 * Reject a swap request
 * @param {string} requestId - ID of the swap request
 * @param {string} userId - ID of the user attempting to reject
 * @returns {Object} Updated swap request
 */
export const rejectSwapRequest = async (requestId, userId) => {
  try {
    // Find the swap request
    const swapRequest = await SwapRequest.findById(requestId)
      .populate([
        { path: 'requester', select: 'name email location profilePhoto' },
        { path: 'recipient', select: 'name email location profilePhoto' }
      ]);

    if (!swapRequest) {
      throw new Error('Swap request not found');
    }

    // Check if user is the recipient (only recipient can reject)
    if (!swapRequest.recipient._id.equals(userId)) {
      throw new Error('Unauthorized to reject this request');
    }

    // Check if request is still pending
    if (swapRequest.status !== 'pending') {
      throw new Error('Cannot reject non-pending request');
    }

    // Update the status to rejected
    swapRequest.status = 'rejected';
    await swapRequest.save();

    return {
      success: true,
      message: 'Swap request rejected successfully',
      swapRequest: {
        id: swapRequest._id,
        requester: swapRequest.requester,
        recipient: swapRequest.recipient,
        skillOffered: swapRequest.skillOffered,
        skillRequested: swapRequest.skillRequested,
        status: swapRequest.status,
        message: swapRequest.message,
        createdAt: swapRequest.createdAt,
        updatedAt: swapRequest.updatedAt
      }
    };

  } catch (error) {
    console.error('Reject swap request service error:', error);
    throw error;
  }
}; 