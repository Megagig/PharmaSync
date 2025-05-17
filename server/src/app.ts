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
import { logger } from './utils/logger';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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
