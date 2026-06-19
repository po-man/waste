import React from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  allowDecimal?: boolean
}

export default function Numpad({ value, onChange, allowDecimal = false }: Props) {
  function press(ch: string) {
    if (ch === '⌫') return onChange(value.slice(0, -1))
    if (ch === '.') {
      if (!allowDecimal) return
      if (value.includes('.')) return
    }
    onChange((value + ch).replace(/^0+(\d)/, '$1'))
  }
  const buttons = ['7','8','9','4','5','6','1','2','3','0','.','⌫']

  return (
    <div className="numpad">
      <div className="display">{value || '0'}</div>
      <div className="grid">
        {buttons.map(d => (
          <button key={d} onClick={() => press(d)} disabled={d === '.' && !allowDecimal}>{d}</button>
        ))}
      </div>
    </div>
  )
}
