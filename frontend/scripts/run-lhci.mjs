import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const baseUrl = process.env.LHCI_BASE_URL || process.env.E2E_BASE_URL || 'http://127.0.0.1:8001';
const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

function withTempDirOverride(env) {
  if (process.platform !== 'win32') return env;
  // Work around occasional EPERM cleanup issues under %TEMP% on Windows.
  const tmp = env.LHCI_TMP_DIR || join(process.cwd(), '.lhci-tmp');
  return { ...env, LIGHTHOUSE_TEMP_DIR: tmp, TMPDIR: tmp, TEMP: tmp, TMP: tmp };
}

function quoteWindowsArg(s) {
  if (/[\s&()^%!"<>|]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
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

await run('pnpm', ['exec', 'wait-on', url]);
await mkdir(withTempDirOverride(process.env).LIGHTHOUSE_TEMP_DIR, { recursive: true });
await run('pnpm', ['exec', 'lhci', 'autorun', '--config=.lighthouserc.json', `--collect.url=${url}`], {
  env: withTempDirOverride(process.env),
});

