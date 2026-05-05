import { Resend } from 'resend'
import { codeCache } from './redis'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

/**
 * 验证码邮件模板
 */
async function sendVerificationEmail(email: string, code: string) {
  try {
    console.log('📧 Sending email to:', email)
    console.log('📧 From:', FROM_EMAIL)
    console.log('📧 Code:', code)

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'HomeCookHub 验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">验证您的邮箱</h2>
          <p>您好，</p>
          <p>感谢您使用 HomeCookHub。您的验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
            ${code}
          </div>
          <p>验证码有效期为 10 分钟，请尽快使用。</p>
          <p style="color: #666; font-size: 14px;">如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
      `,
    })
    console.log('✓ Email sent successfully:', result)
    return { success: true }
  } catch (error: any) {
    console.error('✗ 发送验证码邮件失败:', error)
    console.error('✗ Error name:', error?.name)
    console.error('✗ Error message:', error?.message)
    console.error('✗ Error code:', error?.code)
    console.error('✗ Full error:', JSON.stringify(error, null, 2))
    return { success: false, message: `发送失败: ${error?.message || '请稍后再试'}` }
  }
}

/**
 * 发送验证码
 * @param email 邮箱地址
 */
export async function sendVerificationCode(email: string) {
  console.log('🔑 [sendVerificationCode] Starting for email:', email)

  // 检查是否已发送过验证码（1分钟内）
  const recentCode = await codeCache.get(email)
  if (recentCode) {
    console.log('⏱️ [sendVerificationCode] Recent code exists, blocking')
    return { success: false, message: '验证码已发送，请稍后再试' }
  }

  // 生成6位随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  console.log('🎲 [sendVerificationCode] Generated code:', code)

  // 存储到 Redis（10分钟过期）
  await codeCache.set(email, code, 600)
  console.log('💾 [sendVerificationCode] Code cached in Redis for 600 seconds')

  // 发送邮件
  const result = await sendVerificationEmail(email, code)
  console.log('📬 [sendVerificationCode] Send result:', result)

  return result
}

/**
 * 验证验证码
 * @param email 邮箱地址
 * @param code 验证码
 */
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  const isValid = await codeCache.verifyAndDelete(email, code)
  return { success: isValid, message: isValid ? '验证成功' : '验证码不正确或已过期' }
}
