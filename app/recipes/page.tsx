import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

/**
 * 口味标签选项
 */
const TASTE_TAGS = ['酸', '甜', '辣', '咸', '鲜', '麻', '清淡'] as const

/**
 * 难度选项
 */
const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: '简单' },
  { value: 'MEDIUM', label: '中等' },
  { value: 'HARD', label: '困难' },
] as const

export default function RecipesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">食谱大全</h1>
          <p className="mt-2 text-muted-foreground">
            发现美味的中式食谱，开启你的烹饪之旅
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="搜索食谱名称..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button>搜索</Button>
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-4">
            {/* 口味筛选 */}
            <div className="flex flex-wrap gap-2">
              {TASTE_TAGS.map((taste) => (
                <Button
                  key={taste}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  {taste}
                </Button>
              ))}
            </div>

            {/* 难度筛选 */}
            <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">所有难度</option>
              {DIFFICULTY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 食谱列表 - 加载中状态 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 space-y-2 animate-pulse"
            >
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
