import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort?: any;
  filter?: any;
}

export interface PaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

/**
 * Get pagination options from request query parameters
 * @param req Express request object
 * @param defaultLimit Default limit if not specified in query
 * @returns Pagination options
 */
export const getPaginationOptions = (
  req: Request,
  defaultLimit: number = 10
): PaginationOptions => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || defaultLimit;
  const skip = (page - 1) * limit;
  
  // Handle sorting
  let sort: any = {};
  if (req.query.sort) {
    const sortFields = (req.query.sort as string).split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    // Default sort by createdAt descending
    sort = { createdAt: -1 };
  }
  
  // Handle filtering
  const filter: any = {};
  
  // Extract filter parameters from query
  // Exclude pagination and sorting parameters
  Object.keys(req.query).forEach((key) => {
    if (
      !['page', 'limit', 'sort', 'fields', 'populate'].includes(key) &&
      req.query[key]
    ) {
      // Handle special filter operators
      if (key.includes('[')) {
        const fieldName = key.substring(0, key.indexOf('['));
        const operator = key.substring(
          key.indexOf('[') + 1,
          key.indexOf(']')
        );
        
        switch (operator) {
          case 'gt':
            filter[fieldName] = { $gt: req.query[key] };
            break;
          case 'gte':
            filter[fieldName] = { $gte: req.query[key] };
            break;
          case 'lt':
            filter[fieldName] = { $lt: req.query[key] };
            break;
          case 'lte':
            filter[fieldName] = { $lte: req.query[key] };
            break;
          case 'ne':
            filter[fieldName] = { $ne: req.query[key] };
            break;
          case 'regex':
            filter[fieldName] = {
              $regex: req.query[key],
              $options: 'i',
            };
            break;
          case 'in':
            filter[fieldName] = {
              $in: (req.query[key] as string).split(','),
            };
            break;
        }
      } else {
        filter[key] = req.query[key];
      }
    }
  });
  
  return { page, limit, skip, sort, filter };
};

/**
 * Create pagination result from data and total count
 * @param data Array of data items
 * @param totalItems Total number of items
 * @param options Pagination options
 * @returns Pagination result
 */
export const createPaginationResult = <T>(
  data: T[],
  totalItems: number,
  options: PaginationOptions
): PaginationResult<T> => {
  const { page, limit } = options;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
};
