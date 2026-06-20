import React from 'react'
import { Action } from '../lib/engine'

type Props = {
  actions: Action[]
  onUndo: (a: Action) => void
  totals: Record<string, number>
}

export default function ActionLog({ actions, onUndo, totals }: Props) {
  const newestActionId = actions.length > 0 ? actions[actions.length - 1].id : null

  return (
    <div className="action-log">
      {actions.map(a => {
        const isNewest = a.id === newestActionId
        const currentTotal = totals[a.category] || 0
        const newTotal = currentTotal - a.value
        const roundedNewTotal = a.type === 'count'
          ? Math.round(newTotal)
          : Math.round(newTotal * 100) / 100
        const isUndoDisabled = roundedNewTotal < 0

        return (
          <div key={a.id} className={`entry ${isNewest ? 'newest' : ''}`}>
            <button
              onClick={() => onUndo(a)}
              disabled={isUndoDisabled}
            >
              Undo
            </button>
            <span>
              {a.category} {a.value >= 0 ? `+${a.value}` : a.value}{a.type === 'count' ? '' : ' kg'}
            </span>
          </div>
        )
      })}
    </div>
  )
}