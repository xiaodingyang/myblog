import { test, expect } from './_fixtures';

/**
 * 输入验证测试 - 验证表单校验规则正常工作
 */

// ============ 管理后台登录页验证（无需真实账号） ============

test('V201 - 登录页空用户名应提示请输入用户名', async ({ appPage }) => {
  await appPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  await appPage.getByPlaceholder('请输入用户名').fill('');
  await appPage.getByPlaceholder('请输入密码').fill('anypassword');
  await appPage.locator('button').filter({ hasText: /登\s*录/ }).first().click();

  await expect(appPage.getByText('请输入用户名')).toBeVisible({ timeout: 5000 });
});

test('V202 - 登录页空密码应提示请输入密码', async ({ appPage }) => {
  await appPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  await appPage.getByPlaceholder('请输入用户名').fill('anyuser');
  await appPage.getByPlaceholder('请输入密码').fill('');
  await appPage.locator('button').filter({ hasText: /登\s*录/ }).first().click();

  await expect(appPage.getByText('请输入密码')).toBeVisible({ timeout: 5000 });
});

test('V203 - 登录页错误密码应提示认证失败', async ({ appPage }) => {
  await appPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  await appPage.getByPlaceholder('请输入用户名').fill('anyuser');
  await appPage.getByPlaceholder('请输入密码').fill('wrongpassword');
  await appPage.locator('button').filter({ hasText: /登\s*录/ }).first().click();

  await expect(appPage.getByText(/认证失败|用户名或密码错误/i)).toBeVisible({ timeout: 8000 });
});

// ============ 留言板 maxLength 属性验证（无需登录） ============

test('V102 - 留言板 textarea maxLength 应为 500', async ({ appPage }) => {
  await appPage.goto('/message', { waitUntil: 'domcontentloaded' });

  const textarea = appPage.locator('textarea').first();
  const maxLength = await textarea.getAttribute('maxLength');
  expect(Number(maxLength)).toBe(500);
});

// ============ 管理后台设置表单验证 ============

async function loginAsAdmin(request: any) {
  type ApiResponse<T> = { code?: number; message?: string; data?: T } & Record<string, any>;
  let cachedAuth: { token: string; user: any } | null = null;
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

async function loginAndGotoSettings(appPage: any, request: any) {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
}

test('V204 - 设置页用户名过短应提示至少2个字符', async ({ appPage, request }) => {
  await loginAndGotoSettings(appPage, request);

  const usernameInput = appPage.getByLabel('用户名').locator('input');
  await usernameInput.clear();
  await usernameInput.fill('a');

  await appPage.locator('button').filter({ hasText: /保存|更新|修改/ }).first().click();

  await expect(appPage.getByText(/用户名至少2个字符/)).toBeVisible({ timeout: 5000 });
});

test('V205 - 设置页用户名过长应提示不能超过20个字符', async ({ appPage, request }) => {
  await loginAndGotoSettings(appPage, request);

  const usernameInput = appPage.getByLabel('用户名').locator('input');
  await usernameInput.clear();
  await usernameInput.fill('a'.repeat(21));

  await appPage.locator('button').filter({ hasText: /保存|更新|修改/ }).first().click();

  await expect(appPage.getByText(/用户名不能超过20个字符/)).toBeVisible({ timeout: 5000 });
});

test('V206 - 设置页邮箱格式错误应提示请输入正确的邮箱格式', async ({ appPage, request }) => {
  await loginAndGotoSettings(appPage, request);

  const emailInput = appPage.getByLabel('邮箱').locator('input');
  await emailInput.clear();
  await emailInput.fill('invalid-email');

  await appPage.locator('button').filter({ hasText: /保存|更新|修改/ }).first().click();

  await expect(appPage.getByText(/请输入正确的邮箱格式/)).toBeVisible({ timeout: 5000 });
});

test('V207 - 设置页新密码过短应提示密码至少6个字符', async ({ appPage, request }) => {
  await loginAndGotoSettings(appPage, request);

  const newPwdInput = appPage.getByLabel('新密码').locator('input');
  await newPwdInput.clear();
  await newPwdInput.fill('12345');

  await appPage.locator('button').filter({ hasText: /保存|更新|修改/ }).first().click();

  await expect(appPage.getByText(/密码至少6个字符/)).toBeVisible({ timeout: 5000 });
});

test('V208 - 设置页确认密码不一致应提示两次输入的密码不一致', async ({ appPage, request }) => {
  await loginAndGotoSettings(appPage, request);

  const newPwdInput = appPage.getByLabel('新密码').locator('input');
  await newPwdInput.clear();
  await newPwdInput.fill('ruofeng123');

  const confirmPwdInput = appPage.getByLabel('确认密码').locator('input');
  await confirmPwdInput.clear();
  await confirmPwdInput.fill('ruofeng456');

  await appPage.locator('button').filter({ hasText: /保存|更新|修改/ }).first().click();

  await expect(appPage.getByText(/两次输入的密码不一致/)).toBeVisible({ timeout: 5000 });
});

// ============ 管理后台标签/分类/文章表单验证 ============

test('V209 - 标签管理空名称应提示请输入标签名称', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/tags', { waitUntil: 'domcontentloaded' });

  await appPage.getByRole('button', { name: '新建标签' }).click();
  await appPage.locator('button').filter({ hasText: /确\s*定|保\s*存/ }).last().click();

  await expect(appPage.getByText('请输入标签名称')).toBeVisible({ timeout: 5000 });
});

