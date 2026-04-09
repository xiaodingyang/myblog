import { test, expect } from './_fixtures';

/**
 * 输入验证测试 - 验证表单校验规则正常工作
 * 注意：需要登录的后台表单验证（V204-V214）留待线上环境测试
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
