import User from "../models/User.js";

export const getSkillMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all public users except current user
    const allUsers = await User.find({
      _id: { $ne: currentUser._id },
      isPublic: true,
      isBanned: false,
    });

    const perfectMatches = [];
    const twoMatches = [];
    const oneMatch = [];

    allUsers.forEach((user) => {
      let matchCount = 0;

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

      // Categorize match
      if (matchCount === 3) {
        perfectMatches.push(user);
      } else if (matchCount === 2) {
        twoMatches.push(user);
      } else if (matchCount === 1) {
        oneMatch.push(user);
      }
    });

    res.json({ perfectMatches, twoMatches, oneMatch });
  } catch (error) {
    console.error("Skill matching error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
