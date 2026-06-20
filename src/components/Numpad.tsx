import React, { useRef } from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  allowDecimal?: boolean
  isFlashing?: boolean
  onFlashEnd?: () => void
}

export default function Numpad({ value, onChange, allowDecimal = false, isFlashing = false, onFlashEnd }: Props) {
  const touchStarted = useRef(false)

  function press(ch: string) {
    if (ch === '⌫') return onChange(value.slice(0, -1))
    if (ch === '+/-') {
      if (value.startsWith('-')) {
        return onChange(value.slice(1))
      } else {
        return onChange('-' + value)
      }
    }
    if (ch === '.') {
      if (!allowDecimal) return
      if (value.includes('.')) return
    }

    let newValue = value + ch
    const isNegative = newValue.startsWith('-')
    let absValue = isNegative ? newValue.slice(1) : newValue
    absValue = absValue.replace(/^0+(\d)/, '$1')
    onChange(isNegative ? '-' + absValue : absValue)
  }

  const buttons = ['7','8','9','4','5','6','1','2','3','0','+/-','.','⌫']

  function handleTouchStart(ch: string) {
    touchStarted.current = true
    press(ch)
  }

  function handleClick(ch: string) {
    if (touchStarted.current) {
      return
    }
    press(ch)
  }

  return (
    <div className="numpad">
      <div
        className={`display ${isFlashing ? 'flash-red' : ''}`}
        onAnimationEnd={onFlashEnd}
      >
        {value || '0'}
      </div>
      <div className="grid">
        {buttons.map(d => {
          let btnClass = ''
          if (d === '⌫') btnClass = 'backspace'
          else if (d === '.') btnClass = 'decimal'
          else if (d === '+/-') btnClass = 'sign'

          return (
            <button
              key={d}
              className={btnClass}
              onClick={() => handleClick(d)}
              onTouchStart={() => handleTouchStart(d)}
              disabled={d === '.' && !allowDecimal}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}