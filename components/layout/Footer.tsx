import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">关于我们</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  关于 HomeCookHub
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">资源</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/recipes" className="hover:text-primary">
                  食谱大全
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-primary">
                  烹饪技巧
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">社区</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/share" className="hover:text-primary">
                  晒图分享
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Anduin2017/HowToCook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  开源项目
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">法律</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  使用条款
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 HomeCookHub. 无广告、开源、社区驱动。</p>
          <p className="mt-2">
            食谱数据来源于{' '}
            <a
              href="https://github.com/Anduin2017/HowToCook"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Anduin2017/HowToCook
            </a>
            ，遵循{' '}
            <a
              href="https://github.com/Anduin2017/HowToCook/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              CC BY-NC-SA 4.0
            </a>
            许可。
          </p>
        </div>
      </div>
    </footer>
  )
}
