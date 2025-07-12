import BaseUser from './BaseUser.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const userSchema = new mongoose.Schema({
  skillsOffered: [{
    type: String,
    trim: true
  }],
  skillsWanted: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  availability: {
    weekdays: {
      type: Boolean,
      default: false
    },
    weekends: {
      type: Boolean,
      default: false
    },
    custom: {
      type: Boolean,
      default: false
    },
    customText: {
      type: String,
      default: ''
    }
  }
});

// Static method to delete profile photo
userSchema.statics.deleteProfilePhoto = async function(userId) {
  const user = await this.findById(userId);
  if (user && user.profilePhoto) {
    // Extract filename from URL if it's a full URL
    let filename = user.profilePhoto;
    if (user.profilePhoto.includes('/uploads/')) {
      filename = user.profilePhoto.split('/uploads/')[1];
    }
    
    const photoPath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    user.profilePhoto = null;
    await user.save();
  }
};

const User = BaseUser.discriminator('User', userSchema);

export default User; 