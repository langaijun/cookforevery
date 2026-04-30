'use client'

import { useRouter } from 'next/navigation'
import { ShareForm } from '@/components/share/ShareForm'

/** 发布后刷新服务端分享的列表 */
export function SharePageForm() {
  const router = useRouter()
  return <ShareForm onSuccess={() => router.refresh()} />
}
