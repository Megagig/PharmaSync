import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import {
  morganMiddleware,
  requestLogger,
} from './middleware/logger.middleware';
import env from './config/env.config';
import { scheduleFollowUpNotificationsJob } from './jobs/followUpNotifications.job';
import logger from './utils/logger';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      env.NODE_ENV === 'production'
        ? env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except specific endpoints
app.use((req, res, next) => {
  // Skip rate limiting for purchases endpoints in development
  if (env.NODE_ENV === 'development' && req.path.includes('/api/purchases')) {
    return next();
  }
  return limiter(req, res, next);
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morganMiddleware);
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Schedule jobs
if (env.NODE_ENV === 'production') {
  // Only schedule jobs in production to avoid running them in development and test environments
  scheduleFollowUpNotificationsJob();
}

export default app;
