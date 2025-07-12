import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'role', 
  timestamps: true,
};

const baseUserSchema = new mongoose.Schema({
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
  location: { 
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  profilePhoto: { 
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        try {
          // Handle both http/https URLs and localhost URLs
          if (v.startsWith('http://localhost') || v.startsWith('https://localhost')) {
            return true;
          }
          // Handle Cloudinary URLs and other valid URLs
          const url = new URL(v);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
          return false;
        }
      },
      message: 'Profile photo must be a valid URL (http/https, localhost, or Cloudinary)'
    }
  },
  petName: {
    type: String,
    required: [true, 'Pet name is required for password recovery'],
    trim: true
  }
}, baseOptions);

// Remove password from JSON output
baseUserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find user by email
baseUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by ID
baseUserSchema.statics.findUserById = function(id) {
  return this.findById(id);
};

// Static method to create user
baseUserSchema.statics.createUser = function(userData) {
  return this.create(userData);
};

// Static method to update user
baseUserSchema.statics.updateUser = function(id, updateData) {
  return this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const BaseUser = mongoose.model('BaseUser', baseUserSchema);

export default BaseUser; 