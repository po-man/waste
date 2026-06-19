import React from 'react'
import { Action } from '../lib/engine'

type Props = {
  actions: Action[]
  onUndo: (a: Action) => void
}

export default function ActionLog({ actions, onUndo }: Props) {
  return (
    <div className="action-log">
      {actions.map(a => (
        <div key={a.id} className="entry">
          <span>{ a.category } +{`${a.value} ${a.type === 'count' ? '' : 'kg'}`}</span>
          <button onClick={() => onUndo(a)}>Undo</button>
        </div>
      ))}
    </div>
  )
}
