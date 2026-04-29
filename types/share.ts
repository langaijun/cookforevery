import { User } from './user'

/**
 * 分享（用户晒图）
 */
export interface Share {
  id: string
  userId: string
  recipeId?: string
  imageUrl: string
  caption: string
  createdAt: Date
  updatedAt: Date

  // 关联数据
  user?: User
  likeCount?: number
  commentCount?: number
}

/**
 * 评论
 */
export interface Comment {
  id: string
  userId: string
  recipeId?: string
  shareId?: string
  content: string
  createdAt: Date
  updatedAt: Date

  // 关联数据
  user?: User
}

/**
 * 点赞
 */
export interface Like {
  id: string
  userId: string
  recipeId?: string
  shareId?: string
  createdAt: Date
}
