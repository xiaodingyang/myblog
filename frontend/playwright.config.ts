import { defineConfig } from '@playwright/test';
import testConfig from './tests/config';

/** 可视化分批：由 `pnpm e2e:visual` 设置 `PLAYWRIGHT_VISUAL_BATCH=public|admin`；未设置时从默认 e2e 中排除 */
const visualBatch = process.env.PLAYWRIGHT_VISUAL_BATCH;
const visualRouting =
  visualBatch === 'public'
    ? { testMatch: '**/visual-public.spec.ts' as const, testIgnore: [] as string[] }
    : visualBatch === 'admin'
      ? { testMatch: '**/visual-admin.spec.ts' as const, testIgnore: [] as string[] }
      : { testIgnore: ['**/visual-public.spec.ts', '**/visual-admin.spec.ts'] as string[] };

export default defineConfig({
  testDir: './tests/e2e',
  ...visualRouting,
  retries: testConfig.target === 'production' ? 2 : 0,
  workers: testConfig.target === 'production' ? 1 : 4,
  use: {
    baseURL: testConfig.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    channel: 'chrome',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  timeout: testConfig.timeout.test,
  expect: {
    timeout: testConfig.timeout.expect,
    toHaveScreenshot: {
      maxDiffPixels: testConfig.screenshot.maxDiffPixels,
      maxDiffPixelRatio: testConfig.screenshot.maxDiffRatio,
    },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  // 本地测试时输出配置信息 + 测试后自动清理截图
  ...(process.env.CI
    ? {}
    : {
        globalSetup: './tests/global-setup.ts',
        globalTeardown: './tests/global-teardown.ts',
      }),
});
