/**
 * Format a date to a string in the specified format
 * @param date - Date string or Date object
 * @param includeTime - Whether to include time in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  includeTime = false
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (includeTime) {
    return dateObj.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date to a string with time in the format "MM/DD/YYYY, HH:MM AM/PM"
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, true);
};

/**
 * Format a number as currency (Naira)
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number with commas as thousands separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-NG').format(value);
};

/**
 * Format a percentage value
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a phone number in Nigerian format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if it's a valid Nigerian number
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('234')) {
    // Convert international format to local
    const local = cleaned.substring(3);
    return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  // Return original if not matching expected format
  return phoneNumber;
};
