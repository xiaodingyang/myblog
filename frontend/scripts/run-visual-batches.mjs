/**
 * 分批运行可视化回归，避免单次 playwright 进程过重、长时间占用。
 *
 * 用法：
 *   pnpm e2e:visual
 *   pnpm e2e:visual -- --update-snapshots
 *   pnpm e2e:visual -- --headed
 */
import { spawn } from 'node:child_process';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../tests/.env.local') });

const baseUrl = process.env.E2E_BASE_URL || process.env.LOCAL_BASE_URL || 'http://127.0.0.1:8001';
/** 测本地地址时强制走 local 配置，避免 .env.local 里 TEST_TARGET=production 导致 baseURL 仍指向线上 */
const inferredLocal = /127\.0\.0\.1|localhost/i.test(baseUrl);
const testTarget = inferredLocal ? 'local' : process.env.TEST_TARGET || 'production';

const extraArgs = process.argv.slice(2).filter((a) => a !== '--');

function quoteWindowsArg(s) {
  if (/[\s&()^%!"<>|]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const isWin = process.platform === 'win32';
    console.log(`\n▶ ${cmd} ${args.join(' ')}\n`);
    const child = isWin
      ? spawn(
          'cmd.exe',
          ['/d', '/s', '/c', [cmd, ...args].map(quoteWindowsArg).join(' ')],
          { stdio: 'inherit', shell: false, ...opts },
        )
      : spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`${cmd} exited with ${code}`))));
    child.on('error', reject);
  });
}

async function main() {
  console.log('========================================');
  console.log('Visual E2E (batched)');
  console.log('========================================');
  console.log(`Target: ${testTarget}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log('========================================\n');

  if (testTarget === 'local') {
    console.log('Waiting for dev server...\n');
    await run('pnpm', ['exec', 'wait-on', baseUrl]);
  }

  /**
   * 与 ensure-e2e-admin 默认一致。
   * 推断为本地时不得使用 tests/.env.local 里的 TEST_ADMIN_PASSWORD（常为旧值），否则后台可视化一直 401。
   * 若本地密码非默认，请与种子脚本对齐：先设 E2E_ADMIN_PASSWORD 再 pnpm db:ensure-e2e-admin，并 export 同名变量后再跑 e2e:visual。
   */
  const env = {
    ...process.env,
    E2E_BASE_URL: baseUrl,
    TEST_TARGET: testTarget,
    ...(inferredLocal
      ? {
          LOCAL_BASE_URL: baseUrl,
          LOCAL_API_URL: process.env.LOCAL_API_URL || 'http://127.0.0.1:8081',
          TEST_ADMIN_USERNAME:
            process.env.E2E_ADMIN_USERNAME || process.env.TEST_ADMIN_USERNAME || 'ruofeng',
          TEST_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD || '123456',
        }
      : {}),
  };

  console.log('\n--- Batch 1/2: public pages (parallel workers ok) ---\n');
  await run('pnpm', ['exec', 'playwright', 'test', ...extraArgs], {
    env: { ...env, PLAYWRIGHT_VISUAL_BATCH: 'public' },
  });

  console.log('\n--- Batch 2/2: admin pages (workers=1) ---\n');
  await run(
    'pnpm',
    ['exec', 'playwright', 'test', '--workers=1', ...extraArgs],
    { env: { ...env, PLAYWRIGHT_VISUAL_BATCH: 'admin' } },
  );

  console.log('\n✓ All visual batches finished.\n');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
