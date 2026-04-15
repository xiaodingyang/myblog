import { test, expect } from './_fixtures';
import { dynamicLocators, loginAsAdmin, injectAdminAuth } from './visual-helpers';

/**
 * 可视化回归 — 后台（批次 2/2，串行 worker 减轻登录压力）
 * 单独跑：pnpm e2e:visual:admin
 * 更新基线：pnpm e2e:visual:admin -- --update-snapshots
 */
test.describe('Visual — admin pages', () => {
  test.describe.configure({ mode: 'serial' });

  test('V008 - 后台登录页截图', async ({ appPage }) => {
    await appPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V008-admin-login.png', {
      mask: [],
      fullPage: false,
    });
  });

  test('V009 - 后台仪表盘截图', async ({ appPage, request }) => {
    const { token, user } = await loginAsAdmin(request);
    await injectAdminAuth(appPage, token, user);
    await appPage.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V009-admin-dashboard.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V010 - 后台文章管理页截图', async ({ appPage, request }) => {
    const { token, user } = await loginAsAdmin(request);
    await injectAdminAuth(appPage, token, user);
    await appPage.goto('/admin/articles', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V010-admin-articles.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V011 - 后台分类管理页截图', async ({ appPage, request }) => {
    const { token, user } = await loginAsAdmin(request);
    await injectAdminAuth(appPage, token, user);
    await appPage.goto('/admin/categories', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V011-admin-categories.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V012 - 后台标签管理页截图', async ({ appPage, request }) => {
    const { token, user } = await loginAsAdmin(request);
    await injectAdminAuth(appPage, token, user);
    await appPage.goto('/admin/tags', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V012-admin-tags.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });
});
