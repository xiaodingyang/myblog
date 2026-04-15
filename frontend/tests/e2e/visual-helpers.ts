import testConfig from '../config';

export type ApiResponse<T> = { code?: number; message?: string; data?: T } & Record<string, any>;

/** 截图时屏蔽易变内容 */
export function dynamicLocators(page: { locator: (s: string) => any }) {
  return [
    page.locator('.ant-statistic-content-value'),
    page.locator('text=/\\d+秒前|\\d+分钟前|\\d+小时前|\\d+天前/'),
    page.locator('.ant-pagination-item-active'),
  ];
}

export async function loginAsAdmin(request: any) {
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

export async function injectAdminAuth(appPage: any, token: string, user: any) {
  await appPage.addInitScript(
    ({ t, u }: { t: string; u: any }) => {
      localStorage.setItem('token', t);
      if (u) localStorage.setItem('user', typeof u === 'string' ? u : JSON.stringify(u));
    },
    { t: token, u: user },
  );
}
