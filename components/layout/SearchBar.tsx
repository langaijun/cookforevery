'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from '@/i18n'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const t = useTranslations('Common')
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/recipes?search=${encodeURIComponent(query.trim())}`)
      if (isMobile) {
        setIsExpanded(false)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const handleSearchIconClick = () => {
    if (isMobile) {
      setIsExpanded(true)
    } else {
      // On desktop, focus the input
    }
  }

  // On recipes page, the search is handled by the existing search input
  const showSearchBar = !pathname.includes('/recipes')

  if (!showSearchBar && !isExpanded) {
    return (
      <button
        onClick={handleSearchIconClick}
        className="p-2 rounded-md hover:bg-muted transition-colors"
        aria-label={t('search')}
      >
        <Search className="w-5 h-5" />
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`flex items-center transition-all duration-300 ${
        isMobile && !isExpanded ? 'hidden' : 'flex'
      }`}>
        <Search className="absolute left-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder') || t('search')}
          className="pl-10 pr-10 w-full md:w-64 lg:w-80 rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Clear"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="ml-2 p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  )
}
