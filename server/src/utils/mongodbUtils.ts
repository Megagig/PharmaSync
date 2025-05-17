/**
 * MongoDB Utility Functions
 * Provides helper functions for MongoDB connections
 */

import logger from './logger';

/**
 * Converts a MongoDB SRV connection string to a direct connection string
 *
 * @param uri The MongoDB SRV connection string
 * @returns The direct connection string
 */
export const convertSrvToDirectUri = (uri: string): string => {
  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  // If it's already a direct connection string, return it as is
  if (!uri.includes('mongodb+srv://')) {
    return uri;
  }

  try {
    // Extract parts from the SRV connection string
    const regex = /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)(\?.*)?/;
    const matches = uri.match(regex);

    if (!matches) {
      logger.warn('Could not parse MongoDB SRV URI, using original URI');
      return uri;
    }

    const [, username, password, host, database, queryParams] = matches;

    // Create a direct connection string for MongoDB Atlas
    // For Atlas clusters, we need to connect to all three shard servers
    const clusterName = host.split('.')[0];
    const domain = host.split('.').slice(1).join('.');

    // Build the direct connection string with all three shard servers
    const directUri = `mongodb://${encodeURIComponent(
      username
    )}:${encodeURIComponent(
      password
    )}@${clusterName}-shard-00-00.${domain}:27017,${clusterName}-shard-00-01.${domain}:27017,${clusterName}-shard-00-02.${domain}:27017/${database}?ssl=true&authSource=admin&replicaSet=atlas-${
      host.split('-')[0] || clusterName.split('-')[0]
    }`;

    logger.info('Converted SRV connection string to direct connection string');
    return directUri;
  } catch (error) {
    logger.error('Error converting SRV connection string:', error);
    return uri;
  }
};

/**
 * Gets the appropriate MongoDB connection string based on environment
 *
 * @param useDirect Whether to use a direct connection string
 * @returns The MongoDB connection string
 */
export const getMongoConnectionString = (
  useDirect: boolean = false
): string => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MongoDB URI is required. Please check your .env file.');
  }

  if (useDirect) {
    return convertSrvToDirectUri(mongoUri);
  }

  return mongoUri;
};
