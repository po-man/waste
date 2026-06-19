import React, { useRef } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  allowDecimal?: boolean
}

export default function Numpad({ value, onChange, allowDecimal = false }: Props) {
  const touchStarted = useRef(false)

  function press(ch: string) {
    if (ch === '⌫') return onChange(value.slice(0, -1))
    if (ch === '.') {
      if (!allowDecimal) return
      if (value.includes('.')) return
    }
    onChange((value + ch).replace(/^0+(\d)/, '$1'))
  }
  const buttons = ['7','8','9','4','5','6','1','2','3','0','.','⌫']

  function handleTouchStart(ch: string) {
    touchStarted.current = true
    press(ch)
  }

  function handleClick(ch: string) {
    // If a touch event just fired, ignore the emulated click.
    if (touchStarted.current) {
      return
    }
    press(ch)
  }

  return (
    <div className="numpad">
      <div className="display">{value || '0'}</div>
      <div className="grid">
        {buttons.map(d => (
          <button
            key={d}
            onClick={() => handleClick(d)}
            onTouchStart={() => handleTouchStart(d)}
            disabled={d === '.' && !allowDecimal}>{d}</button>
        ))}
      </div>
    </div>
  )
}
