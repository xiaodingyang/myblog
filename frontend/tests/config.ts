import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 到 process.env（不覆盖已在 shell / CI 里设置的变量）
const envPath = resolve(__dirname, '.env.local');
config({ path: envPath });

const env = process.env;

// 环境配置（一律读 process.env，便于命令行与 run-*.mjs 覆盖 .env.local）
export const testConfig = {
  get target() {
    return env.TEST_TARGET || 'production';
  },

  get useMockApi() {
    return env.USE_MOCK_API === 'true';
  },

  get baseURL() {
    return this.target === 'local'
      ? (env.LOCAL_BASE_URL || 'http://127.0.0.1:8001')
      : (env.PRODUCTION_BASE_URL || 'https://www.xiaodingyang.art');
  },

  get apiUrl() {
    return this.target === 'local'
      ? (env.LOCAL_API_URL || 'http://127.0.0.1:3000')
      : (env.PRODUCTION_API_URL || 'https://www.xiaodingyang.art');
  },

  admin: {
    get username() {
      return env.TEST_ADMIN_USERNAME || 'ruofeng';
    },
    get password() {
      return env.TEST_ADMIN_PASSWORD || '123456';
    },
  },

  screenshot: {
    get maxDiffPixels() {
      return parseInt(env.SCREENSHOT_MAX_DIFF_PIXELS || '100000', 10);
    },
    get maxDiffRatio() {
      return parseFloat(env.SCREENSHOT_MAX_DIFF_RATIO || '0.10');
    },
  },

  timeout: {
    get test() {
      return parseInt(env.TEST_TIMEOUT || '120000', 10);
    },
    get expect() {
      return parseInt(env.EXPECT_TIMEOUT || '30000', 10);
    },
  },

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
