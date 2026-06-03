import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * High-performance Tailwind CSS Class Merger
 * Combines dynamic conditional class strings (via clsx) and cleanly resolves 
 * style clashing anomalies (via tailwind-merge) without clobbering base rules.
 * * @param inputs - Array of layout utility names or conditional maps
 * @returns Fully optimized, concatenated clean class template string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Transactional Financial Currency Formatter
 * Formats precise numeric values into localized, sleek currency strings.
 * * @param value - Numeric balance entry to modify
 * @param currencyCode - Target region specification currency token (Default: USD)
 */
export function formatCurrency(value: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Standardized Date Calendar Transformer
 * Re-maps variable string date timestamps into clean, human-scannable timelines.
 * * @param dateInput - Raw ISO date string target array
 * @param includeTime - Toggle switch flag to append runtime clocks (Default: false)
 */
export function formatDateTime(dateInput: string | Date, includeTime: boolean = false): string {
  const date = new Date(dateInput);
  
  const calendarOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    calendarOptions.hour = '2-digit';
    calendarOptions.minute = '2-digit';
  }

  return new Intl.NumberFormat('en-US', calendarOptions).format(date);
}

/**
 * High-Volume Media Storage Buffer Metric Calculator
 * Converts raw baseline bytes numbers into human-readable asset weight summaries.
 * Useful for validating limits on large file configurations (e.g. video files, voice models)
 * * @param bytes - Numeric length allocation metric
 * @param decimalPlaces - Desired fractional precision rounding tier (Default: 2)
 */
export function formatStorageBytes(bytes: number, decimalPlaces: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const baseUnit = 1024;
  const dimensionTiers = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const mathematicalExponentIndex = Math.floor(Math.log(bytes) / Math.log(baseUnit));
  const scaledFloatValue = parseFloat(
    (bytes / Math.pow(baseUnit, mathematicalExponentIndex)).toFixed(decimalPlaces)
  );

  return `${scaledFloatValue} ${dimensionTiers[mathematicalExponentIndex]}`;
}

/**
 * Network Access Security Session Token Handler
 * Safe interface to pull active application authorization vectors directly out of non-SSR space.
 * * @returns Clean bearer string access array or null if evaluating inside SSR lifecycle threads
 */
export function getAuthenticatedUserToken(): string | null {
  if (typeof window === 'undefined') {
    return null; // Suppress runtime crashes if Next.js attempts evaluation during build/SSR compilation loops
  }
  return localStorage.getItem('mirror_me_token');
}

/**
 * Truncate String Utility
 * Shortens long hashes, usernames, or filenames cleanly with an ellipsis.
 */
export function truncateString(str: string, maxLength: number = 30): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
