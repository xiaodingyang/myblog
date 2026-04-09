import { test as base, expect, type Page, type APIRequestContext, type Locator } from '@playwright/test';
import testConfig from '../config';

function sanitizeForFilename(s: string) {
  return s
    .replaceAll(/[\\/:*?"<>|]+/g, '-')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

// ============ Mock 数据 ============

const MOCK_ARTICLES = [
  {
    id: 'mock-article-1',
    title: '测试文章一：React 最佳实践',
    summary: '这是第一篇测试文章的摘要，介绍 React 开发的最佳实践。',
    content: '# React 最佳实践\n\n## 1. 组件设计\n\n这是文章内容。',
    cover: 'https://picsum.photos/seed/test1/800/400',
    categoryId: 'cat-1',
    tags: ['tag-1', 'tag-2'],
    viewCount: 100,
    likeCount: 10,
    commentCount: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    author: '若风',
    status: 'published',
  },
  {
    id: 'mock-article-2',
    title: '测试文章二：TypeScript 进阶',
    summary: '这是第二篇测试文章的摘要，深入讲解 TypeScript 高级特性。',
    content: '# TypeScript 进阶\n\n## 1. 泛型\n\n这是文章内容。',
    cover: 'https://picsum.photos/seed/test2/800/400',
    categoryId: 'cat-1',
    tags: ['tag-2', 'tag-3'],
    viewCount: 200,
    likeCount: 20,
    commentCount: 8,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    author: '若风',
    status: 'published',
  },
  {
    id: 'mock-article-3',
    title: '测试文章三：Node.js 实战',
    summary: '这是第三篇测试文章的摘要，Node.js 后端开发实战经验分享。',
    content: '# Node.js 实战\n\n## 1. 异步编程\n\n这是文章内容。',
    cover: 'https://picsum.photos/seed/test3/800/400',
    categoryId: 'cat-1',
    tags: ['tag-3'],
    viewCount: 150,
    likeCount: 15,
    commentCount: 6,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
    author: '若风',
    status: 'published',
  },
];

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: '技术', articleCount: 5, description: '技术相关文章' },
  { id: 'cat-2', name: '生活', articleCount: 3, description: '生活感悟' },
  { id: 'cat-3', name: '随笔', articleCount: 2, description: '随笔记录' },
];

const MOCK_TAGS = [
  { id: 'tag-1', name: 'React', articleCount: 3, color: '#61dafb' },
  { id: 'tag-2', name: 'TypeScript', articleCount: 4, color: '#3178c6' },
  { id: 'tag-3', name: 'Node.js', articleCount: 2, color: '#339933' },
];

const MOCK_USER = {
  id: 'mock-admin',
  username: testConfig.admin.username,
  nickname: '测试管理员',
  email: 'admin@test.com',
  role: 'admin',
  avatar: 'https://picsum.photos/seed/admin/100/100',
};

const MOCK_MESSAGES = [
  {
    id: 'msg-1',
    content: '这是一条测试留言',
    nickname: '测试用户',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: 'approved',
  },
  {
    id: 'msg-2',
    content: '这是另一条测试留言',
    nickname: '访客',
    createdAt: '2024-01-02T00:00:00.000Z',
    status: 'approved',
  },
];

const MOCK_COMMENTS = [
  {
    id: 'comment-1',
    articleId: 'mock-article-1',
    content: '写得很好！',
    nickname: '读者A',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ============ 稳定性辅助函数 ============

/**
 * 智能等待元素可见，带重试机制
 */
async function waitForElementStable(
  locator: Locator,
  options: { timeout?: number; retries?: number } = {}
): Promise<boolean> {
  const { timeout = 10000, retries = 3 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout / retries });
      return true;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

/**
 * 等待页面加载完成（网络空闲）
 */
async function waitForPageReady(page: Page, timeout = 30000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // 如果 networkidle 超时，至少等待 domcontentloaded
    await page.waitForLoadState('domcontentloaded');
  }
}

// ============ Mock API 路由处理 ============

async function setupMockAPI(page: Page) {
  // 认证相关 - 最高优先级
  await page.route('**/api/auth/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/api/auth/login')) {
      const body = route.request().postDataJSON();
      if (body?.username === testConfig.admin.username && body?.password === testConfig.admin.password) {
        await route.fulfill({
          json: {
            code: 0,
            data: {
              token: 'mock-token-for-testing',
              user: MOCK_USER,
            },
          },
        });
      } else {
        await route.fulfill({ json: { code: 401, message: '认证失败' } });
      }
      return;
    }

    if (url.includes('/api/auth/me')) {
      await route.fulfill({ json: { code: 0, data: MOCK_USER } });
      return;
    }

    if (url.includes('/api/auth/logout')) {
      await route.fulfill({ json: { code: 0, data: null } });
      return;
    }

    await route.fulfill({ json: { code: 0, data: null } });
  });

  // 统计数据
  await page.route('**/api/statistics**', async (route) => {
    await route.fulfill({
      json: {
        code: 0,
        data: {
          articleCount: 10,
          viewCount: 1000,
          likeCount: 100,
          commentCount: 50,
          messageCount: 20,
          todayViewCount: 50,
        },
      },
    });
  });

  // 文章相关 - 支持分页和筛选
  await page.route('**/api/articles**', async (route) => {
    const url = route.request().url();
    const request = route.request();

    // 单篇文章详情
    if (url.match(/\/api\/articles\/[^/]+$/)) {
      const id = url.split('/api/articles/')[1].split('?')[0];
      const article = MOCK_ARTICLES.find((a) => a.id === id) || MOCK_ARTICLES[0];
      await route.fulfill({ json: { code: 0, data: article } });
      return;
    }

    // 文章列表
    const urlObj = new URL(url);
    const pageParam = parseInt(urlObj.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '10', 10);
    const categoryId = urlObj.searchParams.get('categoryId');
    const tagId = urlObj.searchParams.get('tagId');

    let filteredArticles = [...MOCK_ARTICLES];
    if (categoryId) {
      filteredArticles = filteredArticles.filter((a) => a.categoryId === categoryId);
    }
    if (tagId) {
      filteredArticles = filteredArticles.filter((a) => a.tags.includes(tagId));
    }

    const start = (pageParam - 1) * pageSize;
    const paginatedArticles = filteredArticles.slice(start, start + pageSize);

    await route.fulfill({
      json: {
        code: 0,
        data: {
          list: paginatedArticles,
          total: filteredArticles.length,
          page: pageParam,
          pageSize,
          totalPages: Math.ceil(filteredArticles.length / pageSize),
        },
      },
    });
  });

  // 分类相关
  await page.route('**/api/categories**', async (route) => {
    const url = route.request().url();

    // 单个分类详情
    if (url.match(/\/api\/categories\/[^/]+$/)) {
      const id = url.split('/api/categories/')[1].split('?')[0];
      const category = MOCK_CATEGORIES.find((c) => c.id === id) || MOCK_CATEGORIES[0];
      await route.fulfill({ json: { code: 0, data: category } });
      return;
    }

    await route.fulfill({ json: { code: 0, data: MOCK_CATEGORIES } });
  });

  // 标签相关
  await page.route('**/api/tags**', async (route) => {
    const url = route.request().url();

    if (url.match(/\/api\/tags\/[^/]+$/)) {
      const id = url.split('/api/tags/')[1].split('?')[0];
      const tag = MOCK_TAGS.find((t) => t.id === id) || MOCK_TAGS[0];
      await route.fulfill({ json: { code: 0, data: tag } });
      return;
    }

    await route.fulfill({ json: { code: 0, data: MOCK_TAGS } });
  });

  // 留言相关
  await page.route('**/api/messages**', async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      await route.fulfill({
        json: { code: 0, data: { id: 'msg-new', ...MOCK_MESSAGES[0] } },
      });
      return;
    }

    await route.fulfill({
      json: {
        code: 0,
        data: {
          list: MOCK_MESSAGES,
          total: MOCK_MESSAGES.length,
        },
      },
    });
  });

  // 评论相关
  await page.route('**/api/comments**', async (route) => {
    await route.fulfill({
      json: {
        code: 0,
        data: {
          list: MOCK_COMMENTS,
          total: MOCK_COMMENTS.length,
        },
      },
    });
  });

  // 用户相关
  await page.route('**/api/users**', async (route) => {
    await route.fulfill({
      json: {
        code: 0,
        data: {
          list: [MOCK_USER],
          total: 1,
        },
      },
    });
  });

  // 配置相关
  await page.route('**/api/config**', async (route) => {
    await route.fulfill({
      json: {
        code: 0,
        data: {
          siteName: '若风博客',
          siteDescription: '记录技术成长的点滴',
          icp: '备案号',
        },
      },
    });
  });

  // 搜索相关
  await page.route('**/api/search**', async (route) => {
    const url = new URL(route.request().url());
    const keyword = url.searchParams.get('keyword') || '';
    const results = MOCK_ARTICLES.filter((a) =>
      a.title.includes(keyword) || a.summary.includes(keyword)
    );
    await route.fulfill({
      json: {
        code: 0,
        data: {
          articles: results,
          total: results.length,
        },
      },
    });
  });
}

