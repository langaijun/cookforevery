'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations()

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('Footer.about')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  {t('Footer.aboutHomeCookHub')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t('Footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('Footer.resources')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/recipes" className="hover:text-primary">
                  {t('Footer.recipesAll')}
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-primary">
                  {t('Footer.cookingTips')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('Footer.community')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/share" className="hover:text-primary">
                  {t('Footer.sharePhotos')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Anduin2017/HowToCook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {t('Footer.openSourceProject')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('Footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  {t('Footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  {t('Footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t('Footer.copyrightFull')}</p>
          <p className="mt-2">
            {t('Footer.recipeDataSource')}{' '}
            <a
              href="https://github.com/Anduin2017/HowToCook"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Anduin2017/HowToCook
            </a>
            ，{t('Footer.followLicense')}{' '}
            <a
              href="https://github.com/Anduin2017/HowToCook/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              CC BY-NC-SA 4.0
            </a>
            {t('Footer.license')}。
          </p>
        </div>
      </div>
    </footer>
  )
}
