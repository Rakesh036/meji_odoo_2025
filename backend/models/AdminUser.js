import BaseUser from './BaseUser.js';
import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  adminLevel: {
    type: String,
    enum: ['super', 'moderator', 'support'],
    default: 'moderator'
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_content', 'view_analytics', 'ban_users']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const AdminUser = BaseUser.discriminator('AdminUser', adminUserSchema);

export default AdminUser; 