// ============ Test Fixture ============

export const test = base.extend<{
  appPage: Page;
  mockAPI: void;
}> ({
  // Mock API 注入
  mockAPI: [
    async ({ page }, use) => {
      if (testConfig.useMockApi) {
        await setupMockAPI(page);
      }
      await use();
    },
    { auto: true },
  ],

  // 增强的页面 fixture
  appPage: async ({ page }, use, testInfo) => {
    const logs: string[] = [];
    const networkErrors: string[] = [];
    const apiResponses: { url: string; status: number; body: any }[] = [];

    // 收集页面错误
    page.on('pageerror', (err) => {
      logs.push(`[PAGE ERROR] ${err?.message || String(err)}`);
    });

    // 收集控制台错误（过滤掉已知的无害警告）
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 过滤掉已知的无害错误
        const ignoredPatterns = [
          'Refused to apply style',
          'umi.css',
          'favicon.ico',
        ];
        if (!ignoredPatterns.some((p) => text.includes(p))) {
          logs.push(`[CONSOLE ERROR] ${text}`);
        }
      }
    });

    // 收集网络错误
    page.on('requestfailed', (req) => {
      const errorText = req.failure()?.errorText || 'unknown';
      // 过滤掉已知的无害错误
      if (!errorText.includes('net::ERR_ABORTED')) {
        networkErrors.push(`[NETWORK] ${req.url()} - ${errorText}`);
      }
    });

    // 收集 API 响应（调试用）
    page.on('response', async (res) => {
      if (res.url().includes('/api/')) {
        try {
          const body = await res.json().catch(() => null);
          apiResponses.push({
            url: res.url(),
            status: res.status(),
            body,
          });
        } catch {}
      }
    });

    // @ts-expect-error attach debug logs
    testInfo._e2eLogs = logs;
    // @ts-expect-error attach network errors
    testInfo._networkErrors = networkErrors;
    // @ts-expect-error attach API responses
    testInfo._apiResponses = apiResponses;

    // 注入初始化脚本
    await page.addInitScript(() => {
      // 防止前台自动弹出 GitHub 登录弹窗
      sessionStorage.setItem('login_prompt_shown', '1');

      // 清除可能残留的登录态
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');

      // 禁用动画，提高测试稳定性
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

        /* 隐藏可能导致测试不稳定的元素 */
        .ant-notification,
        .ant-message {
          position: fixed !important;
          z-index: 99999 !important;
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

      // 捕获未处理的 Promise rejection
      window.addEventListener('unhandledrejection', (event) => {
        console.error('[UNHANDLED REJECTION]', event.reason);
      });
    });

    // 设置超时
    page.setDefaultTimeout(testConfig.timeout.expect);
    page.setDefaultNavigationTimeout(30000);

    await use(page);
  },
});

