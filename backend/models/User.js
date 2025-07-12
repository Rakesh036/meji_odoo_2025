import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  profilePhoto: {
    type: String,
    default: null
  },
  petName: {
    type: String,
    required: [true, 'Pet name is required for password recovery'],
    trim: true
  },
  skillsOffered: [{
    type: String,
    trim: true
  }],
  skillsWanted: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
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
}, {
  timestamps: true
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by ID
userSchema.statics.findUserById = function(id) {
  return this.findById(id);
};

// Static method to create user
userSchema.statics.createUser = function(userData) {
  return this.create(userData);
};

// Static method to update user
userSchema.statics.updateUser = function(id, updateData) {
  return this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

// Static method to delete profile photo
userSchema.statics.deleteProfilePhoto = async function(userId) {
  const user = await this.findById(userId);
  if (user && user.profilePhoto) {
    const photoPath = path.join(process.cwd(), 'uploads', user.profilePhoto);
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }
    user.profilePhoto = null;
    await user.save();
  }
};

const User = mongoose.model('User', userSchema);

export default User; 