export type EntryType = 'count' | 'weight'

export const DEFAULT_COUNT_CATEGORIES = [
  '飲筒', '飲品杯', '硬膠食物容器', '發泡膠容器', '外賣餐具',
  '膠水樽', '膠水樽樽蓋', '其他飲品與食物容器', '非食物的瓶罐與容器',
  '膠袋', '食品包裝袋', '生果網',
  '金屬罐', '紙包/鋁包飲品盒', '玻璃瓶', '衣物/鞋履/袋',
  '牙刷', '針筒/針頭', '棉花棒', '口罩',
  '釣魚用具', '浮標浮球浮筒', '漁網與繩子',
  '煙頭', '火機', '其他'
]

export const DEFAULT_WEIGHT_CATEGORIES = [
  '發泡膠', '其他垃圾'
]

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
  countTotals?: Record<string, number>
  weightTotals?: Record<string, number>
}

export function createEmptyState(): State {
  return { eventInfo: {}, totals: {}, actions: [], countTotals: {}, weightTotals: {} }
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function addEntry(state: State, category: string, value: number, type: EntryType): { state: State; action: Action } {
  if (!category) throw new Error('category required')
  if (!isFinite(value)) throw new Error('value must be finite')

  const processedValue = type === 'count' ? Math.round(value) : Math.round(value * 100) / 100

  const action: Action = {
    id: makeId(),
    category,
    value: processedValue,
    type,
    timestamp: Date.now()
  }

  const newTotals = { ...state.totals }
  const rawTotal = (newTotals[category] || 0) + processedValue
  newTotals[category] = type === 'count' ? Math.round(rawTotal) : Math.round(rawTotal * 100) / 100

  const countTotals = { ...(state.countTotals || {}) }
  const weightTotals = { ...(state.weightTotals || {}) }
  if (type === 'count') {
    const rawCount = (countTotals[category] || 0) + processedValue
    countTotals[category] = Math.round(rawCount)
  } else {
    const rawWeight = (weightTotals[category] || 0) + processedValue
    weightTotals[category] = Math.round(rawWeight * 100) / 100
  }

  const newState: State = {
    ...state,
    totals: newTotals,
    countTotals,
    weightTotals,
    actions: [action, ...state.actions].slice(0, 100) // keep last 100
  }

  return { state: newState, action }
}

export function undoAction(state: State, actionId: string): State {
  const idx = state.actions.findIndex(a => a.id === actionId)
  if (idx === -1) return state

  const action = state.actions[idx]
  const type = action.type
  const newTotals = { ...state.totals }
  const rawTotal = (newTotals[action.category] || 0) - action.value
  newTotals[action.category] = type === 'count' ? Math.round(rawTotal) : Math.round(rawTotal * 100) / 100
  if (Math.abs(newTotals[action.category]) < 1e-9) delete newTotals[action.category]

  const countTotals = { ...(state.countTotals || {}) }
  const weightTotals = { ...(state.weightTotals || {}) }
  if (type === 'count') {
    const rawCount = (countTotals[action.category] || 0) - action.value
    countTotals[action.category] = Math.round(rawCount)
    if (Math.abs(countTotals[action.category]) < 1e-9) delete countTotals[action.category]
  } else {
    const rawWeight = (weightTotals[action.category] || 0) - action.value
    weightTotals[action.category] = Math.round(rawWeight * 100) / 100
    if (Math.abs(weightTotals[action.category]) < 1e-9) delete weightTotals[action.category]
  }

  const newActions = state.actions.slice()
  newActions.splice(idx, 1)

  return { ...state, totals: newTotals, countTotals, weightTotals, actions: newActions }
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

  // Backward compatibility fallback
  let finalCountTotals = state.countTotals ? { ...state.countTotals } : null
  let finalWeightTotals = state.weightTotals ? { ...state.weightTotals } : null

  if (!finalCountTotals || !finalWeightTotals) {
    finalCountTotals = {}
    finalWeightTotals = {}
    const knownWeights = new Set(DEFAULT_WEIGHT_CATEGORIES)
    if (state.actions) {
      for (const a of state.actions) {
        if (a.type === 'weight') knownWeights.add(a.category)
      }
    }
    for (const [cat, val] of Object.entries(state.totals)) {
      if (knownWeights.has(cat)) {
        finalWeightTotals[cat] = val
      } else {
        finalCountTotals[cat] = val
      }
    }
  }

  // Counts Section
  rows.push('Counts')
  rows.push('Category,Total')
  const countKeys = new Set(DEFAULT_COUNT_CATEGORIES)
  for (const cat of DEFAULT_COUNT_CATEGORIES) {
    const total = finalCountTotals[cat] ?? 0
    rows.push(`${escapeCsv(cat)},${total}`)
  }
  for (const [cat, total] of Object.entries(finalCountTotals)) {
    if (!countKeys.has(cat)) {
      rows.push(`${escapeCsv(cat)},${total}`)
    }
  }
  rows.push('')

  // Weights Section
  rows.push('Weights')
  rows.push('Category,Total')
  const weightKeys = new Set(DEFAULT_WEIGHT_CATEGORIES)
  for (const cat of DEFAULT_WEIGHT_CATEGORIES) {
    const total = finalWeightTotals[cat] ?? 0
    rows.push(`${escapeCsv(cat)},${total}`)
  }
  for (const [cat, total] of Object.entries(finalWeightTotals)) {
    if (!weightKeys.has(cat)) {
      rows.push(`${escapeCsv(cat)},${total}`)
    }
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
