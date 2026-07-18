import { describe, it, expect } from 'vitest';
import { getPageNumbers, clampPage } from './pagination';

describe('getPageNumbers', () => {
  it('returns all pages when total is 7 or less', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('returns first and last with ellipsis for large page counts', () => {
    const pages = getPageNumbers(1, 10);
    expect(pages).toEqual([1, 2, 'ellipsis', 10]);

    const middle = getPageNumbers(5, 10);
    expect(middle).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);

    const last = getPageNumbers(10, 10);
    expect(last).toEqual([1, 'ellipsis', 9, 10]);
  });

  it('clamps current page to valid range', () => {
    expect(getPageNumbers(0, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(100, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles edge case of total pages near current', () => {
    expect(getPageNumbers(2, 8)).toEqual([1, 2, 3, 'ellipsis', 8]);
    expect(getPageNumbers(7, 8)).toEqual([1, 'ellipsis', 6, 7, 8]);
  });
});

describe('clampPage', () => {
  it('returns 1 when totalPages is 0 or negative', () => {
    expect(clampPage(5, 0)).toBe(1);
    expect(clampPage(5, -1)).toBe(1);
  });

  it('clamps page to valid range', () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(11, 10)).toBe(10);
    expect(clampPage(5, 10)).toBe(5);
  });
});
