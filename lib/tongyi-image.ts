/**
 * 阿里云通义万相 (Wanxiang) API 调用工具
 * 用于生成食谱图片
 */

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const API_URL_SYNC = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
const API_URL_ASYNC = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation'

export interface RecipeInfo {
  name: string
  description: string
  ingredients: string[]
  tasteTags: string[]
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
 * 生成图片提示词
 * 使用食谱步骤作为主要提示词
 */
function generatePrompt(recipe: RecipeInfo): string {
  const { name, description, ingredients, tasteTags, steps } = recipe

  // 使用第一条步骤（描述最关键的制作环节）
  const step1 = steps?.[0] || ''

  // 口味描述
  const tasteDesc = tasteTags
    .map(t => TASTE_DESCRIPTION[t])
    .filter(Boolean)
    .join('、')

  // 组合提示词：食谱名 + 第一步描述 + 口味
  let prompt = `${name}的成品展示图。`

  if (step1) {
    // 步骤1 通常描述主要制作方法，如"将螃蟹切块"、"大火翻炒"等
    prompt += `${step1.substring(0, 100)}，` // 限制100字符避免过长
  }

  if (tasteDesc) {
    prompt += `${tasteDesc}口味。`
  }

  prompt += '美食摄影，高分辨率，自然光，摆盘精美，背景简洁'

  return prompt
}

/**
 * 轮询异步任务结果
 */
async function pollAsyncResult(taskId: string, maxWaitSeconds = 180): Promise<TongyiImageResult> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitSeconds * 1000) {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 每3秒轮询一次

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      continue
    }

    const data = await response.json()

    if (data.output?.task_status === 'SUCCEEDED') {
      const imageUrl = data.output?.choices?.[0]?.message?.content?.find(
        (item: any) => item.type === 'image'
      )?.image

      if (!imageUrl) {
        return { error: '未返回图片 URL' }
      }

      return { imageUrl }
    }

    if (data.output?.task_status === 'FAILED') {
      return { error: data.message || '任务执行失败' }
    }
  }

  return { error: '任务超时' }
}

/**
 * 调用通义万相 API 生成图片（异步模式）
 */
export async function generateRecipeImage(recipe: RecipeInfo): Promise<TongyiImageResult> {
  if (!DASHSCOPE_API_KEY) {
    return { error: 'DASHSCOPE_API_KEY 未配置' }
  }

  const prompt = generatePrompt(recipe)

  try {
    // 第一步：创建异步任务
    const response = await fetch(API_URL_ASYNC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wan2.6-image',
        input: {
          messages: [
            {
              role: 'user',
              content: [{ text: prompt }]
            }
          ]
        },
        parameters: {
          size: '1280*720',
          n: 1,
          watermark: false,
          enable_interleave: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('通义万相 API 错误:', errorText)
      return { error: `API 调用失败: ${response.status}` }
    }

    const data = await response.json()

    if (data.code) {
      console.error('通义万相返回错误:', data)
      return { error: data.message || '创建任务失败' }
    }

    const taskId = data.output?.task_id
    if (!taskId) {
      return { error: '未返回任务 ID' }
    }

    console.log(`  任务已创建: ${taskId}`)

    // 第二步：轮询任务结果
    const result = await pollAsyncResult(taskId)

    return result
  } catch (error) {
    console.error('通义万相调用异常:', error)
    return { error: `请求异常: ${error instanceof Error ? error.message : String(error)}` }
  }
}
