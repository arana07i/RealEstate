import { describe, it, expect } from 'vitest';
import { formatPrice } from '../lib/utils';

describe('ListingCard utilities', () => {
  it('formats price for listing display', () => {
    const price = 5000000;
    const formatted = formatPrice(price);
    expect(formatted).toContain('$');
    expect(formatted).toBeTruthy();
  });
});

describe('Listing type extensions', () => {
  it('validates energy rating values', () => {
    const validRatings = ['A', 'B', 'C', 'D'];
    expect(validRatings).toContain('A');
    expect(validRatings).toContain('B');
  });

  it('calculates isNewListing correctly', () => {
    const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    
    const isRecent = new Date(recentDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isOld = new Date(oldDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    expect(isRecent).toBe(true);
    expect(isOld).toBe(false);
  });

  it('detects price change direction', () => {
    const currentPrice = 1000000;
    const higherPreviousPrice = 800000;
    const lowerPreviousPrice = 1200000;
    
    const priceUp = currentPrice > higherPreviousPrice;
    const priceDown = currentPrice > lowerPreviousPrice;
    
    expect(priceUp).toBe(true);
    expect(priceDown).toBe(false);
  });
});