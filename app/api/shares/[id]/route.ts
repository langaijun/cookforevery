import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * DELETE /api/shares/[id]
 * 删除分享
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    // 查找分享
    const share = await prisma.share.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!share) {
      return NextResponse.json({ error: '分享不存在' }, { status: 404 })
    }

    // 检查权限（只能删除自己的分享）
    if (share.userId !== userId) {
      return NextResponse.json({ error: '无权删除此分享' }, { status: 403 })
    }

    // 删除分享
    await prisma.share.delete({ where: { id } })

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除分享失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
