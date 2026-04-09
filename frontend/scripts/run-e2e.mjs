import { spawn } from 'node:child_process';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 加载环境变量
const envPath = resolve(__dirname, '../tests/.env.local');
config({ path: envPath });

const baseUrl = process.env.E2E_BASE_URL || process.env.LOCAL_BASE_URL || 'http://127.0.0.1:8001';
const testTarget = process.env.TEST_TARGET || 'local';

function quoteWindowsArg(s) {
  if (/[\s&()^%!"<>|]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    console.log(`\n▶ Running: ${cmd} ${args.join(' ')}\n`);
    const child = isWin
      ? spawn(
          'cmd.exe',
          ['/d', '/s', '/c', [cmd, ...args].map(quoteWindowsArg).join(' ')],
          { stdio: 'inherit', shell: false, ...opts },
        )
      : spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))));
    child.on('error', reject);
  });
}

async function cleanTestArtifacts() {
  const frontendDir = resolve(__dirname, '..');
  const dirsToClean = [
    resolve(frontendDir, 'test-results'),
    resolve(frontendDir, 'playwright-report'),
  ];

  for (const dir of dirsToClean) {
    try {
      await rm(dir, { recursive: true, force: true });
      console.log(`✓ Cleaned: ${dir}`);
    } catch (e) {
      // 目录不存在时忽略
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('E2E Test Runner');
  console.log('========================================');
  console.log(`Target: ${testTarget}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Mock API: ${process.env.USE_MOCK_API || 'false'}`);
  console.log('========================================\n');

  // 清理旧的测试结果
  console.log('Cleaning previous test artifacts...\n');
  await cleanTestArtifacts();

  // 本地测试时等待服务启动
  if (testTarget === 'local') {
    console.log('Waiting for dev server...');
    await run('pnpm', ['exec', 'wait-on', baseUrl]);
  } else {
    console.log('Testing production environment, skipping dev server wait...');
  }

  // 运行测试
  await run('pnpm', ['exec', 'playwright', 'test'], {
    env: { ...process.env, E2E_BASE_URL: baseUrl },
  });
}

main().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
