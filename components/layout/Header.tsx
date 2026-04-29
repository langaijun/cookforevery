import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">HomeCookHub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/recipes" className="text-sm font-medium transition-colors hover:text-primary">
            食谱
          </Link>
          <Link href="/share" className="text-sm font-medium transition-colors hover:text-primary">
            分享
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            登录
          </Button>
          <Button size="sm">
            注册
          </Button>
        </div>
      </div>
    </header>
  )
}
