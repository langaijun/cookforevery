import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '@/lib/profile-auth'

/**
 * DELETE /api/comments/[id]
 * 删除评论
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

    // 查找评论
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 })
    }

    // 检查权限（只能删除自己的评论）
    if (comment.userId !== userId) {
      return NextResponse.json({ error: '无权删除此评论' }, { status: 403 })
    }

    // 删除评论
    await prisma.comment.delete({ where: { id } })

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除评论失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
