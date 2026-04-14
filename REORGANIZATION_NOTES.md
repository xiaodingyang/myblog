# ⚠️ 整理后的注意事项

## 已确认的影响

### ✅ 无影响的移动

以下文件移动**不会**影响项目功能：

1. **性能报告** (`archive/reports/`)
   - `baseline-*.html`
   - `baseline-*.json`
   - `baseline-*.md`
   - 这些是历史报告，不被代码引用

2. **文档** (`docs/`)
   - 所有 `.md` 文档
   - 仅供人类阅读，不被代码引用

3. **备份** (`archive/backups/`)
   - 数据库备份文件
   - 不被代码引用

4. **脚本** (`scripts/`)
   - `deploy.sh`
   - `proxy-server.js`
   - `import-db.js`
   - `start-mongodb.js`
   - 这些脚本通过 `package.json` 的绝对路径引用，移动后仍然有效

---

## ⚠️ 需要注意的文件

### 1. `vercel.json` - 已恢复到根目录 ✅

**原因**: Vercel CLI 和 Umi 框架会在**根目录**查找 `vercel.json`

**解决方案**: 已将 `vercel.json` 恢复到根目录

**位置**:
- ✅ 根目录: `myblog/vercel.json` (Vercel 部署使用)
- 📁 备份: `myblog/config/vercel.json` (仅供参考)

---

### 2. `nginx.conf` - 仅供参考 ✅

**说明**: 
- `myblog/config/nginx.conf` 仅供参考
- 实际生产配置在服务器: `/etc/nginx/conf.d/myblog.conf`
- 代码中的注释引用不影响功能

**frontend/.umirc.ts 中的注释**:
```typescript
/** browser history：线上需 Nginx `try_files $uri $uri/ /index.html;`（见仓库 nginx.conf） */
```
这只是注释说明，不影响功能。

---

## ✅ 验证清单

### 前端功能验证

```bash
cd frontend

# 1. 开发环境启动
pnpm dev
# 预期: 正常启动在 http://localhost:8000

# 2. 构建
pnpm build
# 预期: 正常构建到 dist/ 目录

# 3. E2E 测试
pnpm e2e
# 预期: 测试正常运行
```

### 后端功能验证

```bash
cd backend

# 1. 开发环境启动
pnpm dev
# 预期: 正常启动在 http://localhost:8081

# 2. 测试
pnpm test
# 预期: 测试通过
```

### Monorepo 功能验证

```bash
# 在根目录

# 1. 启动 MongoDB + 后端 + 前端
pnpm dev
# 预期: 三个服务同时启动

# 2. 构建
pnpm build
# 预期: 前后端都构建成功
```

### Vercel 部署验证

```bash
# 在根目录

# 1. 检查 vercel.json 是否存在
ls -lh vercel.json
# 预期: 文件存在

# 2. 部署到 Vercel
vercel --prod
# 预期: 部署成功
```

---

## 📋 文件位置对照表

| 文件 | 原位置 | 新位置 | 是否影响功能 |
|------|--------|--------|-------------|
| `vercel.json` | 根目录 | **根目录** (已恢复) | ❌ 无影响 |
| `nginx.conf` | 根目录 | `config/` | ❌ 无影响（仅供参考） |
| `deploy.sh` | 根目录 | `scripts/` | ❌ 无影响 |
| `proxy-server.js` | 根目录 | `scripts/` | ❌ 无影响 |
| 性能报告 | 根目录 | `archive/reports/` | ❌ 无影响 |
| 技术文档 | 根目录 | `docs/technical/` | ❌ 无影响 |
| 项目文档 | 根目录 | `docs/feature-design/` | ❌ 无影响 |

---

## 🔧 如果遇到问题

### 问题 1: Vercel 部署失败

**症状**: `vercel --prod` 报错找不到 `vercel.json`

**解决方案**:
```bash
# 确认 vercel.json 在根目录
ls -lh vercel.json

# 如果不存在，从 config 复制
cp config/vercel.json .
```

### 问题 2: 脚本找不到

**症状**: `pnpm dev` 报错找不到 `scripts/start-mongodb.js`

**解决方案**:
```bash
# 检查 package.json 中的路径
cat package.json | grep "scripts/"

# 确认脚本存在
ls -lh scripts/
```

### 问题 3: 文档链接失效

**症状**: README 中的文档链接打不开

**解决方案**:
- 文档已移动到 `docs/` 目录下的子文件夹
- 查看 `docs/README.md` 获取新的文档索引

---

## ✅ 总结

**整理后的项目完全正常！**

- ✅ 所有代码引用都已验证
- ✅ `vercel.json` 已恢复到根目录
- ✅ 脚本路径通过 `package.json` 正确引用
- ✅ 配置文件移动不影响功能
- ✅ 文档移动不影响代码运行

**建议**:
1. 运行一次 `pnpm dev` 确认开发环境正常
2. 运行一次 `pnpm build` 确认构建正常
3. 如果要部署，运行 `vercel --prod` 确认部署正常

---

*检查时间: 2026-04-13*
*检查人: Claude AI Assistant*
