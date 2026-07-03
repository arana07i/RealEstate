import { describe, it, expect } from 'vitest';
import { formatPrice } from '../lib/utils';

describe('ListingCard utilities', () => {
  it('formats price for listing display', () => {
    const price = 5000000;
    const formatted = formatPrice(price);
    expect(formatted).toContain('₹');
    expect(formatted).toBeTruthy();
  });
});