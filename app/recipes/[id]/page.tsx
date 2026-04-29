import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * 难度显示映射
 */
const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

/**
 * 口味标签颜色映射
 */
const TASTE_COLORS: Record<string, string> = {
  酸: 'bg-green-100 text-green-800',
  甜: 'bg-pink-100 text-pink-800',
  辣: 'bg-red-100 text-red-800',
  咸: 'bg-yellow-100 text-yellow-800',
  鲜: 'bg-orange-100 text-orange-800',
  麻: 'bg-purple-100 text-purple-800',
  清淡: 'bg-gray-100 text-gray-800',
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* 返回按钮 */}
        <Link href="/recipes">
          <Button variant="ghost" className="mb-6">
            ← 返回食谱列表
          </Button>
        </Link>

        {/* 食谱详情 - 加载中状态 */}
        <div className="max-w-3xl mx-auto space-y-8">
          {/* 标题区域 */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* 难度 */}
              <div className="flex items-center gap-1">
                <span className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>

              {/* 时间 */}
              <div className="flex items-center gap-1">
                <span className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>

              {/* 点赞数 */}
              <div className="flex items-center gap-1">
                <span className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className="h-6 w-12 bg-muted rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div className="prose prose-stone max-w-none">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted rounded animate-pulse"
                  style={{ width: `${80 + Math.random() * 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* 食材 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">食材</h2>
            <ul className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-muted rounded-full" />
                  <span className="h-4 w-40 bg-muted rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </section>

          {/* 制作步骤 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">制作步骤</h2>
            <ol className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 视频教程 */}
          <section className="rounded-lg border p-4">
            <h2 className="mb-4 text-xl font-semibold">视频教程</h2>
            <div className="aspect-video bg-muted rounded animate-pulse" />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
