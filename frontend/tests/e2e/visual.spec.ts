import { test, expect } from './_fixtures';
import testConfig from '../config';

/**
 * 可视化回归测试 - 截取各页面截图与基线对比
 * 动态内容（统计数据、时间戳等）通过 mask 屏蔽
 *
 * 注意：首次运行需要使用 --update-snapshots 生成基线截图
 * pnpm exec playwright test visual.spec.ts --update-snapshots
 */

// 动态内容 locator，供各测试复用
const dynamicLocators = (page: any) => [
  page.locator('.ant-statistic-content-value'),     // 统计数据数值
  page.locator('text=/\\d+秒前|\\d+分钟前|\\d+小时前|\\d+天前/'), // 相对时间
  page.locator('.ant-pagination-item-active'),     // 当前页码
];

type ApiResponse<T> = { code?: number; message?: string; data?: T } & Record<string, any>;

async function loginAsAdmin(request: any) {
  const payload = {
    username: testConfig.admin.username,
    password: testConfig.admin.password,
  };

  if (testConfig.useMockApi) {
    return {
      token: 'mock-token-for-testing',
      user: { id: 'mock-admin', username: testConfig.admin.username, role: 'admin' },
    };
  }

  let lastErr: unknown = null;
  for (const delayMs of [0, 800, 1500, 2500, 4000]) {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await request.post(`${testConfig.apiUrl}/api/auth/login`, { data: payload });
      const json = (await res.json()) as ApiResponse<{ token?: string; user?: any }>;
      const token = json?.data?.token || json?.token || '';
      const user = json?.data?.user || json?.user || null;
      if (res.ok() && token) {
        return { token, user };
      }
      if (res.status() === 429 || json?.code === 429) continue;
      throw new Error(`admin login failed: status=${res.status()} body=${JSON.stringify(json)}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function injectAdminAuth(appPage: any, token: string, user: any) {
  await appPage.addInitScript(
    ({ t, u }: { t: string; u: any }) => {
      localStorage.setItem('token', t);
      if (u) localStorage.setItem('user', typeof u === 'string' ? u : JSON.stringify(u));
    },
    { t: token, u: user },
  );
}

// 截图测试 - 需要先生成基线
test.describe.skip('Visual Regression Tests (run with --update-snapshots first)', () => {
  test('V001 - 首页截图', async ({ appPage }) => {
    await appPage.goto('/', { waitUntil: 'domcontentloaded' });
    await appPage.locator('nav, header, .banner, [class*="hero"]').first().waitFor({ state: 'visible', timeout: 30000 });
    await expect(appPage).toHaveScreenshot('V001-homepage.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V002 - 文章列表页截图', async ({ appPage }) => {
    await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });
    await appPage.locator('a[href^="/article/"]').first().waitFor({ state: 'visible', timeout: 30000 });
    await expect(appPage).toHaveScreenshot('V002-articles-page.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V003 - 文章详情页截图', async ({ appPage }) => {
    await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

    const articleLinkSelector = 'a[href^="/article/"]';
    await appPage.locator(articleLinkSelector).first().waitFor({ state: 'visible', timeout: 30000 });

    const firstLink = appPage.locator(articleLinkSelector).first();
    await firstLink.click();
    await appPage.waitForURL(/\/article\/[^/]+/);

    const articleContent = appPage.locator('article, .article-content, .article-detail, [class*="article"]').first();
    await articleContent.waitFor({ state: 'visible', timeout: 15000 });

    const errorMsg = appPage.locator('text=/页面崩溃|出错|Error|服务器错误/');
    await expect(errorMsg).not.toBeVisible({ timeout: 3000 });

    await expect(appPage).toHaveScreenshot('V003-article-detail.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V004 - 分类页截图', async ({ appPage }) => {
    await appPage.goto('/categories', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V004-categories-page.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V005 - 标签云页截图', async ({ appPage }) => {
    await appPage.goto('/tags', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V005-tags-page.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V006 - 关于页截图', async ({ appPage }) => {
    await appPage.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V006-about-page.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

  test('V007 - 留言板页截图', async ({ appPage }) => {
    await appPage.goto('/message', { waitUntil: 'domcontentloaded' });
    await expect(appPage).toHaveScreenshot('V007-message-page.png', {
      mask: dynamicLocators(appPage),
      fullPage: true,
    });
  });

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
