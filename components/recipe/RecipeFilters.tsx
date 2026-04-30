'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { IngredientInput } from './IngredientInput'

/**
 * 口味标签选项（key，用于 i18n）
 */
const TASTE_TAGS = ['sour', 'sweet', 'spicy', 'salty', 'savory', 'numb', 'mild'] as const

/**
 * 难度选项（key，用于 i18n）
 */
const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'] as const

/**
 * 口味标签颜色映射
 */
const TASTE_COLORS: Record<string, string> = {
  sour: 'bg-green-100 text-green-800 hover:bg-green-200',
  sweet: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
  spicy: 'bg-red-100 text-red-800 hover:bg-red-200',
  salty: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  savory: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  numb: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  mild: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

interface RecipeFiltersProps {
  initialSearch?: string
  initialDifficulty?: string
  initialTastes?: string[]
  initialIngredients?: string[]
}

export function RecipeFilters({
  initialSearch = '',
  initialDifficulty = '',
  initialTastes = [],
  initialIngredients = [],
}: RecipeFiltersProps) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [difficulty, setDifficulty] = useState(initialDifficulty)
  const [selectedTastes, setSelectedTastes] = useState<Set<string>>(new Set(initialTastes))
  const [ingredients, setIngredients] = useState<Set<string>>(new Set(initialIngredients))

  useEffect(() => {
    setSearch(initialSearch)
    setDifficulty(initialDifficulty)
    setSelectedTastes(new Set(initialTastes))
    setIngredients(new Set(initialIngredients))
  }, [
    initialSearch,
    initialDifficulty,
    initialTastes.join('\u0001'),
    initialIngredients.join('\u0001'),
  ])

  const pushFilters = (
    nextSearch: string,
    nextDifficulty: string,
    nextTastes: Set<string>,
    nextIngredients: Set<string>,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nextSearch) params.set('search', nextSearch)
    else params.delete('search')

    if (nextDifficulty) params.set('difficulty', nextDifficulty)
    else params.delete('difficulty')

    if (nextTastes.size > 0) params.set('taste', Array.from(nextTastes).join(','))
    else params.delete('taste')

    if (nextIngredients.size > 0) {
      params.set('ingredients', Array.from(nextIngredients).join(','))
    } else {
      params.delete('ingredients')
    }

    const qs = params.toString()
    router.push(qs ? `/recipes?${qs}` : '/recipes')
  }

  const handleIngredientsChange = (newIngredients: string[]) => {
    const nextSet = new Set(newIngredients)
    setIngredients(nextSet)
    pushFilters(search, difficulty, selectedTastes, nextSet)
  }

  const handleSearch = () => {
    pushFilters(search, difficulty, selectedTastes, ingredients)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleTaste = (taste: string) => {
    const next = new Set(selectedTastes)
    if (next.has(taste)) next.delete(taste)
    else next.add(taste)
    setSelectedTastes(next)
    pushFilters(search, difficulty, next, ingredients)
  }

  const handleReset = () => {
    setSearch('')
    setDifficulty('')
    setSelectedTastes(new Set())
    setIngredients(new Set())
    router.push('/recipes')
  }

  return (
    <div className="mb-8 space-y-4">
      {/* 搜索框 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('Recipes.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <Button onClick={handleSearch}>{t('Common.search')}</Button>
        <Button variant="outline" onClick={handleReset}>
          {t('Common.reset')}
        </Button>
      </div>

      {/* 筛选器 */}
      <div className="space-y-4">
        {/* 食材输入 */}
        <IngredientInput
          initialIngredients={Array.from(ingredients)}
          onIngredientsChange={handleIngredientsChange}
        />

        {/* 口味和难度筛选 */}
        <div className="flex flex-wrap gap-4">
          {/* 口味筛选 */}
          <div className="flex flex-wrap gap-2">
            {TASTE_TAGS.map((taste) => (
              <Button
                key={taste}
                variant={selectedTastes.has(taste) ? 'default' : 'outline'}
                size="sm"
                className={`rounded-full ${
                  selectedTastes.has(taste)
                    ? TASTE_COLORS[taste]
                    : ''
                }`}
                onClick={() => toggleTaste(taste)}
              >
                {t(`Taste.${taste}`)}
              </Button>
            ))}
          </div>

          {/* 难度筛选 */}
          <select
            value={difficulty}
            onChange={(e) => {
              const val = e.target.value
              setDifficulty(val)
              pushFilters(search, val, selectedTastes, ingredients)
            }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('Recipes.allDifficulty')}</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {t(`Difficulty.${level}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
