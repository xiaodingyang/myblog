import { test, expect } from './_fixtures';

test('TC001 - 首页', async ({ appPage }) => {
  await appPage.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(appPage).toHaveTitle(/若风|博客/);
  const topNav = appPage.locator('.ant-layout-header');
  await expect(topNav).toBeVisible({ timeout: 20_000 });
  await expect(topNav).toContainText('若风');

  // 文章区域：至少能看到"精选文章"或"暂无文章"
  const hero = appPage
    .getByRole('heading', { name: '精选文章' })
    .or(appPage.getByText('暂无文章').first());
  await expect(hero.first()).toBeVisible({ timeout: 20_000 });

  // 首页底部 CTA 区 + 备案信息
  await expect(appPage.getByText(/想要了解更多/)).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText(/All rights reserved|©/).first()).toBeVisible({ timeout: 20_000 });
});

test('TC002 - 文章列表页', async ({ appPage }) => {
  await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('文章列表')).toBeVisible({ timeout: 20_000 });

  // 等待文章列表或暂无文章出现
  const totalText = appPage.getByText(/共\s*\d+\s*篇文章，记录技术成长的点滴/);
  const noArticleText = appPage.getByText('暂无文章');

  const totalVisible = await totalText.first().isVisible({ timeout: 30_000 }).catch(() => false);
  let total = 0;
  if (totalVisible) {
    const totalRaw = await totalText.first().innerText();
    total = Number((totalRaw.match(/共\s*(\d+)\s*篇文章/) || [])[1] || 0);
  } else {
    await expect(noArticleText).toBeVisible({ timeout: 30_000 });
  }

  const firstArticleLink = appPage.locator('a[href^="/article/"]').first();
  if (total > 0) {
    await expect(firstArticleLink).toBeVisible({ timeout: 20_000 });
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
  await appPage.goto('/categories', { waitUntil: 'networkidle' });

  await expect(appPage.getByRole('heading', { name: '文章分类' })).toBeVisible({ timeout: 20_000 });

  const firstCategory = appPage.locator('a[href^="/category/"]').first();
  const count = await appPage.locator('a[href^="/category/"]').count();
  if (count > 0) {
    await expect(firstCategory).toBeVisible({ timeout: 20_000 });
    await firstCategory.click();
    await expect(appPage).toHaveURL(/\/category\/[^/]+/);
    // 等待页面加载完成（不再显示"加载中"）
    const loading = appPage.locator('text=加载中');
    await loading.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    // 分类可能不存在或显示文章列表
    const articleCount = appPage.locator('text=/共\\s*\\d+\\s*篇文章/').first();
    const notFound = appPage.locator('text=/不存在|空空如也/i').first();
    const hasArticles = await articleCount.isVisible({ timeout: 10_000 }).catch(() => false);
    const hasNotFound = await notFound.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasArticles || hasNotFound).toBeTruthy();
  }
});

test('TC005 - 标签页', async ({ appPage }) => {
  await appPage.goto('/tags', { waitUntil: 'networkidle' });

  await expect(appPage.getByText('标签云')).toBeVisible({ timeout: 20_000 });

  const firstTag = appPage.locator('a[href^="/tag/"]').first();
  const count = await appPage.locator('a[href^="/tag/"]').count();
  if (count > 0) {
    await expect(firstTag).toBeVisible({ timeout: 20_000 });
    await firstTag.click();
    await expect(appPage).toHaveURL(/\/tag\/[^/]+/);
    // 等待页面加载完成（不再显示"加载中"）
    const loading = appPage.locator('text=加载中');
    await loading.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    // 标签可能不存在或显示文章列表
    const articleCount = appPage.locator('text=/共\\s*\\d+\\s*篇文章/').first();
    const notFound = appPage.locator('text=/不存在|空空如也/i').first();
    const hasArticles = await articleCount.isVisible({ timeout: 10_000 }).catch(() => false);
    const hasNotFound = await notFound.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasArticles || hasNotFound).toBeTruthy();
  }
});

test('TC006 - 关于页', async ({ appPage }) => {
  await appPage.goto('/about', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('肖定阳', { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText(/8年经验/).first()).toBeVisible({ timeout: 20_000 });
});

test('TC007 - 留言板页', async ({ appPage }) => {
  await appPage.goto('/message', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByText('留言板')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText('✍️ 发表留言')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByText('💬 全部留言')).toBeVisible({ timeout: 20_000 });
});
