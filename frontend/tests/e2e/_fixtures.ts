import { test as base, expect, type Page } from '@playwright/test';

function sanitizeForFilename(s: string) {
  return s
    .replaceAll(/[\\/:*?"<>|]+/g, '-')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export const test = base.extend<{
  appPage: Page;
}>({
  appPage: async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    page.on('pageerror', (err) => logs.push(`pageerror: ${err?.message || String(err)}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') logs.push(`console.error: ${msg.text()}`);
    });
    // @ts-expect-error attach debug logs
    testInfo._e2eLogs = logs;

    await page.addInitScript(() => {
      // 防止前台 3s 后自动弹出 GitHub 登录弹窗干扰用例断言
      sessionStorage.setItem('login_prompt_shown', '1');

      // 避免跨用例残留后台登录态影响 /admin/login 断言
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 尽量减少动效，降低截图/定位时的不确定性
      const style = document.createElement('style');
      style.setAttribute('data-e2e', '1');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
      `;
      const mount = () => {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (head) head.appendChild(style);
      };
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', mount, { once: true });
      } else {
        mount();
      }
    });
    page.setDefaultTimeout(15_000);
    page.setDefaultNavigationTimeout(20_000);
    await use(page);
  },
});

test.afterEach(async ({ appPage }, testInfo) => {
  // @ts-expect-error read debug logs
  const logs: string[] | undefined = testInfo._e2eLogs;
  if (logs?.length) {
    await testInfo.attach('page-errors', {
      body: logs.join('\n'),
      contentType: 'text/plain',
    });
  }

  const name = sanitizeForFilename(
    [testInfo.project?.name, testInfo.title].filter(Boolean).join(' - '),
  );
  try {
    await appPage.screenshot({
      path: testInfo.outputPath(`${name}.png`),
      fullPage: false,
      timeout: 15_000,
    });
  } catch {
    // ignore screenshot failures (仍保留测试断言结果)
  }
});

export { expect };

