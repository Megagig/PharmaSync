import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmasync',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || 'user@example.com',
    password: process.env.EMAIL_PASSWORD || 'password',
    from: process.env.EMAIL_FROM || 'noreply@pharmasync.com',
  },
  
  // Integration configurations
  integrations: {
    // Electronic Health Record (EHR) system
    ehr: {
      enabled: process.env.EHR_INTEGRATION_ENABLED || 'false',
      baseUrl: process.env.EHR_API_BASE_URL || 'https://api.ehrsystem.example.com',
      apiKey: process.env.EHR_API_KEY || '',
    },
    
    // Pharmacy Management System
    pharmacySystem: {
      enabled: process.env.PHARMACY_SYSTEM_INTEGRATION_ENABLED || 'false',
      baseUrl: process.env.PHARMACY_SYSTEM_API_BASE_URL || 'https://api.pharmacysystem.example.com',
      apiKey: process.env.PHARMACY_SYSTEM_API_KEY || '',
    },
    
    // Drug Information Database
    drugDatabase: {
      enabled: process.env.DRUG_DATABASE_INTEGRATION_ENABLED || 'false',
      baseUrl: process.env.DRUG_DATABASE_API_BASE_URL || 'https://api.drugdatabase.example.com',
      apiKey: process.env.DRUG_DATABASE_API_KEY || '',
    },
  },
  
  // Scheduled jobs configuration
  scheduledJobs: {
    followUpReminders: {
      enabled: process.env.FOLLOW_UP_REMINDERS_ENABLED || 'true',
      cronSchedule: process.env.FOLLOW_UP_REMINDERS_CRON || '0 0 * * *', // Daily at midnight
    },
    inventoryAlerts: {
      enabled: process.env.INVENTORY_ALERTS_ENABLED || 'true',
      cronSchedule: process.env.INVENTORY_ALERTS_CRON || '0 9 * * *', // Daily at 9 AM
    },
    dataBackup: {
      enabled: process.env.DATA_BACKUP_ENABLED || 'true',
      cronSchedule: process.env.DATA_BACKUP_CRON || '0 1 * * *', // Daily at 1 AM
    },
  },
  
  // File upload configuration
  fileUpload: {
    maxSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
    allowedTypes: (process.env.FILE_UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf').split(','),
    uploadDir: process.env.FILE_UPLOAD_DIR || 'uploads',
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};

export default config;
