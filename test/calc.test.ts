import { describe, it, expect } from 'vitest'
import { calculateCoastline } from '../src/lib/calc'

describe('calculateCoastline', () => {
  it('returns 0 for empty or single point', () => {
    expect(calculateCoastline([])).toBe(0)
    expect(calculateCoastline([{ x: 0, y: 0 }])).toBe(0)
  })

  it('computes simple distances', () => {
    const pts = [{ x: 0, y: 0 }, { x: 3, y: 4 }]
    expect(calculateCoastline(pts)).toBeCloseTo(5)
  })
})
