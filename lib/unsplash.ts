/**
 * Unsplash image fetcher for recipe images
 * Maps Chinese ingredients/recipe names to English keywords
 */

// Map Chinese keywords to English search terms for Unsplash
const KEYWORD_MAP: Record<string, string[]> = {
  // Proteins
  '鸡蛋': ['egg', 'eggs', 'fried egg', 'boiled egg'],
  '鸡': ['chicken', 'fried chicken', 'roast chicken'],
  '鸭': ['duck', 'roast duck'],
  '猪肉': ['pork', 'roast pork', 'fried pork'],
  '牛肉': ['beef', 'steak', 'roast beef'],
  '鱼': ['fish', 'steamed fish', 'fried fish'],
  '虾': ['shrimp', 'prawn', 'fried shrimp'],
  '蟹': ['crab', 'steamed crab'],

  // Vegetables
  '西红柿': ['tomato', 'tomatoes'],
  '土豆': ['potato', 'potatoes', 'fried potatoes'],
  '茄子': ['eggplant', 'roasted eggplant'],
  '白菜': ['cabbage', 'chinese cabbage'],
  '豆腐': ['tofu', 'fried tofu', 'steamed tofu'],
  '豆芽': ['bean sprout', 'soybean sprout'],
  '胡萝卜': ['carrot', 'carrots'],
  '黄瓜': ['cucumber', 'cucumbers'],
  '青椒': ['green pepper', 'bell pepper'],
  '辣椒': ['chili', 'hot pepper', 'spicy food'],
  '韭菜': ['chives', 'chinese chives'],
  '菠菜': ['spinach'],
  '芹菜': ['celery'],
  '蘑菇': ['mushroom', 'shiitake'],
  '木耳': ['black fungus', 'wood ear mushroom'],

  // Grains/Starches
  '米饭': ['rice', 'steamed rice', 'fried rice'],
  '面条': ['noodle', 'noodles', 'ramen'],
  '饺子': ['dumpling', 'dumplings'],
  '包子': ['bun', 'steamed bun'],
  '馒头': ['mantou', 'steamed bun'],
  '馄饨': ['wonton', 'wontons'],

  // Cooking methods
  '炒': ['stir-fry', 'fried'],
  '烧': ['braised', 'roasted'],
  '蒸': ['steamed', 'steam'],
  '煮': ['boiled', 'soup'],
  '烤': ['roasted', 'grilled'],
  '炸': ['deep fried', 'fried'],
}

// Default food images for different tastes
const TASTE_IMAGES: Record<string, string> = {
  sweet: 'dessert,cake,sweet',
  salty: 'salted food,preserved food',
  sour: 'sour food,pickled',
  spicy: 'spicy food,chili',
  savory: 'umami,flavorful food',
  numb: 'szechuan food,sichuan pepper',
  mild: 'light meal,healthy food',
}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

/**
 * Find best matching keywords from recipe name
 */
function findKeywords(recipeName: string): string[] {
  const keywords: string[] = []

  // Check if recipe name contains any mapped keywords
  for (const [chinese, englishTerms] of Object.entries(KEYWORD_MAP)) {
    if (recipeName.includes(chinese)) {
      keywords.push(...englishTerms)
    }
  }

  return keywords
}

/**
 * Get a food image from Unsplash for a recipe
 */
export async function getRecipeImage(
  recipeName: string,
  tasteTags: string[] = []
): Promise<string | null> {
  // If no Unsplash key, return null
  if (!UNSPLASH_ACCESS_KEY) {
    return null
  }

  // Find keywords from recipe name
  let keywords = findKeywords(recipeName)

  // If no keywords found, use taste tags
  if (keywords.length === 0) {
    for (const taste of tasteTags) {
      if (TASTE_IMAGES[taste]) {
        keywords.push(TASTE_IMAGES[taste])
      }
    }
  }

  // Default to general food if still no keywords
  if (keywords.length === 0) {
    keywords = ['chinese food', 'asian food', 'home cooking']
  }

  // Take first 3 keywords
  const searchQuery = keywords.slice(0, 3).join(',')

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.results?.[0]?.urls?.regular || null
  } catch (error) {
    console.error('Failed to fetch Unsplash image:', error)
    return null
  }
}

/**
 * Get multiple images for a recipe (for carousel)
 */
export async function getRecipeImages(
  recipeName: string,
  tasteTags: string[] = [],
  count: number = 3
): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return []
  }

  let keywords = findKeywords(recipeName)

  if (keywords.length === 0) {
    for (const taste of tasteTags) {
      if (TASTE_IMAGES[taste]) {
        keywords.push(TASTE_IMAGES[taste])
      }
    }
  }

  if (keywords.length === 0) {
    keywords = ['chinese food', 'asian food', 'home cooking']
  }

  const searchQuery = keywords.slice(0, 3).join(',')

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        next: { revalidate: 86400 }
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.results?.map((r: any) => r.urls?.regular).filter(Boolean) || []
  } catch (error) {
    console.error('Failed to fetch Unsplash images:', error)
    return []
  }
}
