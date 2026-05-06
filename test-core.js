// 测试图片生成的核心功能
const fs = require('fs')
const path = require('path')

// 设置环境变量
process.env.DASHSCOPE_API_KEY = 'sk-21b7454677784d658ab8c91a8c5d15ed'
process.env.RAILWAY_BUCKET_NAME = 'allocated-tray-xqjwxtlmff'
process.env.RAILWAY_BUCKET_ENDPOINT = 'https://t3.storageapi.dev'
process.env.RAILWAY_ACCESS_KEY_ID = 'tid_AYMPyA_EtFgJzlOBiZbDytroVyz_ZWeKCuVHsk_WNPVtuJNnie'
process.env.RAILWAY_SECRET_ACCESS_KEY = 'tsec_SM+VhNhBqs9rfM-kh9cxY8FSXhkpOykbkWCdZkLcw2Ljq3k7-+uGlSHt0yenLAx9KAY_Pw'
process.env.PUBLIC_BUCKETS_HOST = 'webserver-production-a8c2.up.railway.app'

console.log('=== 测试图片生成核心功能 ===')

// 测试生成提示词
function generatePrompt(recipe) {
  const { name, description, ingredients, tasteTags, steps = [] } = recipe

  // 步骤按顺序，每个加上清晰的前缀
  const stepsWithNumber = steps.map((step, i) => {
    let conciseStep = step
      conciseStep = conciseStep.replace(/等/g, '，').replace(/。/g, '，')

    return `【步骤${i + 1}】${conciseStep}`
  })

  // 口味描述
  const tasteDesc = tasteTags
    .map(t => {
      switch(t) {
        case 'sour': return '酸'
        case 'sweet': return '甜'
        case 'spicy': return '辣'
        case 'salty': return '咸'
        case 'savory': return '鲜'
        case 'numb': return '麻'
        case 'mild': return '清淡'
        default: return t
      }
    })
    .filter(Boolean)
    .join('、')

  // 主要食材（前4种）
  const mainIngredients = ingredients.slice(0, 4).join('、')

  // 构建完整提示词
  let prompt = `【菜品名称】${name}。\n`
  prompt += `【主要食材】${mainIngredients}。\n`
  prompt += `【口味特点】${tasteDesc}口味。\n`
  prompt += `【画面要求】精美的中式美食成品图，菜品摆盘美观，色泽诱人，菜品在盘子中央，汤汁光亮，周围有适量的装饰配菜。自然柔光，高分辨率，背景简洁干净，突出菜品的色香味俱全。采用美食杂志风格的摄影效果，展示菜品最诱人的状态。\n`
  prompt += `【图片规格】1280x720像素，16:9横构图，PNG格式。`

  return prompt
}

// 测试用例
const testRecipe = {
  name: '宫保鸡丁',
  description: '经典川菜，鸡肉嫩滑，花生香脆，口感丰富',
  ingredients: ['鸡胸肉', '花生米', '干辣椒', '葱', '姜', '蒜', '花椒'],
  tasteTags: ['spicy', 'savory'],
  steps: [
    '鸡胸肉切丁，用料酒、生抽、淀粉腌制15分钟',
    '花生米炸至金黄，备用',
    '热锅下油，爆香葱姜蒜和干辣椒',
    '下鸡丁翻炒至变色',
    '加入调味料，炒匀后加入花生米即可'
  ]
}

// 生成提示词
const prompt = generatePrompt(testRecipe)
console.log('生成的提示词：')
console.log(prompt)
console.log('\n提示词长度:', prompt.length)