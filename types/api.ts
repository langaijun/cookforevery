/**
 * API 响应基础类型
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 验证码登录响应
 */
export interface VerifyCodeResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}
