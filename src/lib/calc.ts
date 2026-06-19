export type Point = { x: number; y: number }

/**
 * Simple polyline coastline length calculator.
 * Takes an ordered array of points and returns the total Euclidean length.
 */
export function calculateCoastline(points: Point[]): number {
  if (!points || points.length < 2) return 0
  let sum = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const dx = b.x - a.x
    const dy = b.y - a.y
    sum += Math.hypot(dx, dy)
  }
  return sum
}
