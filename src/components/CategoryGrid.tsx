import React, { useEffect, useRef } from 'react'

type Group = { title: string; items: string[] }
type Page = { title: string; groups: Group[] }

type Props = {
  pages: Page[]
  currentPage: number
  onPageChange: (index: number) => void
  totals: Record<string, number>
  onCategoryClick: (category: string) => void
}

export default function CategoryGrid({ pages, currentPage, onPageChange, totals, onCategoryClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const pageWidth = containerRef.current.clientWidth
    containerRef.current.scrollTo({ left: currentPage * pageWidth, behavior: 'smooth' })
  }, [currentPage, pages.length])

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const target = event.currentTarget
    const scrollLeft = target.scrollLeft
    const width = target.clientWidth
    const nextPage = Math.round(scrollLeft / width)
    if (nextPage !== currentPage) {
      onPageChange(nextPage)
    }
  }

  function goToPage(index: number) {
    if (!containerRef.current) return
    const width = containerRef.current.clientWidth
    containerRef.current.scrollTo({ left: index * width, behavior: 'smooth' })
    onPageChange(index)
  }

  return (
    <div className="category-carousel">
      <div className="carousel" ref={containerRef} onScroll={handleScroll}>
        {pages.map((page, pageIndex) => (
          <div key={page.title} className="carousel-page">
            {page.groups.map(group => (
              <div key={group.title} className="group-block">
                <div className="group-header">{group.title}</div>
                <div className="items">
                  {group.items.map(cat => (
                    <button key={cat} className="cat" onClick={() => onCategoryClick(cat)}>
                      <div className="name">{cat}</div>
                      <div className="total">{totals[cat] ?? 0}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="carousel-indicators">
        {pages.map((_, index) => (
          <button
            key={index}
            className={index === currentPage ? 'indicator active' : 'indicator'}
            onClick={() => goToPage(index)}
            aria-label={`Page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
