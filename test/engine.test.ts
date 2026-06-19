import { describe, it, expect } from 'vitest'
import { createEmptyState, addEntry, undoAction, exportCSV, setEventInfo } from '../src/lib/engine'

describe('tally engine', () => {
  it('adds counts and weights and updates totals', () => {
    let s = createEmptyState()
    const r1 = addEntry(s, '膠水樽', 5, 'count')
    s = r1.state
    expect(s.totals['膠水樽']).toBe(5)

    const r2 = addEntry(s, '膠水樽', 2, 'count')
    s = r2.state
    expect(s.totals['膠水樽']).toBe(7)

    const r3 = addEntry(s, '發泡膠', 1.5, 'weight')
    s = r3.state
    expect(s.totals['發泡膠']).toBeCloseTo(1.5)
  })

  it('undoes an action', () => {
    let s = createEmptyState()
    const r1 = addEntry(s, '煙頭', 10, 'count')
    s = r1.state
    const r2 = addEntry(s, '煙頭', 5, 'count')
    s = r2.state
    const id = r2.action.id

    s = undoAction(s, id)
    expect(s.totals['煙頭']).toBe(10)
  })

  it('exports CSV with separate Counts and Weights sections', () => {
    let s = createEmptyState()
    s = setEventInfo(s, { Date: '2026-06-19', Location: 'Beach A' })
    s = addEntry(s, '膠袋', 3, 'count').state
    s = addEntry(s, '發泡膠', 1.5, 'weight').state

    expect(s.countTotals?.['膠袋']).toBe(3)
    expect(s.weightTotals?.['發泡膠']).toBe(1.5)

    const csv = exportCSV(s)
    expect(csv).toContain('Date,2026-06-19')
    expect(csv).toContain('數量')
    expect(csv).toContain('膠袋,3')
    expect(csv).toContain('秤重')
    expect(csv).toContain('發泡膠,1.5')

    // Requirement 1: show categories even if they are 0, and keep original order
    expect(csv).toContain('飲筒,0')
    expect(csv).toContain('其他垃圾,0')

    const idxYintong = csv.indexOf('飲筒,0')
    const idxJiaodai = csv.indexOf('膠袋,3')
    const idxYantou = csv.indexOf('煙頭,0')
    expect(idxYintong).toBeLessThan(idxJiaodai)
    expect(idxJiaodai).toBeLessThan(idxYantou)
  })

  it('reconstructs separate totals for legacy states in exportCSV', () => {
    // Create a legacy-style state with only totals, no countTotals/weightTotals
    const legacyState = {
      eventInfo: { Date: '2026-06-19' },
      totals: {
        '膠袋': 3,
        '發泡膠': 1.5,
        '其他垃圾': 2.2,
        '煙頭': 10
      },
      actions: []
    } as any

    const csv = exportCSV(legacyState)
    expect(csv).toContain('數量')
    expect(csv).toContain('膠袋,3')
    expect(csv).toContain('煙頭,10')
    expect(csv).toContain('秤重')
    expect(csv).toContain('發泡膠,1.5')
    expect(csv).toContain('其他垃圾,2.2')
  })

  it('enforces rounding rules for counts and weights', () => {
    let s = createEmptyState()
    // 0.1 + 0.2 is 0.30000000000000004 in JS, we should round it to 0.3
    s = addEntry(s, '發泡膠', 0.1, 'weight').state
    s = addEntry(s, '發泡膠', 0.2, 'weight').state
    expect(s.totals['發泡膠']).toBe(0.3)
    expect(s.weightTotals?.['發泡膠']).toBe(0.3)

    // Check count rounding (always integer)
    s = addEntry(s, '煙頭', 1.6, 'count').state
    expect(s.totals['煙頭']).toBe(2)
    expect(s.countTotals?.['煙頭']).toBe(2)
  })
})
