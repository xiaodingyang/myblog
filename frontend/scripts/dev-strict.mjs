import { spawn } from 'node:child_process';

const expectedPort = Number(process.env.PORT || 8001);
const timeoutMs = Number(process.env.DEV_STRICT_TIMEOUT_MS || 20000);

function spawnPnpmDev() {
  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'cmd.exe' : 'pnpm';
  const args = isWin ? ['/d', '/s', '/c', 'pnpm dev'] : ['dev'];
  return spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'] });
}

const child = spawnPnpmDev();

let resolved = false;
let buffer = '';

function failAndExit(message) {
  if (resolved) return;
  resolved = true;
  try {
    child.kill('SIGTERM');
  } catch {}
  console.error(message);
  process.exit(1);
}

function succeedAndAttach() {
  if (resolved) return;
  resolved = true;
  // From now on, just stream through.
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

function onChunk(chunk) {
  const text = chunk.toString('utf8');
  buffer += text;
  // Echo during detection too (so the user still sees logs).
  process.stdout.write(text);

  // Match "http://localhost:8003" or "Local: http://localhost:8003"
  const m = buffer.match(/localhost:(\d+)/);
  if (!m) return;

  const actualPort = Number(m[1]);
  if (actualPort !== expectedPort) {
    failAndExit(`Umi did not bind expected port ${expectedPort}. Actual: ${actualPort}. (Port likely in use.)`);
    return;
  }

  succeedAndAttach();
}

child.stdout.on('data', onChunk);
child.stderr.on('data', onChunk);

child.on('exit', (code) => {
  if (!resolved) {
    resolved = true;
    process.exit(code ?? 1);
  }
  process.exit(code ?? 0);
});

setTimeout(() => {
  if (!resolved) failAndExit(`Timed out waiting for Umi to bind port ${expectedPort} within ${timeoutMs}ms.`);
}, timeoutMs);

