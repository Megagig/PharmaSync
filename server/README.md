# PharmaSync Server

This is the backend server for the PharmaSync application, a comprehensive pharmaceutical care web application for pharmacists in Nigeria.

## Features

- Patient management
- Medication management
- Prescription management
- Inventory management
- Point of Sale (POS)
- Reporting and analytics
- User management and authentication
- Redis caching for improved performance
- Email notifications via Brevo

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (for caching)

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies

```bash
npm install
```

4. Create a `.env` file based on `.env.example`
5. Start the development server

```bash
npm run dev
```

## Email Service (Brevo)

The application uses Brevo (formerly Sendinblue) for sending transactional emails. This includes account verification, password reset, notifications, and reports.

### Configuration

Brevo configuration is defined in the `.env` file:

```
# Email Configuration (Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@pharmasync.com
EMAIL_FROM_NAME=PharmaSync
```

### Email Types

The following email types are supported:

- Welcome emails
- Registration confirmation emails
- Account approval/rejection emails
- Password reset emails
- Notification emails
- Report emails

### Testing the Email Service

You can test the Brevo email integration using the provided test script:

```bash
npx ts-node src/scripts/test-brevo-email.ts
```

Make sure to update the recipient email address in the script before running it.

## Redis Caching

The application uses Redis for caching API responses to improve performance and reduce database load.

### Configuration

Redis configuration is defined in the `.env` file:

```
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_TTL=3600 # Default TTL for cache items (1 hour)
```

### Cached Endpoints

The following endpoints are cached:

- GET `/api/patients` - List of all patients (5 minutes)
- GET `/api/patients/:id` - Individual patient details (10 minutes)
- GET `/api/medications` - List of all medications (5 minutes)
- GET `/api/medications/low-stock` - Low stock medications (5 minutes)
- GET `/api/medications/expiring` - Expiring medications (5 minutes)
- GET `/api/medications/database` - Medication database (1 hour)
- GET `/api/medications/:id` - Individual medication details (10 minutes)

### Cache Invalidation

Cache is automatically invalidated when data is modified:

- When a new patient is created, the patients list cache is cleared
- When a patient is updated or deleted, both the specific patient cache and the patients list cache are cleared
- When a new medication is created, all medication-related caches are cleared
- When a medication is updated or deleted, both the specific medication cache and all medication-related list caches are cleared

### Manual Cache Management

You can use the following functions in your code to manage the cache:

```typescript
import { clearCache, clearAllCache } from '../middleware/cache';

// Clear cache for a specific pattern
await clearCache('GET:/patients');

// Clear all cache
await clearAllCache();
```

### Cache Monitoring

The application includes a cache monitoring API that provides insights into the Redis cache:

- GET `/api/cache/stats` - Get cache statistics (hit rate, memory usage, etc.)
- GET `/api/cache/keys` - Get cache keys by pattern
- GET `/api/cache/key/:key` - Get details for a specific cache key
- DELETE `/api/cache/clear` - Clear all cache
- DELETE `/api/cache/clear/:pattern` - Clear cache by pattern

These endpoints are restricted to admin users only.

### Cache Warming

The application includes a cache warming utility that pre-populates the cache with frequently accessed data:

- The cache warming job runs every 15 minutes in production
- It warms up critical endpoints like medication lists, inventory alerts, and dashboard statistics
- This reduces the initial load time for users and improves overall performance

### Cache Versioning

The application includes a cache versioning system to handle schema changes:

- Global cache version for application-wide changes
- Resource-specific cache versions for targeted invalidation
- Versioned cache keys to avoid stale data after schema changes

### Cache Analytics

The application includes a cache analytics system to track cache performance:

- Hit rate tracking (global and per-resource)
- Response time tracking
- Resource-specific analytics
- Analytics API for monitoring and optimization

### Redis Cluster Support

The application supports Redis Cluster for high availability and scalability:

- Configurable cluster mode
- Automatic failover
- Distributed caching across multiple nodes
- Suitable for production environments with high traffic

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Testing

Run tests with:

```bash
npm test
```

## License

This project is licensed under the MIT License.
