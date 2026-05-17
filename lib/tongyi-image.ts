/**
 * 图片生成工具
 * 支持 OpenAI DALL-E 和阿里云通义万相 (Wanxiang)
 * 用于生成食谱图片
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { uploadToBucket, isBucketConfigured } from './railway-bucket'
import { isTokenPlanKey } from './dashscope-env-prefer-dotenv'

function getDashscopeApiKey() {
  return process.env.DASHSCOPE_API_KEY?.replace(/^"|"$/g, '') || process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY?.replace(/^"|"$/g, '') || ''
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// 优先使用 OpenAI
const USE_OPENAI = OPENAI_API_KEY && !getDashscopeApiKey()

if (USE_OPENAI) {
  console.log('Using OpenAI API')
} else if (getDashscopeApiKey()) {
  const key = getDashscopeApiKey()
  console.log('Using getDashscopeApiKey(), length:', key.length, 'prefix:', key.substring(0, 15))
  console.log('API Key Type:', isTokenPlanKey(key) ? 'Token Plan (sk-sp-)' : 'Standard')
} else {
  console.error('No API key set')
}

// OpenAI API
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations'

// DashScope 文生图 API（使用函数延迟求值，支持运行时加载环境变量）
function getApiKey(): string {
  return getDashscopeApiKey()
}

function isTokenPlan(): boolean {
  return isTokenPlanKey(getApiKey())
}

/**
 * Token Plan（sk-sp-）团队版文生图：走 multimodal-generation，模型为 wan2.7-image / qwen-image-2.0 等。
 * - 中国大陆文档 Base 多为 `token-plan.cn-beijing.maas.aliyuncs.com`（默认地域 cn-beijing）
 * - 国际版控制台多为新加坡 `ap-southeast-1`，与 key 绑定，勿混用
 * 旧版北京 compatible `/images/generations` + `wanx-v1` 非 Token Plan Credits 生图路径，易报 Unpurchased。
 */
function getTokenPlanMultimodalUrl(): string {
  const override = process.env.TOKEN_PLAN_MULTIMODAL_URL?.trim()
  if (override) return override
  const region = process.env.TOKEN_PLAN_REGION?.trim() || 'cn-beijing'
  return `https://token-plan.${region}.maas.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`
}

/** Token Plan 文生图模型，须与订阅内已开通模型一致 */
function getTokenPlanImageModel(): string {
  return process.env.TOKEN_PLAN_IMAGE_MODEL?.trim() || 'wan2.7-image'
}

// 标准 DashScope 万相异步任务
const TEXT2IMAGE_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

const TASK_QUERY_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks/'

export interface RecipeInfo {
  name: string
  /** 英文菜名，便于部分模型理解 */
  nameEn?: string | null
  description: string
  ingredients: string[]
  tasteTags: string[]
  steps?: string[]
}

export type ImagePromptMode = 'openai' | 'wanx'

