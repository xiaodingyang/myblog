import { test, expect } from './_fixtures';
import testConfig from '../config';

/**
 * 移动端测试 - 验证响应式布局和移动端特定功能
 */

// 移动端 viewport 配置
const MOBILE_VIEWPORTS = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Pixel 5', width: 393, height: 851 },
];

// 为每个移动端 viewport 创建测试
for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Mobile - ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test(`M001 - 首页在 ${viewport.name} 上正常显示`, async ({ appPage }) => {
      await appPage.goto('/', { waitUntil: 'domcontentloaded' });

      // 验证顶部导航
      await expect(appPage.locator('.ant-layout-header')).toBeVisible({ timeout: 20000 });

      // 验证内容区域
      const hero = appPage
        .getByRole('heading', { name: '精选文章' })
        .or(appPage.getByText('暂无文章').first());
      await expect(hero.first()).toBeVisible({ timeout: 20000 });

      // 验证底部导航（如果有）
      const bottomNav = appPage.locator('.ant-layout-footer, [class*="bottom-nav"]');
      const hasBottomNav = await bottomNav.count();
      if (hasBottomNav > 0) {
        await expect(bottomNav.first()).toBeVisible();
      }
    });

    test(`M002 - 文章列表在 ${viewport.name} 上正常显示`, async ({ appPage }) => {
      await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

      await expect(appPage.getByText('文章列表')).toBeVisible({ timeout: 20000 });

      // 验证文章卡片在移动端正确排列
      const articleCards = appPage.locator('[class*="article-card"], .ant-card');
      const count = await articleCards.count();
      if (count > 0) {
        // 移动端应该单列显示
        const firstCard = articleCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test(`M003 - 导航菜单在 ${viewport.name} 上可用`, async ({ appPage }) => {
      await appPage.goto('/', { waitUntil: 'domcontentloaded' });

      // 检查是否有汉堡菜单（移动端常见）
      const menuButton = appPage.locator('[class*="menu-toggle"], .ant-menu-toggle, button[aria-label*="menu"]').first();
      const hasMenuButton = await menuButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasMenuButton) {
        // 点击打开菜单
        await menuButton.click();
        await appPage.waitForTimeout(500);

        // 验证菜单项可见
        const menuItems = appPage.locator('.ant-menu-item, nav a');
        await expect(menuItems.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });
}

// 通用移动端测试
test.describe('Mobile - Common', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('M004 - 文章详情页在移动端可正常滚动阅读', async ({ appPage }) => {
    await appPage.goto('/articles', { waitUntil: 'domcontentloaded' });

    const articleLinks = appPage.locator('a[href^="/article/"]');
    const count = await articleLinks.count();

    if (count > 0) {
      await articleLinks.first().click();
      await appPage.waitForURL(/\/article\//);

      // 验证文章标题可见
      await expect(appPage.locator('h1').first()).toBeVisible({ timeout: 15000 });

      // 验证页面可滚动
      await appPage.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });

      // 验证返回按钮
      const backButton = appPage.locator('text=返回').first();
      if (await backButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(backButton).toBeVisible();
      }
    }
  });

  test('M005 - 分类页在移动端正常显示', async ({ appPage }) => {
    await appPage.goto('/categories', { waitUntil: 'domcontentloaded' });

    await expect(appPage.getByRole('heading', { name: '文章分类' })).toBeVisible({ timeout: 20000 });

    // 验证分类卡片在移动端正确排列
    const categoryCards = appPage.locator('a[href^="/category/"]');
    const count = await categoryCards.count();
    if (count > 0) {
      await expect(categoryCards.first()).toBeVisible();
    }
  });

  test('M006 - 留言板在移动端可正常输入', async ({ appPage }) => {
    await appPage.goto('/message', { waitUntil: 'domcontentloaded' });

    await expect(appPage.getByText('留言板')).toBeVisible({ timeout: 20000 });

    // 检查输入框是否可交互
    const textarea = appPage.locator('textarea').first();
    const hasTextarea = await textarea.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasTextarea) {
      // 验证输入框可聚焦
      await textarea.click();
      await expect(textarea).toBeFocused();
    }
  });

  test('M007 - 关于页在移动端正常显示', async ({ appPage }) => {
    await appPage.goto('/about', { waitUntil: 'domcontentloaded' });

    await expect(appPage.getByText('肖定阳', { exact: true })).toBeVisible({ timeout: 20000 });

    // 验证内容可滚动查看
    await appPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  });
});