test('V210 - 标签管理名称过长应提示不能超过20个字符', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/tags', { waitUntil: 'domcontentloaded' });

  await appPage.getByRole('button', { name: '新建标签' }).click();

  const firstInput = appPage.locator('input').first();
  await firstInput.fill('a'.repeat(21));

  await appPage.locator('button').filter({ hasText: /确\s*定|保\s*存/ }).last().click();

  await expect(appPage.getByText(/标签名称不能超过20个字符/)).toBeVisible({ timeout: 5000 });
});

test('V211 - 分类管理空名称应提示请输入分类名称', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/categories', { waitUntil: 'domcontentloaded' });

  await appPage.getByRole('button', { name: '新建分类' }).click();
  await appPage.locator('button').filter({ hasText: /确\s*定|保\s*存/ }).last().click();

  await expect(appPage.getByText('请输入分类名称')).toBeVisible({ timeout: 5000 });
});

test('V212 - 文章创建空标题应提示请输入文章标题', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/articles/create', { waitUntil: 'domcontentloaded' });

  await appPage.locator('button[type="submit"]').click();

  await expect(appPage.getByText('请输入文章标题')).toBeVisible({ timeout: 5000 });
});

test('V213 - 文章创建空内容应提示请输入文章内容', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/articles/create', { waitUntil: 'domcontentloaded' });

  const titleInput = appPage.locator('input').filter({ hasAttribute: 'maxLength' }).first();
  if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleInput.fill('测试文章标题');
  }

  await appPage.locator('button[type="submit"]').click();

  await expect(appPage.getByText('请输入文章内容')).toBeVisible({ timeout: 5000 });
});

test('V214 - 文章创建未选分类应提示请选择文章分类', async ({ appPage, request }) => {
  const { token, user } = await loginAsAdmin(request);
  await injectAdminAuth(appPage, token, user);
  await appPage.goto('/admin/articles/create', { waitUntil: 'domcontentloaded' });

  const titleInput = appPage.locator('input').filter({ hasAttribute: 'maxLength' }).first();
  if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await titleInput.fill('测试文章标题');
  }

  const contentTextarea = appPage.locator('textarea').first();
  if (await contentTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
    await contentTextarea.fill('# 测试内容');
  }

  await appPage.locator('button[type="submit"]').click();

  await expect(appPage.getByText('请选择文章分类')).toBeVisible({ timeout: 5000 });
});