function clampText(s: string, maxLen: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`
}

export interface TongyiImageResult {
  imageUrl?: string
  error?: string
}

/**
 * 将中文口味标签转换为中文描述
 */
const TASTE_DESCRIPTION: Record<string, string> = {
  sour: '酸',
  sweet: '甜',
  spicy: '辣',
  salty: '咸',
  savory: '鲜',
  numb: '麻',
  mild: '清淡'
}

/**
 * 从描述中提取关键信息
 */
function extractKeyInfo(description: string): string {
  const info: string[] = []

  if (description.includes('家常菜')) info.push('家常菜')
  if (description.includes('下饭菜')) info.push('下饭菜')
  if (description.includes('宴席菜')) info.push('宴席菜')
  if (description.includes('特色菜')) info.push('特色菜')

  return info.length > 0 ? info.join('、') : ''
}

/**
 * 从步骤中提取烹饪方法和工具
 */
function extractCookingMethod(steps: string[]): string {
  if (!steps || steps.length === 0) return ''

  const methods: string[] = []
  const tools: string[] = []

  const allText = steps.join(' ')

  if (allText.includes('炒') || allText.includes('爆')) methods.push('炒制')
  if (allText.includes('蒸')) methods.push('蒸制')
  if (allText.includes('煮') || allText.includes('炖')) methods.push('煮制')
  if (allText.includes('炸')) methods.push('油炸')
  if (allText.includes('烧') || allText.includes('焖')) methods.push('烧制')
  if (allText.includes('煎')) methods.push('煎制')
  if (allText.includes('凉拌') || allText.includes('拌')) methods.push('凉拌')

  if (allText.includes('炒锅') || allText.includes('锅')) tools.push('炒锅')
  if (allText.includes('蒸笼') || allText.includes('蒸')) tools.push('蒸笼')
  if (allText.includes('煮锅')) tools.push('煮锅')

  let result = ''
  if (methods.length > 0) result += `烹饪方式：${methods.join('、')}。`
  if (tools.length > 0) result += `使用${tools.join('、')}。`

  return result
}

/**
 * 按食谱字段生成文生图提示词
 */
export function generatePrompt(
  recipe: RecipeInfo,
  mode: ImagePromptMode = 'wanx'
): string {
  const { name } = recipe

  // 判断是否适合加香菜（甜品、粥类、蛋糕等不适合）
  const isSweetOrSoup =
    /粥|汤|羹|冻|糕|饼|面包|三明治|蛋|酥|酱|奶|茶|糖|甜|蜜|果酱|沙拉|土豆泥|泥|蛋挞|蛋糕|吐司|燕麦|牛奶|玉米|蛋挞|蛋挞液|蛋挞皮|蛋挞液|蛋挞皮/.test(name)

  const garnish = isSweetOrSoup ? '' : '，点缀葱花香菜提味'

  return `专业中式美食摄影，柔和自然光从侧上方打光，做好的【${name}】成品特写，盛在白色盘子里，食材纹理清晰油亮，酱汁光泽自然，松散随性摆盘${garnish}，木质桌面浅色背景，色彩鲜艳真实，高饱和度，写实风格，8K超高清 --ar 16:9`
}

/**
 * 轮询异步任务结果
 */
async function pollAsyncResult(taskId: string, maxWaitSeconds = 300): Promise<TongyiImageResult> {
  const startTime = Date.now()
  let pollCount = 0

  while (Date.now() - startTime < maxWaitSeconds * 1000) {
    pollCount++
    await new Promise(resolve => setTimeout(resolve, 3000))

    const response = await fetch(
      `${TASK_QUERY_URL}${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${getDashscopeApiKey()}`,
        },
      }
    )

    if (!response.ok) {
      console.error(`  轮询 ${pollCount} 失败: HTTP ${response.status}`)
      continue
    }

    const data = await response.json()

    const status = data.output?.task_status

    console.log(`  轮询 ${pollCount}: 状态=${status}`)

    if (status === 'SUCCEEDED') {
      const imageUrl = data.output?.results?.[0]?.url

      if (!imageUrl) {
        return { error: '未返回图片 URL' }
      }

      return { imageUrl }
    }

    if (status === 'FAILED') {
      return { error: data.output?.message || '任务执行失败' }
    }

    if (status === 'CANCELED') {
      return { error: '任务已取消' }
    }
  }

  return { error: '任务超时' }
}

/**
 * OpenAI 图片生成
 */
async function generateWithOpenAI(recipe: RecipeInfo): Promise<TongyiImageResult> {
  if (!OPENAI_API_KEY) {
    return { error: 'OPENAI_API_KEY 未配置' }
  }

  const prompt = generatePrompt(recipe, 'openai')

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API 错误:', errorText)
      try {
        const errorData = JSON.parse(errorText)
        return { error: `OpenAI 错误: ${errorData.error?.message || errorText}` }
      } catch {
        return { error: `OpenAI 调用失败: ${response.status} - ${errorText}` }
      }
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      return { error: 'OpenAI 未返回图片 URL' }
    }

    return { imageUrl }
  } catch (error) {
    console.error('OpenAI 调用异常:', error)
    return { error: `OpenAI 请求异常: ${error instanceof Error ? error.message : String(error)}` }
  }
}

/**
 * 下载并保存图片
 */
async function downloadAndSaveImage(imageUrl: string, recipeName: string): Promise<TongyiImageResult> {
  const timestamp = Date.now()
  const safeName = recipeName.replace(/[^\w一-龥]/g, '')
  const fileName = `${timestamp}-${safeName}.png`

  console.log(`  开始下载图片...`)

  try {
    // 下载图片到内存
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    console.log(`  图片下载成功，大小: ${(buffer.length / 1024).toFixed(2)} KB`)

    // 保存到本地（备份）
    const publicDir = join(process.cwd(), 'public', 'recipes')
    mkdirSync(publicDir, { recursive: true })
    const localPath = join(publicDir, fileName)
    writeFileSync(localPath, buffer)
    console.log(`  本地保存成功: /recipes/${fileName}`)

    // 上传到 Railway Bucket（如果配置了）
    if (isBucketConfigured()) {
      try {
        const bucketUrl = await uploadToBucket(buffer, `recipes/${fileName}`, 'image/png')
        return { imageUrl: bucketUrl }
      } catch (bucketError) {
        console.error('  上传 Bucket 失败，使用本地路径:', bucketError)
        // Bucket 上传失败，返回本地路径
        return { imageUrl: `/recipes/${fileName}` }
      }
    } else {
      console.log('  Bucket 未配置，使用本地路径')
      // 返回本地路径，不再需要下载
      return { imageUrl: `/recipes/${fileName}` }
    }
  } catch (error) {
    console.error('  下载/保存图片失败:', error)
    return { error: `图片处理失败: ${error instanceof Error ? error.message : String(error)}` }
  }
}

/** 解析 Wan2.7 / qwen-image 等多模态文生图同步返回中的图片 URL */
function extractMultimodalImageUrl(data: Record<string, unknown>): string | undefined {
  const output = data.output as Record<string, unknown> | undefined
  const choices = output?.choices as Array<Record<string, unknown>> | undefined
  const msg = choices?.[0]?.message as Record<string, unknown> | undefined
  const content = msg?.content
  if (!Array.isArray(content)) return undefined
  for (const part of content) {
    if (part && typeof part === 'object' && 'image' in part) {
      const img = (part as { image?: string }).image
      if (typeof img === 'string' && img.length > 0) return img
    }
  }
  return undefined
}

/**
 * Token Plan（sk-sp-）团队版：新加坡 multimodal-generation，Credits 计费。
 * 与标准 DashScope key 的万相异步接口不同，不可混用地域与路径。
 */
async function generateWithTokenPlanMultimodal(
  prompt: string,
  recipeName: string
): Promise<TongyiImageResult> {
  const model = getTokenPlanImageModel()
  const url = getTokenPlanMultimodalUrl()
  const size = process.env.TOKEN_PLAN_IMAGE_SIZE?.trim() || '2K'

  console.log('使用 Token Plan 团队版多模态文生图（token-plan 地域与 Key 需一致）')
  console.log(`  POST ${url}`)
  console.log(`  model=${model}, size=${size}`)

  const parameters: Record<string, unknown> = {
    size,
    n: 1,
    watermark: false,
  }
  // Wan2.7 文生图文档：无参考图时 thinking_mode 可提升质量；qwen-image 以环境变量为准
  if (model.startsWith('wan2.7')) {
    parameters.thinking_mode = process.env.TOKEN_PLAN_THINKING_MODE !== 'false'
  }

  const body = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
    },
    parameters,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  })

  const rawText = await response.text()
  let data: Record<string, unknown>
  try {
    data = JSON.parse(rawText) as Record<string, unknown>
  } catch {
    return {
      error: `Token Plan 响应非 JSON: HTTP ${response.status} ${rawText.slice(0, 400)}`,
    }
  }

  if (typeof data.code === 'string' && data.code) {
    const msg = typeof data.message === 'string' ? data.message : data.code
    return { error: `API 错误: ${msg}` }
  }

  if (!response.ok) {
    const msg =
      (typeof data.message === 'string' && data.message) ||
      rawText.slice(0, 500)
    return { error: `HTTP ${response.status}: ${msg}` }
  }

  const imageUrl = extractMultimodalImageUrl(data)
  if (!imageUrl) {
    return { error: '未返回图片 URL（请核对 TOKEN_PLAN_IMAGE_MODEL 与控制台已开通模型）' }
  }

  console.log('  ✅ Token Plan 文生图成功')
  return downloadAndSaveImage(imageUrl, recipeName)
}

export async function generateRecipeImage(recipe: RecipeInfo): Promise<TongyiImageResult> {
  if (USE_OPENAI) {
    console.log('使用 OpenAI 生成图片...')
    const result = await generateWithOpenAI(recipe)
    if (result.imageUrl) {
      return downloadAndSaveImage(result.imageUrl, recipe.name)
    }
    return result
  }

  if (!getDashscopeApiKey()) {
    return { error: 'getDashscopeApiKey() 未配置' }
  }

  const prompt = generatePrompt(recipe, 'wanx')

  try {
    if (isTokenPlan()) {
      return generateWithTokenPlanMultimodal(prompt, recipe.name)
    } else {
      // 标准版：异步 API + 轮询
      console.log('使用标准版 API（异步）')
      const response = await fetch(TEXT2IMAGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getDashscopeApiKey()}`,
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wanx-v1',
          input: {
            prompt: prompt,
          },
          parameters: {
            style: '<auto>',
            size: '1280*720',
            n: 1
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DashScope API 错误:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          return { error: `API 错误: ${errorData.message || errorText}` }
        } catch {
          return { error: `API 调用失败: ${response.status} - ${errorText}` }
        }
      }

      const data = await response.json()

      if (data.code) {
        console.error('DashScope 返回错误:', data)
        return { error: data.message || '创建任务失败' }
      }

      const taskId = data.output?.task_id

      if (!taskId) {
        return { error: '未返回任务 ID' }
      }

      console.log(`  任务已创建: ${taskId}`)

      // 第二步：轮询任务结果
      const result = await pollAsyncResult(taskId)

      if (result.error || !result.imageUrl) {
        return result
      }

      // 第三步：下载图片并双重存储（本地 + Bucket）
      return downloadAndSaveImage(result.imageUrl, recipe.name)
    }
  } catch (error) {
    console.error('DashScope 调用异常:', error)
    return { error: `请求异常: ${error instanceof Error ? error.message : String(error)}` }
  }
}
