import DOMPurify from 'dompurify';

/**
 * SECURITY UTILITY: Input Sanitization
 *
 * This utility provides functions to sanitize user input and prevent XSS attacks.
 * All user-generated content should be sanitized before rendering.
 */

// Configure DOMPurify for safe HTML sanitization
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - Raw HTML string
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(html, purifyConfig);
};

/**
 * Sanitize plain text by removing all HTML tags and special characters
 * @param text - Raw text string
 * @returns Sanitized plain text
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove all HTML tags
  const withoutHtml = text.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters
  const sanitized = withoutHtml
    .replace(/[<>'"&]/g, '') // Remove HTML special chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();

  return sanitized;
};

/**
 * Sanitize user comments/reviews for safe display
 * @param comment - Raw comment string
 * @returns Sanitized comment
 */
export const sanitizeComment = (comment: string): string => {
  if (!comment || typeof comment !== 'string') {
    return '';
  }

  // Allow basic formatting but remove dangerous content
  const basicFormatConfig = {
    ALLOWED_TAGS: ['br'], // Only allow line breaks
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  };

  return DOMPurify.sanitize(comment, basicFormatConfig);
};

/**
 * Sanitize URLs to prevent javascript: and data: protocols
 * @param url - Raw URL string
 * @returns Sanitized URL or empty string if dangerous
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:') ||
    trimmedUrl.startsWith('file:')
  ) {
    return '';
  }

  // Only allow http, https, and relative URLs
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('./') ||
    trimmedUrl.startsWith('../')
  ) {
    return url.trim();
  }

  return '';
};

/**
 * Validate and sanitize email addresses
 * @param email - Raw email string
 * @returns Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(trimmedEmail)) {
    return trimmedEmail;
  }

  return '';
};

/**
 * Sanitize phone numbers
 * @param phone - Raw phone string
 * @returns Sanitized phone number
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except + and spaces
  const sanitized = phone.replace(/[^\d+\s-()]/g, '').trim();

  return sanitized;
};

/**
 * SECURITY UTILITY: Rate Limiting
 * Simple client-side rate limiting to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the action (e.g., 'login', 'signup')
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if allowed
 */
export const isRateLimited = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (entry.count >= maxAttempts) {
    return true; // Rate limited
  }

  // Increment count
  entry.count++;
  return false;
};

/**
 * Get remaining time until rate limit resets
 * @param key - Unique identifier for the action
 * @returns remaining time in seconds, or 0 if not rate limited
 */
export const getRateLimitResetTime = (key: string): number => {
  const entry = rateLimitStore.get(key);
  if (!entry) return 0;

  const now = Date.now();
  if (now > entry.resetTime) return 0;

  return Math.ceil((entry.resetTime - now) / 1000);
};
