import { test, expect } from './_fixtures';

type ApiResponse<T> = { code?: number; message?: string; data?: T } & Record<string, any>;

let cachedAuth: { token: string; user: any } | null = null;

async function loginAsAdmin(request: any) {
  if (cachedAuth?.token) return cachedAuth;

  const payload = { username: 'ruofeng', password: 'ruofeng123' };
  let lastErr: unknown = null;
  for (const delayMs of [0, 800, 1500, 2500, 4000]) {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    try {
      const res = await request.post('http://127.0.0.1:8001/api/auth/login', { data: payload });
      const json = (await res.json()) as ApiResponse<{ token?: string; user?: any }>;
      const token = json?.data?.token || json?.token || '';
      const user = json?.data?.user || json?.user || null;
      if (res.ok() && token) {
        cachedAuth = { token, user };
        return cachedAuth;
      }
      // 429：稍后重试
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

async function gotoAdminOrFail(appPage: any, path: string) {
  await appPage.goto(path, { waitUntil: 'domcontentloaded' });
  const url = appPage.url();
  if (url.includes('/admin/login')) {
    throw new Error(`redirected to login when visiting ${path}`);
  }
}

test('TC008 - 后台登录页', async ({ appPage }) => {
  await appPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  await expect(appPage.getByPlaceholder('请输入用户名')).toBeVisible({ timeout: 20_000 });
  await expect(appPage.getByPlaceholder('请输入密码')).toBeVisible({ timeout: 20_000 });
  const loginBtn = appPage.locator('button').filter({ hasText: /登\s*录/ }).first();
  await expect(loginBtn).toBeVisible({ timeout: 20_000 });

  await appPage.getByPlaceholder('请输入用户名').fill('ruofeng');
  await appPage.getByPlaceholder('请输入密码').fill('ruofeng123');

  for (const delayMs of [0, 900, 1800]) {
    if (delayMs) await appPage.waitForTimeout(delayMs);
    await loginBtn.click();
    // 成功则跳转；遇到 429 会停留在登录页并弹 message
    try {
      await expect(appPage).toHaveURL(/\/admin\/dashboard/, { timeout: 8_000 });
      return;
    } catch {
      // 如果提示频繁请求，继续重试
      await appPage.getByText(/请求过于频繁/).first().waitFor({ state: 'visible', timeout: 8_000 }).catch(() => {});
    }
  }
  await expect(appPage).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
});

test('TC009 - 后台仪表盘', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/dashboard');

  await expect(appPage.getByRole('heading', { name: '仪表盘' })).toBeVisible();
  await expect(appPage.getByText('文章总数')).toBeVisible();
});

test('TC010 - 后台文章管理', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/articles');

  await expect(appPage.getByRole('button', { name: '新建文章' })).toBeVisible();
  await expect(appPage.locator('.ant-table')).toBeVisible();
});

test('TC011 - 后台分类管理', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/categories');

  await expect(appPage.getByRole('heading', { name: /分类管理/ })).toBeVisible();
  await expect(appPage.getByRole('button', { name: '新建分类' })).toBeVisible();
  await expect(appPage.locator('.ant-table')).toBeVisible();
});

test('TC012 - 后台标签管理', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/tags');

  await expect(appPage.getByRole('heading', { name: /标签管理/ })).toBeVisible();
  await expect(appPage.getByRole('button', { name: '新建标签' })).toBeVisible();
  await expect(appPage.locator('.ant-table')).toBeVisible();
});

test('TC013 - 后台留言管理', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/messages');

  await expect(appPage.getByRole('heading', { name: /留言管理/ })).toBeVisible();
  await expect(appPage.locator('.ant-table')).toBeVisible();
});

test('TC014 - 后台用户管理', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/users');

  await expect(appPage.getByRole('heading', { name: '用户管理' })).toBeVisible();
  await expect(appPage.locator('.ant-table')).toBeVisible();
});

test('TC015 - 后台设置页', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await gotoAdminOrFail(appPage, '/admin/settings');

  await expect(appPage.getByRole('heading', { name: '个人设置' })).toBeVisible();
  await expect(appPage.getByText('基本信息')).toBeVisible();
});

