'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface IngredientInputProps {
  initialIngredients?: string[]
  onIngredientsChange: (ingredients: string[]) => void
}

export function IngredientInput({
  initialIngredients = [],
  onIngredientsChange,
}: IngredientInputProps) {
  const t = useTranslations()
  const [input, setInput] = useState('')
  const [ingredients, setIngredients] = useState<Set<string>>(new Set(initialIngredients))

  useEffect(() => {
    setIngredients(new Set(initialIngredients))
  }, [initialIngredients.join('\u0001')])

  // 添加食材
  const handleAdd = () => {
    const trimmed = input.trim()
    if (trimmed && !ingredients.has(trimmed)) {
      setIngredients((prev) => new Set(prev).add(trimmed))
      setInput('')
      onIngredientsChange([...Array.from(ingredients), trimmed])
    }
  }

  // 删除食材
  const handleRemove = (ingredient: string) => {
    const next = new Set(ingredients)
    next.delete(ingredient)
    setIngredients(next)
    onIngredientsChange(Array.from(next))
  }

  // 清除所有食材
  const handleClear = () => {
    setIngredients(new Set())
    setInput('')
    onIngredientsChange([])
  }

  // 回车添加食材
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('IngredientInput.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button onClick={handleAdd} size="sm">
          {t('IngredientInput.add')}
        </Button>
        <Button variant="outline" onClick={handleClear} size="sm">
          {t('IngredientInput.clear')}
        </Button>
      </div>

      {/* 已选中的食材标签 */}
      {ingredients.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(ingredients).map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-sm hover:bg-secondary/80"
            >
              <span>{ingredient}</span>
              <button
                onClick={() => handleRemove(ingredient)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
