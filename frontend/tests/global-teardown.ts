import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * 本地测试结束后清理运行产物（失败 diff、trace 等）
 * 不可删除 `tests/e2e/__screenshots__`：其中是 toHaveScreenshot 的基线 PNG，删了下一轮对比会全挂
 * CI 环境不清理（需要上传附件做归档）
 */
export default function globalTeardown() {
  if (process.env.CI) return;

  const root = resolve(__dirname, '..');
  for (const name of ['test-results', 'playwright-report'] as const) {
    const dir = resolve(root, name);
    if (!existsSync(dir)) continue;
    try {
      rmSync(dir, { recursive: true, force: true });
      console.log(`\n🧹 已清理 ${name}`);
    } catch (e) {
      console.warn(`清理 ${name} 失败:`, e);
    }
  }
}
