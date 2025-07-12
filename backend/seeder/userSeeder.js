import User from '../models/User.js';
import { baseUserData } from './data/baseUserData.js';


const getCompleteUserData = () => {
  return baseUserData.map(userData => ({
    ...userData,
    isPublic: true,
    isBanned: false,
    availability: {
      weekdays: Math.random() > 0.5,
      weekends: Math.random() > 0.5,
      custom: Math.random() > 0.7,
      customText: Math.random() > 0.7 ? "Available on request" : ""
    }
  }));
};

const deleteData = async () => {
  try {
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users from database`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error deleting users:', error.message);
    throw error;
  }
};

const insertData = async () => {
  try {
    const completeUserData = getCompleteUserData();
    console.log('completeUserData', completeUserData);
    
    const users = await User.insertMany(completeUserData);
    console.log(`✅ Inserted ${users.length} users into database`);
    return users.length;
  } catch (error) {
    console.error('❌ Error inserting users:', error.message);
    throw error;
  }
};

export const userSeeder = {
  deleteData,
  insertData
};
