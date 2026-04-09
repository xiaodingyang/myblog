import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * 本地测试结束后清理截图和测试产物
 * CI 环境不清理（需要上传附件做归档）
 */
export default function globalTeardown() {
  if (process.env.CI) return;

  const testDir = resolve(__dirname, 'e2e');
  const screenshotDir = resolve(testDir, '__screenshots__');

  if (existsSync(screenshotDir)) {
    try {
      rmSync(screenshotDir, { recursive: true, force: true });
      console.log('\n🧹 已清理本地测试截图');
    } catch (e) {
      console.warn('清理截图失败:', e);
    }
  }
}
