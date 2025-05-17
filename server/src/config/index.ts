import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pharmasync',
  database: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/pharmasync',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    cookieExpires: parseInt(process.env.JWT_COOKIE_EXPIRES || '30', 10),
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@pharmasync.com',
    fromName: process.env.EMAIL_FROM_NAME || 'PharmaSync',
  },

  // Client URL for links in emails
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // File upload configuration
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5000000', 10), // 5MB
    allowedTypes: (
      process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf'
    ).split(','),
  },
};

export default config;
