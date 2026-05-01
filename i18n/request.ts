import { getRequestConfig } from 'next-intl/server'
import { routing } from '@/i18n'

// 直接导入所有翻译文件（确保在构建时可用）
import zhCNCommon from '../messages/zh-CN/common.json'
import zhCNRecipe from '../messages/zh-CN/recipe.json'
import zhCNAuth from '../messages/zh-CN/auth.json'
import zhCNUser from '../messages/zh-CN/user.json'
import zhCNShare from '../messages/zh-CN/share.json'
import zhCNSocial from '../messages/zh-CN/social.json'
import zhCNLayout from '../messages/zh-CN/layout.json'
import zhCNMetadata from '../messages/zh-CN/metadata.json'
import zhCNHome from '../messages/zh-CN/home.json'
import zhCNIngredientInput from '../messages/zh-CN/ingredientInput.json'
import zhCNCommentList from '../messages/zh-CN/commentList.json'
import zhCNCommentForm from '../messages/zh-CN/commentForm.json'
import zhCNRecipeDetail from '../messages/zh-CN/recipeDetail.json'
import zhCNRecipes from '../messages/zh-CN/recipes.json'
import zhCNLogin from '../messages/zh-CN/login.json'
import zhCNLoginForm from '../messages/zh-CN/loginForm.json'
import zhCNHeader from '../messages/zh-CN/header.json'
import zhCNFooter from '../messages/zh-CN/footer.json'
import zhCNOAuth from '../messages/zh-CN/oauth.json'
import zhCNSharePage from '../messages/zh-CN/sharePage.json'
import zhCNShareForm from '../messages/zh-CN/shareForm.json'
import zhCNShareCard from '../messages/zh-CN/shareCard.json'

import enCommon from '../messages/en/common.json'
import enRecipe from '../messages/en/recipe.json'
import enAuth from '../messages/en/auth.json'
import enUser from '../messages/en/user.json'
import enShare from '../messages/en/share.json'
import enSocial from '../messages/en/social.json'
import enLayout from '../messages/en/layout.json'
import enMetadata from '../messages/en/metadata.json'
import enHome from '../messages/en/home.json'
import enIngredientInput from '../messages/en/ingredientInput.json'
import enCommentList from '../messages/en/commentList.json'
import enCommentForm from '../messages/en/commentForm.json'
import enRecipeDetail from '../messages/en/recipeDetail.json'
import enRecipes from '../messages/en/recipes.json'
import enLogin from '../messages/en/login.json'
import enLoginForm from '../messages/en/loginForm.json'
import enHeader from '../messages/en/header.json'
import enFooter from '../messages/en/footer.json'
import enOAuth from '../messages/en/oauth.json'
import enSharePage from '../messages/en/sharePage.json'
import enShareForm from '../messages/en/shareForm.json'
import enShareCard from '../messages/en/shareCard.json'

// 翻译文件映射
const translationFiles: Record<string, Record<string, any>> = {
  'zh-CN': {
    ...zhCNCommon,
    ...zhCNRecipe,
    ...zhCNAuth,
    ...zhCNUser,
    ...zhCNShare,
    ...zhCNSocial,
    ...zhCNLayout,
    ...zhCNMetadata,
    ...zhCNHome,
    ...zhCNIngredientInput,
    ...zhCNCommentList,
    ...zhCNCommentForm,
    ...zhCNRecipeDetail,
    ...zhCNRecipes,
    ...zhCNLogin,
    ...zhCNLoginForm,
    ...zhCNHeader,
    ...zhCNFooter,
    ...zhCNOAuth,
    ...zhCNSharePage,
    ...zhCNShareForm,
    ...zhCNShareCard,
  },
  'en': {
    ...enCommon,
    ...enRecipe,
    ...enAuth,
    ...enUser,
    ...enShare,
    ...enSocial,
    ...enLayout,
    ...enMetadata,
    ...enHome,
    ...enIngredientInput,
    ...enCommentList,
    ...enCommentForm,
    ...enRecipeDetail,
    ...enRecipes,
    ...enLogin,
    ...enLoginForm,
    ...enHeader,
    ...enFooter,
    ...enOAuth,
    ...enSharePage,
    ...enShareForm,
    ...enShareCard,
  },
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // 确保使用支持的语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // 使用预加载的翻译文件，如果没有则使用空对象
  const messages = translationFiles[locale] || {}

  return {
    locale,
    messages,
  }
})
