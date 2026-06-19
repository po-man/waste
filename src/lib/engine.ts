export type EntryType = 'count' | 'weight'

export type Action = {
  id: string
  category: string
  value: number
  type: EntryType
  timestamp: number
}

export type State = {
  eventInfo: Record<string, string>
  totals: Record<string, number>
  actions: Action[]
}

export function createEmptyState(): State {
  return { eventInfo: {}, totals: {}, actions: [] }
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function addEntry(state: State, category: string, value: number, type: EntryType): { state: State; action: Action } {
  if (!category) throw new Error('category required')
  if (!isFinite(value)) throw new Error('value must be finite')

  const action: Action = {
    id: makeId(),
    category,
    value,
    type,
    timestamp: Date.now()
  }

  const newTotals = { ...state.totals }
  newTotals[category] = (newTotals[category] || 0) + value

  const newState: State = {
    ...state,
    totals: newTotals,
    actions: [action, ...state.actions].slice(0, 100) // keep last 100
  }

  return { state: newState, action }
}

export function undoAction(state: State, actionId: string): State {
  const idx = state.actions.findIndex(a => a.id === actionId)
  if (idx === -1) return state

  const action = state.actions[idx]
  const newTotals = { ...state.totals }
  newTotals[action.category] = (newTotals[action.category] || 0) - action.value
  if (Math.abs(newTotals[action.category]) < 1e-9) delete newTotals[action.category]

  const newActions = state.actions.slice()
  newActions.splice(idx, 1)

  return { ...state, totals: newTotals, actions: newActions }
}

export function setEventInfo(state: State, info: Record<string, string>): State {
  return { ...state, eventInfo: { ...state.eventInfo, ...info } }
}

export function clearState(): State {
  return createEmptyState()
}

export function exportCSV(state: State): string {
  const rows: string[] = []
  // Export timestamp
  rows.push(`ExportTimestamp,${new Date().toISOString()}`)
  rows.push('')

  // Event info rows
  if (Object.keys(state.eventInfo).length) {
    rows.push('EventInfo,')
    for (const [k, v] of Object.entries(state.eventInfo)) {
      rows.push(`${escapeCsv(k)},${escapeCsv(v)}`)
    }
    rows.push('')
  }

  // Totals
  rows.push('Category,Total')
  for (const [cat, total] of Object.entries(state.totals)) {
    rows.push(`${escapeCsv(cat)},${total}`)
  }

  // Actions (optional)
  if (state.actions && state.actions.length) {
    rows.push('')
    rows.push('Actions')
    rows.push('Timestamp,Category,Type,Value')
    for (const a of state.actions.slice().reverse()) {
      rows.push(`${new Date(a.timestamp).toISOString()},${escapeCsv(a.category)},${a.type},${a.value}`)
    }
  }

  return rows.join('\n')
}

function escapeCsv(s: string) {
  if (s == null) return ''
  if (/[,\"\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}
