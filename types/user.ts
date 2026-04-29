import { Provider } from './recipe'

/**
 * 用户信息
 */
export interface User {
  id: string
  email?: string
  name: string
  avatar?: string
  provider: Provider
  providerId?: string
  createdAt: Date
  updatedAt: Date
  isBanned: boolean
}

/**
 * 用户会话
 */
export interface Session {
  user: {
    id: string
    email?: string
    name: string
    avatar?: string
  }
  expires: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string
  code: string
}

/**
 * 发送验证码请求
 */
export interface SendCodeRequest {
  email: string
}
