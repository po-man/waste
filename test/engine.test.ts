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

  it('exports CSV', () => {
    let s = createEmptyState()
    s = setEventInfo(s, { Date: '2026-06-19', Location: 'Beach A' })
    s = addEntry(s, '膠袋', 3, 'count').state
    const csv = exportCSV(s)
    expect(csv).toContain('Date,2026-06-19')
    expect(csv).toContain('膠袋,3')
  })
})
