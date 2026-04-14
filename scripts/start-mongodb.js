const { spawn } = require('child_process');
const path = require('path');

const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const dbPath = 'C:\\data\\db';
const logPath = 'C:\\data\\log\\mongod.log';

console.log('🔄 Starting MongoDB...');

const mongod = spawn(mongodPath, [
  '--dbpath', dbPath,
  '--logpath', logPath
], {
  stdio: 'inherit',
  shell: false
});

mongod.on('error', (err) => {
  console.error('❌ Failed to start MongoDB:', err.message);
  process.exit(1);
});

mongod.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ MongoDB exited with code ${code}`);
  }
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping MongoDB...');
  mongod.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  mongod.kill();
  process.exit(0);
});
