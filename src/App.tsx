import React, { useEffect, useMemo, useState } from 'react'
import {
  Action as EngineAction,
  State as EngineState,
  addEntry,
  createEmptyState,
  exportCSV,
  undoAction,
  setEventInfo
} from './lib/engine'
import Numpad from './components/Numpad'
import CategoryGrid from './components/CategoryGrid'
import ActionLog from './components/ActionLog'

const STORAGE_KEY = 'coastline_state_v1'

const groupedCount = [
  {
    title: '生活垃圾與遊憩行為',
    items: [
      '飲筒', '飲品杯', '硬膠食物容器', '發泡膠容器', '外賣餐具',
      '膠水樽', '膠水樽樽蓋', '其他飲品與食物容器', '非食物的瓶罐與容器',
      '膠袋', '食品包裝袋', '生果網',
      '金屬罐', '紙包/鋁包飲品盒', '玻璃瓶', '衣物/鞋履/袋'
    ]
  },
  {
    title: '醫療/個人衛生用品',
    items: ['牙刷','針筒/針頭','棉花棒','口罩']
  },
  {
    title: '漁業與休閒釣魚',
    items: ['釣魚用具','浮標浮球浮筒','漁網與繩子']
  },
  {
    title: '其他',
    items: ['煙頭','火機','其他']
  }
]

const groupedWeight = [
  { title: 'Weights', items: ['發泡膠','其他垃圾'] }
]

function loadState(): EngineState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyState()
    return JSON.parse(raw) as EngineState
  } catch (e) {
    return createEmptyState()
  }
}

function saveState(s: EngineState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch (e) {
    // ignore
  }
}

export default function App() {
  const [engineState, setEngineState] = useState<EngineState>(() => loadState())
  const [numpadValue, setNumpadValue] = useState('')
  const [mode, setMode] = useState<'count' | 'weight'>('count')

  useEffect(() => saveState(engineState), [engineState])

  const totals = useMemo(() => engineState.totals, [engineState])

  function handleCategoryClick(category: string) {
    const val = numpadValue.trim() === '' ? 1 : Number(numpadValue)
    if (!isFinite(val)) return
    const { state } = addEntry(engineState, category, val, mode)
    setEngineState(state)
    setNumpadValue('')
  }

  function handleUndo(action: EngineAction) {
    setEngineState(prev => undoAction(prev, action.id))
  }

  function handleExport() {
    const csv = exportCSV(engineState)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'beach_cleanup_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearSession() {
    const resp = window.prompt('Type DELETE to permanently clear session data')
    if (resp === 'DELETE') {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {}
      setEngineState(createEmptyState())
    }
  }

  function updateEventInfo(info: Record<string, string>) {
    setEngineState(prev => setEventInfo(prev, info))
  }

  return (
    <div className="app">
      <header>
        <h1>Beach Cleanup Tally</h1>
        <div>
          <button onClick={() => setMode('count')} disabled={mode === 'count'}>Count</button>
          <button onClick={() => setMode('weight')} disabled={mode === 'weight'}>Weight</button>
          <button onClick={handleExport}>Download CSV</button>
          <button onClick={clearSession}>Clear Session</button>
        </div>
      </header>

      <section className="event-info">
        <label>
          Date: <input value={engineState.eventInfo.Date || ''} onChange={e => updateEventInfo({ Date: e.target.value })} />
        </label>
        <label>
          Location: <input value={engineState.eventInfo.Location || ''} onChange={e => updateEventInfo({ Location: e.target.value })} />
        </label>
      </section>

      <CategoryGrid
        groups={mode === 'count' ? groupedCount : groupedWeight}
        totals={totals}
        onCategoryClick={handleCategoryClick}
      />

      <ActionLog actions={engineState.actions.slice(0, 3)} onUndo={handleUndo} />

      <Numpad
        value={numpadValue}
        onChange={setNumpadValue}
        allowDecimal={mode === 'weight'}
      />
    </div>
  )
}
