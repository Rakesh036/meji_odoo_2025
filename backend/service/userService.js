import User from "../models/User.js";

export const getSkillMatches = async (userId) => {
  try {
    console.log('Getting skill matches for userId:', userId);
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    console.log('Current user found:', {
      id: currentUser._id,
      name: currentUser.name,
      skillsOffered: currentUser.skillsOffered,
      skillsWanted: currentUser.skillsWanted,
      availability: currentUser.availability
    });

    // Get all public users except current user
    const allUsers = await User.find({
      _id: { $ne: currentUser._id },
      isPublic: true,
      isBanned: false,
    });

    const data = [];

    allUsers.forEach((user) => {
      let matchCount = 0;

      // Check if user has required fields
      if (!user.availability || !currentUser.availability) {
        console.log('Skipping user due to missing availability:', user._id);
        return;
      }

      if (!user.skillsOffered || !user.skillsWanted || !currentUser.skillsOffered || !currentUser.skillsWanted) {
        console.log('Skipping user due to missing skills:', user._id);
        return;
      }

      // 1. Availability match (check if any overlapping day is available)
      const availMatch = (
        user.availability.weekdays && currentUser.availability.weekdays
      ) || (
        user.availability.weekends && currentUser.availability.weekends
      ) || (
        user.availability.custom && currentUser.availability.custom &&
        user.availability.customText === currentUser.availability.customText
      );

      if (availMatch) matchCount++;

      // 2. Does currentUser want something user offers?
      const offeredMatch = user.skillsOffered.some(skill =>
        currentUser.skillsWanted.includes(skill)
      );
      if (offeredMatch) matchCount++;

      // 3. Does currentUser offer something user wants?
      const wantedMatch = user.skillsWanted.some(skill =>
        currentUser.skillsOffered.includes(skill)
      );
      if (wantedMatch) matchCount++;

      // Add user to data array with match count
      if (matchCount > 0) {
        data.push({
          ...user.toObject(),
          matchCount: matchCount,
          matchType: matchCount === 3 ? 'perfect' : matchCount === 2 ? 'good' : 'basic'
        });
      }
    });

    // Sort by match count (highest first)
    data.sort((a, b) => b.matchCount - a.matchCount);

    return { 
      success: true,
      currentUser: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        location: currentUser.location,
        skillsOffered: currentUser.skillsOffered,
        skillsWanted: currentUser.skillsWanted,
        availability: currentUser.availability
      },
      data: data,
      totalMatches: data.length
    };
  } catch (error) {
    console.error("Skill matching error:", error);
    throw error;
  }
};