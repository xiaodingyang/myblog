import { test, expect } from './_fixtures';

test('TC001 - 首页', async ({ appPage }) => {
  await appPage.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(appPage).toHaveTitle(/若风|博客/);
  const topNav = appPage.locator('.ant-layout-header');
  await expect(topNav).toBeVisible({ timeout: 20_000 });
  await expect(topNav).toContainText('若风');

  // 文章区域：至少能看到“精选文章”或“暂无文章”
  const hero = appPage
    .getByRole('heading', { name: '精选文章' })
    .or(appPage.getByText('暂无文章').first());
  await expect(hero.first()).toBeVisible({ timeout: 20_000 });

  // 首页 footer（CTA 底部信息区）
  await expect(appPage.locator('.home-cta-footer')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.locator('.home-cta-footer')).toContainText(/All rights reserved|©/);
});

test('TC002 - 文章列表页', async ({ appPage }) => {
  await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('文章列表')).toBeVisible({ timeout: 20_000 });

  // 等待文章列表或暂无文章出现（最多30s），兼容网络慢的情况
  const totalText = appPage.locator('text=/共\\s*\\d+\\s*篇文章/');
  const noArticleText = appPage.getByText('暂无文章');
  
  let total = 0;
  // 优先等待文章列表文字出现
  const totalVisible = await totalText.first().isVisible({ timeout: 30_000 }).catch(() => false);
  if (totalVisible) {
    const totalRaw = await totalText.first().innerText();
    total = Number((totalRaw.match(/共\s*(\d+)\s*篇文章/) || [])[1] || 0);
  } else {
    // 文章数据未加载出来，等待暂无文章
    await expect(noArticleText).toBeVisible({ timeout: 30_000 });
  }

  const firstArticleLink = appPage.locator('a[href^="/article/"]').first();
  if (total > 0) {
    await expect(firstArticleLink).toBeVisible({ timeout: 20_000 });
  } else {
    await expect(noArticleText).toBeVisible({ timeout: 5_000 });
  }

  const pagination = appPage.locator('.ant-pagination');
  if (total > 9) {
    await expect(pagination).toBeVisible();
  } else {
    await expect(pagination).toHaveCount(0);
  }

  if (total > 0) {
    await firstArticleLink.click();
    await expect(appPage).toHaveURL(/\/article\/[^/]+/);
  }
});

test('TC003 - 文章详情页', async ({ appPage }) => {
  await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

  const firstArticleLink = appPage.locator('a[href^="/article/"]').first();
  const count = await appPage.locator('a[href^="/article/"]').count();
  if (count > 0) {
    await expect(firstArticleLink).toBeVisible({ timeout: 20_000 });
    await firstArticleLink.click();
    await expect(appPage).toHaveURL(/\/article\/[^/]+/);
    await expect(appPage.locator('h1')).toBeVisible({ timeout: 20_000 });
    await expect(appPage.locator('text=返回')).toBeVisible({ timeout: 20_000 });
  }
});

test('TC004 - 分类页', async ({ appPage }) => {
  await appPage.goto('/categories', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByRole('heading', { name: '文章分类' })).toBeVisible({ timeout: 20_000 });

  const firstCategory = appPage.locator('a[href^="/category/"]').first();
  const count = await appPage.locator('a[href^="/category/"]').count();
  if (count > 0) {
    await expect(firstCategory).toBeVisible({ timeout: 20_000 });
    await firstCategory.click();
    await expect(appPage).toHaveURL(/\/category\/[^/]+/);
    await expect(appPage.locator('text=/共\\s*\\d+\\s*篇文章/').first()).toBeVisible({ timeout: 20_000 });
  }
});

test('TC005 - 标签页', async ({ appPage }) => {
  await appPage.goto('/tags', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('标签云')).toBeVisible({ timeout: 20_000 });

  const firstTag = appPage.locator('a[href^="/tag/"]').first();
  const count = await appPage.locator('a[href^="/tag/"]').count();
  if (count > 0) {
    await expect(firstTag).toBeVisible({ timeout: 20_000 });
    await firstTag.click();
    await expect(appPage).toHaveURL(/\/tag\/[^/]+/);
    await expect(appPage.locator('text=/共\\s*\\d+\\s*篇文章/').first()).toBeVisible({ timeout: 20_000 });
  }
});

test('TC006 - 关于页', async ({ appPage }) => {
  await appPage.goto('/about', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('肖定阳', { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText(/8年经验/)).toBeVisible({ timeout: 20_000 });
});

test('TC007 - 留言板页', async ({ appPage }) => {
  await appPage.goto('/message', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('留言板')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText('✍️ 发表留言')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText('💬 全部留言')).toBeVisible({ timeout: 20_000 });
});

