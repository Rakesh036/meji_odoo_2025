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

    console.log('requester: ', requester);
    console.log('accepter: ',recipient);
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