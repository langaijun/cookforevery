// 测试 process.env
import { applyDashscopeApiKeyPreferDotenv } from './lib/dashscope-env-prefer-dotenv.js';

console.log('Before applyDashscopeApiKeyPreferDotenv:');
console.log('process.env.DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY?.substring(0, 20));

applyDashscopeApiKeyPreferDotenv();

console.log('\nAfter applyDashscopeApiKeyPreferDotenv:');
console.log('process.env.DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY?.substring(0, 20));
console.log('Length:', process.env.DASHSCOPE_API_KEY?.length);
