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
    expect(csv).toContain('Counts')
    expect(csv).toContain('膠袋,3')
    expect(csv).toContain('Weights')
    expect(csv).toContain('發泡膠,1.5')
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
    expect(csv).toContain('Counts')
    expect(csv).toContain('膠袋,3')
    expect(csv).toContain('煙頭,10')
    expect(csv).toContain('Weights')
    expect(csv).toContain('發泡膠,1.5')
    expect(csv).toContain('其他垃圾,2.2')
  })
})
