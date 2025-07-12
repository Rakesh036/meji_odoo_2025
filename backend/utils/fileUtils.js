import fs from 'fs';
import path from 'path';

export const createUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  console.log('Checking uploads directory:', uploadsDir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
  } else {
    console.log('Uploads directory already exists');
  }
};

export const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}_${randomString}${extension}`;
}; 