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
  if (allText.includes('烤箱') || allText.includes('烤')) tools.push('烤箱')

  let result = ''
  if (methods.length > 0) result += `烹饪方式：${methods.join('、')}。`
  if (tools.length > 0) result += `使用${tools.join('、')}。`

  return result
}

/**
 * 生成更详细的提示词
 */
function generatePrompt(recipe: RecipeInfo): string {
  const { name, description, ingredients, tasteTags, steps } = recipe

  // 步骤按顺序，每个加上清晰的前缀
  const stepsWithNumber = steps.map((step, i) => {
    // 提取关键动词和食材，让步骤更精炼
    let conciseStep = step
      .replace(/等/g, '，') // 简化标点
      .replace(/。/g, '，') // 统一标点

    return `【步骤${i + 1}】${conciseStep}`
  })

  // 口味描述
  const tasteDesc = tasteTags
    .map(t => TASTE_DESCRIPTION[t])
    .filter(Boolean)
    .join('、')

  // 描述中的关键信息
  const keyInfo = extractKeyInfo(description)

  // 烹饪方法和工具
  const cookingInfo = extractCookingMethod(steps)

  // 主要食材（前4种）
  const mainIngredients = ingredients.slice(0, 4).join('、')

  // 构建完整提示词
  let prompt = `【菜品名称】${name}。\n`
  prompt += `【主要食材】${mainIngredients}。\n`

  if (keyInfo) {
    prompt += `【菜品特色】${keyInfo}。\n`
  }

  if (cookingInfo) {
    prompt += `【${cookingInfo}\n`
  }

  prompt += `【制作流程】${stepsWithNumber.join(' ')}。\n`

  if (tasteDesc) {
    prompt += `【口味特点】${tasteDesc}口味。\n`
  }

  prompt += `【画面要求】精美的中式美食成品图，菜品摆盘美观，色泽诱人，菜品在盘子中央，汤汁光亮，周围有适量的装饰配菜。自然柔光，高分辨率，背景简洁干净，突出菜品的色香味俱全。采用美食杂志风格的摄影效果，展示菜品最诱人的状态。\n`
  prompt += `【图片规格】1280x720像素，16:9横构图，PNG格式。`

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
