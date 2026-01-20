import { describe, it, expect } from 'vitest';
import { SeededRandom } from '@dopamine-orbs/shared';

describe('SeededRandom', () => {
  it('should produce same sequence with same seed', () => {
    const r1 = new SeededRandom(12345);
    const r2 = new SeededRandom(12345);
    
    const values1 = Array.from({ length: 10 }, () => r1.next());
    const values2 = Array.from({ length: 10 }, () => r2.next());
    
    expect(values1).toEqual(values2);
  });

  it('should produce different sequences with different seeds', () => {
    const r1 = new SeededRandom(12345);
    const r2 = new SeededRandom(67890);
    
    const values1 = Array.from({ length: 10 }, () => r1.next());
    const values2 = Array.from({ length: 10 }, () => r2.next());
    
    expect(values1).not.toEqual(values2);
  });

  it('should generate integers in range', () => {
    const r = new SeededRandom(12345);
    const value = r.nextInt(5, 10);
    
    expect(value).toBeGreaterThanOrEqual(5);
    expect(value).toBeLessThanOrEqual(10);
    expect(Number.isInteger(value)).toBe(true);
  });
});
