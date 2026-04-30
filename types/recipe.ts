/**
 * 食谱难度枚举
 */
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

/**
 * 口味标签类型
 */
export type TasteTag = '酸' | '甜' | '辣' | '咸' | '鲜' | '麻' | '清淡'

/**
 * 认证提供者枚举
 */
export enum Provider {
  EMAIL = 'EMAIL',
  GITHUB = 'GITHUB',
  GOOGLE = 'GOOGLE',
}

/**
 * 食谱基本信息
 */
export interface Recipe {
  id: string
  name: string
  nameEn?: string
  description: string
  difficulty: Difficulty
  tasteTags: TasteTag[]
  time: number // 分钟
  ingredients: string[]
  steps: string[]
  videoUrl?: string
  imageUrl?: string
  isActive: boolean
  providerId: string
  syncedAt: Date
  createdAt: Date
  updatedAt: Date

  // 关联数据（可选，查询时可包含）
  likeCount?: number
  commentCount?: number
  isLiked?: boolean // 当前用户是否已点赞
}

/**
 * 食谱卡片数据（列表展示用）
 */
export interface RecipeCard {
  id: string
  name: string
  description: string
  difficulty: Difficulty
  tasteTags: TasteTag[]
  time: number
  imageUrl?: string
}

/**
 * 食谱列表查询参数
 */
export interface RecipeListParams {
  page?: number
  limit?: number
  taste?: TasteTag[]
  difficulty?: Difficulty
  ingredients?: string[] // 包含任一食材
  search?: string // 搜索菜名
  locale?: string
}

/**
 * 食谱列表响应
 */
export interface RecipeListResponse {
  recipes: RecipeCard[]
  total: number
  page: number
  limit: number
  totalPages: number
}
