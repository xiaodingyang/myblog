import { test, expect } from './_fixtures';
import { dynamicLocators } from './visual-helpers';

/**
 * 可视化回归 — 前台公开页（批次 1/2）
 * 单独跑：pnpm e2e:visual:public
 * 更新基线：pnpm e2e:visual:public -- --update-snapshots
 */
test.describe('Visual — public pages', () => {
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
});
