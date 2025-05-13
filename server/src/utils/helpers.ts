/**
 * Formats a date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Calculates the number of days between two dates
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
};

/**
 * Checks if a date is in the past
 */
export const isDatePast = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Checks if a date is within a specified number of days from now
 */
export const isDateWithinDays = (date: Date, days: number): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  return date <= futureDate && date >= today;
};

/**
 * Generates a random alphanumeric string of specified length
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Formats a phone number to a standard format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a Nigerian number
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+234${cleaned.substring(1)}`;
  } else {
    return `+234${cleaned}`;
  }
};

/**
 * Validates a Nigerian phone number
 */
export const isValidNigerianPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian number
  if (cleaned.startsWith('234')) {
    return cleaned.length === 13;
  } else if (cleaned.startsWith('0')) {
    return cleaned.length === 11;
  } else {
    return cleaned.length === 10;
  }
};
