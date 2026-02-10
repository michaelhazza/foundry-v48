import multer from 'multer';
import path from 'path';
import { env } from '../lib/env';

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Create upload middleware with configurable limits
export const createUploadMiddleware = (options: {
  allowedMimeTypes: string[];
  maxSizeMb: number;
}) => {
  return multer({
    storage,
    limits: {
      fileSize: options.maxSizeMb * 1024 * 1024 // Convert MB to bytes
    },
    fileFilter: (req, file, cb) => {
      if (options.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${options.allowedMimeTypes.join(', ')}`));
      }
    }
  });
};

// Default upload middleware for file sources
export const uploadFile = createUploadMiddleware({
  allowedMimeTypes: [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ],
  maxSizeMb: parseInt(env.MAX_FILE_SIZE_MB || '100')
});
