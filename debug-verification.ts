import { Resend } from 'resend';
import { codeCache } from './lib/redis';

// Test function to debug verification
export async function debugVerification() {
  console.log('=== DEBUG: Verification Code Test ===');

  // 1. Check Redis connection
  try {
    await codeCache.set('test', '123456', 600);
    const result = await codeCache.get('test');
    console.log('✓ Redis test result:', result);
  } catch (error) {
    console.error('✗ Redis error:', error);
  }

  // 2. Check Resend configuration
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✓ Resend API Key set:', process.env.RESEND_API_KEY ? 'YES' : 'NO');
  console.log('✓ Resend From Email:', process.env.RESEND_FROM_EMAIL);

  // 3. Test email sending
  const testEmail = 'meal@xile2026.cn';
  const testCode = '123456';

  try {
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@homecookhub.com',
      to: [testEmail],
      subject: 'Test Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">测试验证码</h2>
          <p>您的测试验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
            ${testCode}
          </div>
        </div>
      `,
    });
    console.log('✓ Email sent successfully:', emailResult);
  } catch (error) {
    console.error('✗ Email sending failed:', error);
  }

  // 4. Check if the code is stored correctly
  try {
    const storedCode = await codeCache.get(testEmail);
    console.log('✓ Stored verification code:', storedCode);
  } catch (error) {
    console.error('✗ Redis get error:', error);
  }
}

// Run test
debugVerification().catch(console.error);