// 测试后钩子：截图和日志收集
test.afterEach(async ({ appPage }, testInfo) => {
  // @ts-expect-error read debug logs
  const logs: string[] | undefined = testInfo._e2eLogs;
  // @ts-expect-error read network errors
  const networkErrors: string[] | undefined = testInfo._networkErrors;

  // 附加错误日志
  if (logs?.length) {
    await testInfo.attach('page-errors', {
      body: logs.join('\n'),
      contentType: 'text/plain',
    });
  }

  if (networkErrors?.length) {
    await testInfo.attach('network-errors', {
      body: networkErrors.join('\n'),
      contentType: 'text/plain',
    });
  }

  // 仅失败时截图（成功时由 globalTeardown 统一清理）
  if (testInfo.status !== testInfo.expectedStatus) {
    const name = sanitizeForFilename(
      [testInfo.project?.name, testInfo.title].filter(Boolean).join(' - '),
    );

    try {
      await appPage.screenshot({
        path: testInfo.outputPath(`${name}.png`),
        fullPage: false,
        timeout: 15000,
      });
    } catch {
      // 忽略截图失败
    }
  }
});

export { expect };

// 导出辅助函数
export const helpers = {
  waitForElementStable,
  waitForPageReady,
};

// 导出 mock 数据供其他测试使用
export const mockData = {
  articles: MOCK_ARTICLES,
  categories: MOCK_CATEGORIES,
  tags: MOCK_TAGS,
  user: MOCK_USER,
  messages: MOCK_MESSAGES,
  comments: MOCK_COMMENTS,
};
