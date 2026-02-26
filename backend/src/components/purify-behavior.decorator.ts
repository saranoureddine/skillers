import { Transform } from 'class-transformer';

// Simple HTML sanitization (for production, use a proper library like DOMPurify)
function sanitizeHtml(html: string): string {
  // Basic XSS prevention - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Purify Behavior Decorator
 * Sanitizes HTML content to prevent XSS attacks
 * Use this decorator on DTO properties that may contain HTML
 */
export function Purify() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeHtml(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) => (typeof item === 'string' ? sanitizeHtml(item) : item));
    }
    if (typeof value === 'object' && value !== null) {
      const purified: any = {};
      for (const key in value) {
        if (typeof value[key] === 'string') {
          purified[key] = sanitizeHtml(value[key]);
        } else {
          purified[key] = value[key];
        }
      }
      return purified;
    }
    return value;
  });
}
