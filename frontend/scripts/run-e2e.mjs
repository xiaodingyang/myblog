import { spawn } from 'node:child_process';

const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:8001';

function quoteWindowsArg(s) {
  // Minimal quoting for cmd.exe: wrap in double quotes if spaces/specials.
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

await run('pnpm', ['exec', 'wait-on', baseUrl]);
await run('pnpm', ['exec', 'playwright', 'test'], {
  env: { ...process.env, E2E_BASE_URL: baseUrl },
});

