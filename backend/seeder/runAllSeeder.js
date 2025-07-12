import mongoose from 'mongoose';
import { userSeeder } from './userSeeder.js';
import connectDB from '../config/database.js';

export const deleteAllData = async () => {
  try {
    console.log('🗑️  Starting to delete all data...');
    
    await userSeeder.deleteData();
    
    console.log('✅ All data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting all data:', error.message);
    throw error;
  }
};

export const insertAllData = async () => {
  try {
    console.log('🌱 Starting to insert all data...');
    
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    await userSeeder.insertData();
    
    console.log('✅ All data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting all data:', error.message);
    throw error;
  }
};

export const runCompleteSeeder = async () => {
  try {
    console.log('🚀 Starting complete seeding process...');
    
    // Connect to database first
    await connectDB();
    
    await deleteAllData();
    await insertAllData();
    
    console.log('🎉 Complete seeding process finished successfully!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('💥 Seeding process failed:', error.message);
    throw error;
  }
};

runCompleteSeeder();
