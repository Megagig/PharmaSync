import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  // MongoDB
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmasync',
  MONGODB_URI_TEST:
    process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/pharmasync_test',

  // JWT
  JWT_SECRET:
    process.env.JWT_SECRET || 'default_jwt_secret_key_for_development',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d', // Legacy support
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    'default_refresh_token_secret_key_for_development',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000',
    10
  ), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
};

export default env;
