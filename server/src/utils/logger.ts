// src/utils/logger.ts
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format based on environment settings
const logFormat = (process.env.LOG_FORMAT || 'pretty') === 'pretty'
  ? winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
  )
  : winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

// Define transports
const transports: winston.transport[] = [
  // Console transport is always enabled
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
];

// Add file transport if enabled
if (process.env.LOG_FILE_ENABLED === 'true') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'pharmasync-api' },
  transports: transports,
  exitOnError: false
});

export default logger;