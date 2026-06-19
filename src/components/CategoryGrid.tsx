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
  // Group Blue (derived from brand color #58BDFC)
  const groupBlue = new Set([
    '飲筒', '飲品杯', '硬膠食物容器', '發泡膠容器', '外賣餐具',
    '牙刷', '針筒/針頭', '棉花棒', '口罩'
  ])
  // Group Peach (derived from brand color #FFD7AA)
  const groupPeach = new Set([
    '膠袋', '食品包裝袋', '生果網',
    '煙頭', '火機', '其他',
    '發泡膠', '膠樽', '雜項'
  ])
  // Group Mint (complementary soft teal/mint)
  const groupMint = new Set([
    '膠水樽', '膠水樽樽蓋', '其他飲品與食物容器', '非食物的瓶罐與容器',
    '釣魚用具', '浮標浮球浮筒', '漁網與繩子'
  ])
  // Group Lavender (complementary soft lavender)
  const groupLavender = new Set([
    '金屬罐', '紙包/鋁包飲品盒', '玻璃瓶', '衣物/鞋履/袋'
  ])

  if (groupBlue.has(cat)) {
    return {
      backgroundColor: '#E6F4FE',
      color: '#025287',
      borderColor: '#B2DDFD',
      boxShadow: '0 2px 5px rgba(88, 189, 252, 0.1)'
    }
  }
  if (groupPeach.has(cat)) {
    return {
      backgroundColor: '#FFF2E6',
      color: '#804000',
      borderColor: '#FFDCBF',
      boxShadow: '0 2px 5px rgba(255, 215, 170, 0.15)'
    }
  }
  if (groupMint.has(cat)) {
    return {
      backgroundColor: '#E6F8F3',
      color: '#005C3E',
      borderColor: '#B3EDD8',
      boxShadow: '0 2px 5px rgba(0, 92, 62, 0.05)'
    }
  }
  if (groupLavender.has(cat)) {
    return {
      backgroundColor: '#FAF0FD',
      color: '#531D74',
      borderColor: '#ECC5FA',
      boxShadow: '0 2px 5px rgba(83, 29, 116, 0.05)'
    }
  }

  return {
    backgroundColor: '#F8FAFC',
    color: '#334155',
    borderColor: '#E2E8F0'
  }
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
