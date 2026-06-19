import React, { useState } from 'react'

type Group = { title: string; items: string[] }

type Props = {
  groups: Group[]
  totals: Record<string, number>
  onCategoryClick: (category: string) => void
}

export default function CategoryGrid({ groups, totals, onCategoryClick }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    groups.forEach(g => (map[g.title] = true))
    return map
  })

  function toggle(title: string) {
    setOpen(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="category-grid">
      {groups.map(g => (
        <section key={g.title} className="group">
          <button className="header" onClick={() => toggle(g.title)} aria-expanded={!!open[g.title]}>
            {g.title}
            <span className="chev">{open[g.title] ? '▾' : '▸'}</span>
          </button>

          {open[g.title] && (
            <div className="items">
              {g.items.map(cat => (
                <button key={cat} className="cat" onClick={() => onCategoryClick(cat)}>
                  <div className="name">{cat}</div>
                  <div className="total">{totals[cat] ?? 0}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
