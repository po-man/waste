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

function getCategoryStyle(cat: string): React.CSSProperties {
  const group1 = new Set(['飲筒', '飲品杯', '硬膠食物容器', '發泡膠容器', '外賣餐具'])
  const group2 = new Set(['膠袋', '食品包裝袋', '生果網'])
  const group3 = new Set(['膠水樽', '膠水樽樽蓋', '其他飲品與食物容器', '非食物的瓶罐與容器'])
  const group4 = new Set(['金屬罐', '紙包/鋁包飲品盒', '玻璃瓶', '衣物/鞋履/袋'])

  if (group1.has(cat)) {
    return { backgroundColor: '#eeeeee', color: '#1111111', borderColor: '#dddddd' }
  }
  if (group2.has(cat)) {
    return { backgroundColor: '#f7f7f7', color: '#1111111', borderColor: '#dddddd' }
  }
  if (group3.has(cat)) {
    return { backgroundColor: '#e5e5e5', color: '#1111111', borderColor: '#dddddd' }
  }
  if (group4.has(cat)) {
    return { backgroundColor: '#f7f7f7', color: '#1111111', borderColor: '#dddddd' }
  }
  return {}
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
    <div className="category-carousel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="carousel" ref={containerRef} onScroll={handleScroll}>
        {pages.map((page, pageIndex) => (
          <div key={page.title} className="carousel-page">
            {page.groups.map(group => (
              <div key={group.title} className="group-block">
                <div className="group-header">{group.title}</div>
                <div className="items">
                  {group.items.map(cat => (
                    <button
                      key={cat}
                      className="cat"
                      style={getCategoryStyle(cat)}
                      onClick={() => onCategoryClick(cat)}
                    >
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
