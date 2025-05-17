// src/config/env.config.ts
import dotenv from 'dotenv';
import { cleanEnv, str, num, bool } from 'envalid';

// Load environment variables from .env file
dotenv.config();

const env = cleanEnv(process.env, {
  // Server Configuration
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: num({ default: 5000 }),
  API_VERSION: str({ default: 'v1' }),
  CORS_ORIGIN: str({ default: 'http://localhost:5173,http://localhost:3000' }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }), // 15 minutes
  RATE_LIMIT_MAX: num({ default: 100 }), // 100 requests per windowMs

  // MongoDB Configuration
  MONGODB_URI: str({
    default:
      'mongodb://megagigdev:CGaPkfAtL73vikoI@ac-ixnxnxl-shard-00-00.io0gig6.mongodb.net:27017,ac-ixnxnxl-shard-00-01.io0gig6.mongodb.net:27017,ac-ixnxnxl-shard-00-02.io0gig6.mongodb.net:27017/PharmaSyncDB?ssl=true&replicaSet=atlas-ixnxnxl-shard-0&authSource=admin&retryWrites=true&w=majority',
  }),
  MONGODB_URI_TEST: str({
    default: 'mongodb://localhost:27017/pharmasync-test',
  }),
  MONGODB_URI_DEV: str({ default: 'mongodb://localhost:27017/pharmasync-dev' }),
  MONGODB_POOL_SIZE: num({ default: 10 }),
  MONGODB_CONNECT_TIMEOUT_MS: num({ default: 30000 }),

  // JWT Configuration
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '1d' }),
  JWT_ACCESS_EXPIRES_IN: str({ default: '15m' }),
  JWT_REFRESH_SECRET: str(),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),

  // Redis Configuration
  REDIS_URL: str({ default: 'redis://localhost:6379' }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_DB: num({ default: 0 }),
  REDIS_CLUSTER_URL: str({ default: 'redis://localhost:6379' }),
  REDIS_CLUSTER_ENABLED: bool({ default: false }),

  // Email Configuration (Brevo)
  BREVO_API_KEY: str({ default: '' }),
  EMAIL_FROM: str(),
  EMAIL_FROM_NAME: str({ default: 'PharmaSync' }),

  // Legacy Email Configuration (kept for backward compatibility)
  SMTP_HOST: str({ default: 'smtp.example.com' }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_USER: str({ default: '' }),
  SMTP_PASS: str({ default: '' }),

  // Storage Configuration
  STORAGE_TYPE: str({ choices: ['local', 's3'], default: 'local' }),
  STORAGE_PATH: str({ default: 'uploads' }),
  MAX_FILE_SIZE: num({ default: 5242880 }), // 5MB
  ALLOWED_FILE_TYPES: str({ default: 'image/jpeg,image/png,application/pdf' }),

  // AWS Configuration
  AWS_ACCESS_KEY_ID: str({ default: '' }),
  AWS_SECRET_ACCESS_KEY: str({ default: '' }),
  AWS_REGION: str({ default: '' }),
  AWS_BUCKET_NAME: str({ default: '' }),

  // EHR Integration Configuration
  EHR_API_URL: str({ default: 'https://api.ehrsystem.example.com' }),
  EHR_API_KEY: str({ default: '' }),
  EHR_ENABLED: bool({ default: false }),

  // Drug Database Integration Configuration
  RXNAV_API_URL: str({ default: 'https://rxnav.nlm.nih.gov/REST' }),
  RXNAV_API_KEY: str({ default: '' }),
  RXNAV_ENABLED: bool({ default: false }),
});

export default env;
