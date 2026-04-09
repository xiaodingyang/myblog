import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
const envPath = resolve(__dirname, '.env.local');
const result = config({ path: envPath });
const env = result.parsed || {};

// 环境配置
export const testConfig = {
  // 测试目标环境
  target: env.TEST_TARGET || 'production',

  // 是否使用 Mock API
  useMockApi: env.USE_MOCK_API === 'true',

  // Base URL（根据环境自动选择）
  get baseURL() {
    return this.target === 'local'
      ? (env.LOCAL_BASE_URL || 'http://127.0.0.1:8001')
      : (env.PRODUCTION_BASE_URL || 'https://www.xiaodingyang.art');
  },

  // API URL
  get apiUrl() {
    return this.target === 'local'
      ? (env.LOCAL_API_URL || 'http://127.0.0.1:3000')
      : (env.PRODUCTION_API_URL || 'https://www.xiaodingyang.art');
  },

  // 测试账号
  admin: {
    username: env.TEST_ADMIN_USERNAME || 'ruofeng',
    password: env.TEST_ADMIN_PASSWORD || 'ruofeng123',
  },

  // 截图配置
  screenshot: {
    maxDiffPixels: parseInt(env.SCREENSHOT_MAX_DIFF_PIXELS || '100000', 10),
    maxDiffRatio: parseFloat(env.SCREENSHOT_MAX_DIFF_RATIO || '0.10'),
  },

  // 超时配置
  timeout: {
    test: parseInt(env.TEST_TIMEOUT || '120000', 10),
    expect: parseInt(env.EXPECT_TIMEOUT || '30000', 10),
  },

  // 输出当前配置（调试用）
  debug() {
    console.log('Test Config:', {
      target: this.target,
      useMockApi: this.useMockApi,
      baseURL: this.baseURL,
      apiUrl: this.apiUrl,
    });
  },
};

export default testConfig;
