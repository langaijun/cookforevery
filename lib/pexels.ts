/**
 * Pexels 图片获取工具
 * 免费图库 API，无需 AI 生成
 */

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

// 食材/菜品中英文映射（扩展 Unsplash 的映射）
const KEYWORD_MAP: Record<string, string[]> = {
  // 蛋类
  '鸡蛋': ['fried egg', 'scrambled eggs', 'boiled egg', 'omelette'],
  '溏心蛋': ['poached egg', 'soft boiled egg'],
  '鸭蛋': ['duck egg', 'salted duck egg'],
  '皮蛋': ['preserved egg', 'century egg'],

  // 肉类
  '鸡肉': ['chicken dish', 'roast chicken', 'fried chicken', 'chicken stir fry'],
  '猪肉': ['pork dish', 'braised pork', 'roast pork'],
  '牛肉': ['beef dish', 'steak', 'beef stir fry'],
  '羊肉': ['lamb dish', 'roast lamb', 'mutton'],
  '鱼': ['fish dish', 'steamed fish', 'fried fish'],
  '虾': ['shrimp dish', 'prawn', 'stir fried shrimp'],
  '蟹': ['crab dish', 'steamed crab', 'crab'],
  '小龙虾': ['crawfish', 'crayfish', 'spiny lobster'],

  // 蔬菜
  '豆腐': ['tofu dish', 'steamed tofu', 'fried tofu'],
  '茄子': ['eggplant dish', 'braised eggplant'],
  '土豆': ['potato dish', 'mashed potato', 'fried potato'],
  '西红柿': ['tomato dish', 'tomato stir fry'],
  '青椒': ['green pepper', 'bell pepper dish'],
  '黄瓜': ['cucumber', 'cucumber dish'],
  '白菜': ['cabbage', 'chinese cabbage dish'],
  '菠菜': ['spinach dish', 'sautéed spinach'],
  '芹菜': ['celery dish', 'stir fried celery'],
  '韭菜': ['chives dish', 'chinese chives'],
  '木耳': ['black fungus', 'wood ear mushroom'],
  '蘑菇': ['mushroom dish', 'shiitake'],

  // 主食
  '米饭': ['rice', 'steamed rice', 'fried rice'],
  '面条': ['noodle dish', 'ramen', 'chinese noodles'],
  '饺子': ['dumplings', 'chinese dumplings'],
  '包子': ['steamed bun', 'chinese bun'],
  '馒头': ['mantou', 'steamed bun'],
  '馄饨': ['wonton', 'wonton soup'],
  '粥': ['congee', 'rice porridge', 'chinese porridge'],

  // 汤
  '汤': ['soup', 'chinese soup'],
  '炖汤': ['stew', 'braised dish'],

  // 烹饪方式
  '炒': ['stir fry', 'fried'],
  '烧': ['braised', 'stewed'],
  '蒸': ['steamed', 'steam'],
  '煮': ['boiled', 'poached'],
  '烤': ['roasted', 'grilled', 'baked'],
  '炸': ['deep fried', 'fried'],
  '凉拌': ['cold dish', 'salad'],
}

// 口味对应的默认图片
const TASTE_IMAGES: Record<string, string> = {
  sweet: 'dessert,cake,sweet',
  salty: 'chinese cuisine,home cooking',
  sour: 'sour food,asian cuisine',
  spicy: 'spicy food,chili,pepper',
  savory: 'umami,flavorful dish',
  numb: 'sichuan cuisine,spicy food',
  mild: 'healthy food,light meal',
}

/**
 * 从菜名提取关键词
 */
function findKeywords(recipeName: string): string[] {
  const keywords: string[] = []

  for (const [chinese, englishTerms] of Object.entries(KEYWORD_MAP)) {
    if (recipeName.includes(chinese)) {
      keywords.push(...englishTerms)
    }
  }

  return keywords
}

/**
 * 从 Pexels 获取菜品图片
 */
export async function getRecipeImageFromPexels(
  recipeName: string,
  tasteTags: string[] = []
): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    return null
  }

  // 提取关键词
  let keywords = findKeywords(recipeName)

  // 如果没有匹配的关键词，使用口味标签
  if (keywords.length === 0) {
    for (const taste of tasteTags) {
      if (TASTE_IMAGES[taste]) {
        keywords.push(TASTE_IMAGES[taste])
      }
    }
  }

  // 默认使用通用中餐关键词
  if (keywords.length === 0) {
    keywords = ['chinese food', 'asian cuisine', 'home cooking']
  }

  // 取前 3 个关键词
  const searchQuery = keywords.slice(0, 3).join(',')

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      console.error('Pexels API error:', response.status)
      return null
    }

    const data = await response.json()
    const photo = data.photos?.[0]

    if (!photo) {
      return null
    }

    // Pexels 返回高质量图片 URL
    return photo.src?.large || photo.src?.medium || photo.src?.original || null
  } catch (error) {
    console.error('Failed to fetch Pexels image:', error)
    return null
  }
}

/**
 * 统一获取图片的函数（Pexels → Unsplash → 默认）
 */
export async function getRecipeImage(
  recipeName: string,
  tasteTags: string[] = []
): Promise<string | null> {
  // 优先尝试 Pexels
  const pexelsImage = await getRecipeImageFromPexels(recipeName, tasteTags)
  if (pexelsImage) {
    return pexelsImage
  }

  // 降级到 Unsplash
  try {
    const { getRecipeImage: getUnsplashImage } = await import('./unsplash')
    return await getUnsplashImage(recipeName, tasteTags)
  } catch {
    return null
  }
}
