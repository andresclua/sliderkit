import { describe, it, expect } from 'vitest'
import { clamp, lerp, normalize, mod, roundTo } from '../../src/utils/math'

describe('clamp()', () => {
  it('returns value when within range', () => expect(clamp(5, 0, 10)).toBe(5))
  it('returns min when below range', () => expect(clamp(-1, 0, 10)).toBe(0))
  it('returns max when above range', () => expect(clamp(15, 0, 10)).toBe(10))
})

describe('lerp()', () => {
  it('returns start when t=0', () => expect(lerp(0, 10, 0)).toBe(0))
  it('returns end when t=1', () => expect(lerp(0, 10, 1)).toBe(10))
  it('returns midpoint when t=0.5', () => expect(lerp(0, 10, 0.5)).toBe(5))
})

describe('normalize()', () => {
  it('returns 0 when value equals min', () => expect(normalize(0, 0, 10)).toBe(0))
  it('returns 1 when value equals max', () => expect(normalize(10, 0, 10)).toBe(1))
  it('returns 0.5 at midpoint', () => expect(normalize(5, 0, 10)).toBe(0.5))
  it('returns 0 when min equals max', () => expect(normalize(5, 5, 5)).toBe(0))
})

describe('mod()', () => {
  it('handles positive modulo', () => expect(mod(7, 5)).toBe(2))
  it('handles negative modulo correctly', () => expect(mod(-1, 5)).toBe(4))
  it('returns 0 for exact multiple', () => expect(mod(10, 5)).toBe(0))
})

describe('roundTo()', () => {
  it('rounds to specified decimals', () => expect(roundTo(1.2345, 2)).toBe(1.23))
  it('rounds up', () => expect(roundTo(1.236, 2)).toBe(1.24))
})
