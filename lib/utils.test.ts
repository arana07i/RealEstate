import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatDate,
  slugify,
  validateEmail,
  validatePhone,
  sanitizeText,
  sanitizeEmail,
} from './utils';

describe('formatPrice', () => {
  it('formats crore values', () => {
    expect(formatPrice(10000000)).toBe('₹1.00 Cr');
    expect(formatPrice(25000000)).toBe('₹2.50 Cr');
    expect(formatPrice(12345678)).toBe('₹1.23 Cr');
  });

  it('formats lakh values', () => {
    expect(formatPrice(100000)).toBe('₹1.00 Lakh');
    expect(formatPrice(500000)).toBe('₹5.00 Lakh');
    expect(formatPrice(123456)).toBe('₹1.23 Lakh');
  });

  it('formats small values in INR', () => {
    expect(formatPrice(500)).toBe('₹500');
    expect(formatPrice(1000)).toBe('₹1,000');
  });
});

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    const result = formatDate('2024-06-15');
    expect(result).toMatch(/15 June 2024|June 15, 2024/);
  });

  it('formats date strings with time', () => {
    const result = formatDate('2024-12-25T10:30:00Z');
    expect(result).toMatch(/25 December 2024|December 25, 2024/);
  });
});

describe('slugify', () => {
  it('converts text to lowercase URL slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('Hello   World---Test')).toBe('hello-world-test');
  });

  it('trims leading and trailing spaces', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });
});

describe('validateEmail', () => {
  it('validates correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.in')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('validates correct phone numbers', () => {
    expect(validatePhone('+91 9876543210')).toBe(true);
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('+1 555-123-4567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('')).toBe(false);
    expect(validatePhone('abc')).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('removes HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
  });

  it('normalizes whitespace', () => {
    expect(sanitizeText('Hello   World')).toBe('Hello World');
  });

  it('trims and truncates to 5000 characters', () => {
    const longText = 'a'.repeat(6000);
    expect(sanitizeText(longText).length).toBe(5000);
    expect(sanitizeText(`  test  `)).toBe('test');
  });
});

describe('sanitizeEmail', () => {
  it('removes dangerous characters and normalizes', () => {
    expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
    expect(sanitizeEmail('te<>st@example.com')).toBe('test@example.com');
  });

  it('truncates to 254 characters max', () => {
    const longEmail = 'a'.repeat(300) + '@example.com';
    expect(sanitizeEmail(longEmail).length).toBe(254);
  });
});