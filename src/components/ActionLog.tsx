import React from 'react'
import { Action } from '../lib/engine'

type Props = {
  actions: Action[]
  onUndo: (a: Action) => void
}

export default function ActionLog({ actions, onUndo }: Props) {
  const newestActionId = actions.length > 0 ? actions[actions.length - 1].id : null

  return (
    <div className="action-log">
      {actions.map(a => {
        const isNewest = a.id === newestActionId
        return (
          <div key={a.id} className={`entry ${isNewest ? 'newest' : ''}`}>
            <button onClick={() => onUndo(a)}>Undo</button>
            <span>{ a.category } +{`${a.value} ${a.type === 'count' ? '' : 'kg'}`}</span>
          </div>
        )
      })}
    </div>
  )
}
