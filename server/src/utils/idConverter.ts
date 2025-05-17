import { Types } from 'mongoose';

/**
 * Converts a string ID to a MongoDB ObjectId
 * @param id String ID to convert
 * @returns MongoDB ObjectId
 */
export const toObjectId = (id: string): Types.ObjectId => {
  try {
    return new Types.ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
};

/**
 * Safely converts a string ID to a MongoDB ObjectId
 * If the conversion fails, returns the original string
 * @param id String ID to convert
 * @returns MongoDB ObjectId or the original string if conversion fails
 */
export const safeToObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  
  try {
    return new Types.ObjectId(id);
  } catch (error) {
    // Return a new ObjectId as fallback
    return new Types.ObjectId();
  }
};

/**
 * Converts a MongoDB ObjectId to a string
 * @param id MongoDB ObjectId to convert
 * @returns String representation of the ObjectId
 */
export const toString = (id: Types.ObjectId | string): string => {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
};
