/**
 * 从本机 ~/.claude/providers.json 读取指定 profile，经 SSH 写入服务器 backend/.env 中的 AI_* 并重启 PM2。
 *
 * 用法:
 *   node scripts/sync-ai-env-remote.mjs [user@host] [/var/www/myblog/backend] [profile]
 *
 * 默认: root@162.14.83.58  /var/www/myblog/backend  vb
 *
 * 环境变量:
 *   PROVIDERS_PATH — providers.json 路径（默认 %USERPROFILE%\.claude\providers.json）
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sshTarget = process.argv[2] || 'root@162.14.83.58';
const remoteDir = process.argv[3] || '/var/www/myblog/backend';
const profile = process.argv[4] || 'vb';

const providersPath =
  process.env.PROVIDERS_PATH ||
  path.join(homedir(), '.claude', 'providers.json');

if (!existsSync(providersPath)) {
  console.error('找不到 providers.json:', providersPath);
  process.exit(1);
}

const json = JSON.parse(readFileSync(providersPath, 'utf8'));
const p = json[profile];
if (!p || !p.key || !p.baseUrl || !p.model) {
  console.error(`profile「${profile}」缺少 key/baseUrl/model`);
  process.exit(1);
}

const b64 = (s) => Buffer.from(String(s), 'utf8').toString('base64');
const bBase = b64(p.baseUrl);
const bKey = b64(p.key);
const bModel = b64(p.model);

const safeDir = remoteDir.replace(/'/g, `'\\''`);

const remoteScript = `set -e
cd '${safeDir}'
test -f .env || touch .env
cp -a .env .env.bak.$(date +%s) 2>/dev/null || true
grep -vE '^AI_API_(BASE|KEY|CHAT_MODEL)=' .env > .env.tmp 2>/dev/null || true
mv .env.tmp .env
printf 'AI_API_BASE=%s\\n' "$(echo '${bBase}' | base64 -d)" >> .env
printf 'AI_API_KEY=%s\\n' "$(echo '${bKey}' | base64 -d)" >> .env
printf 'AI_CHAT_MODEL=%s\\n' "$(echo '${bModel}' | base64 -d)" >> .env
if pm2 describe blog-backend >/dev/null 2>&1; then pm2 restart blog-backend --update-env; fi
if pm2 describe blog-api >/dev/null 2>&1; then pm2 restart blog-api --update-env; fi
if ! pm2 describe blog-backend >/dev/null 2>&1 && ! pm2 describe blog-api >/dev/null 2>&1; then echo '未找到 blog-backend / blog-api，请手动 pm2'; fi
pm2 save 2>/dev/null || true
echo 'OK: AI_* 已写入并尝试重启 PM2'
`;

const ssh = spawn('ssh', [sshTarget, 'bash', '-s'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: false,
});

ssh.stdin.write(remoteScript);
ssh.stdin.end();

ssh.on('exit', (code) => process.exit(code ?? 0));
