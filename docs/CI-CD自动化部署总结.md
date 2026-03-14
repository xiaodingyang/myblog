# CI/CD 自动化部署实战总结

## 一、整体架构

```
开发者 git push
       │
       ▼
  GitHub Actions (CI/CD)
       │
       ├── 1. 拉取代码
       ├── 2. 安装依赖 (pnpm install)
       ├── 3. 构建前端 (pnpm build)
       ├── 4. rsync 上传 dist 到服务器
       ├── 5. rsync 同步后端代码到服务器
       ├── 6. SSH 远程重启后端服务 (pm2)
       ├── 7. SSH 远程重载 Nginx
       └── 8. 调用 Server酱 API 推送微信通知
                │
                ▼
           微信收到部署结果通知
```

### 技术栈

| 组件 | 技术选型 | 作用 |
|------|---------|------|
| CI/CD 平台 | GitHub Actions | 自动触发构建和部署 |
| 包管理器 | pnpm 10 | 安装前端依赖 |
| 文件传输 | rsync over SSH | 将构建产物和代码同步到服务器 |
| 进程管理 | pm2 | 管理后端 Node.js 服务 |
| Web 服务器 | Nginx | 静态文件托管 + 反向代理 |
| 消息推送 | Server酱 (SCT) | 部署结果推送到微信 |

## 二、为什么需要 CI/CD

### 手动部署的痛点

1. **繁琐**：每次改代码都要手动 `pnpm build` → `scp` → `ssh` 重启服务
2. **易出错**：忘记构建、上传遗漏文件、忘记重启服务
3. **不可追溯**：不知道线上跑的是哪个版本的代码
4. **协作困难**：多人协作时部署流程不统一

### CI/CD 的优势

1. **全自动**：push 代码即触发，无需人工干预
2. **一致性**：每次构建环境完全一致（GitHub 提供标准 Ubuntu 容器）
3. **可追溯**：每次部署对应一个 commit，有完整日志
4. **即时反馈**：微信通知部署成功/失败，第一时间掌握状态

## 三、GitHub Actions 核心概念

### 基本结构

```yaml
name: Deploy Blog          # Workflow 名称

on:                         # 触发条件
  push:
    branches: [main]        # 只在 push 到 main 分支时触发

jobs:                       # 任务列表
  deploy:                   # 任务名称
    runs-on: ubuntu-latest  # 运行环境
    steps:                  # 执行步骤
      - name: Step 1
        run: echo "Hello"
```

### 关键概念

| 概念 | 说明 |
|------|------|
| **Workflow** | 一个自动化流程，由 `.github/workflows/*.yml` 定义 |
| **Event** | 触发 Workflow 的事件（如 push、pull_request） |
| **Job** | Workflow 中的一组步骤，在同一个虚拟机上执行 |
| **Step** | Job 中的单个操作，可以是 shell 命令或 Action |
| **Action** | 可复用的步骤单元（如 `actions/checkout@v4`） |
| **Secret** | 加密的环境变量，用于存储敏感信息 |

### Secrets（密钥管理）

Secrets 是 GitHub 提供的加密变量存储，用于保存不能暴露在代码中的敏感信息：

- 在 **仓库 Settings → Secrets and variables → Actions** 中配置
- 在 workflow 中通过 `${{ secrets.SECRET_NAME }}` 引用
- 日志中自动脱敏，不会泄露

本项目配置了 4 个 Secret：

| Secret | 用途 |
|--------|------|
| `SERVER_HOST` | 服务器 IP 地址 |
| `SERVER_USER` | SSH 登录用户名 |
| `SERVER_SSH_KEY` | SSH 私钥（用于免密登录服务器） |
| `WECHAT_SEND_KEY` | Server酱推送 Key（用于微信通知） |

## 四、Workflow 详细解析

### 完整流程图

```
Checkout → Setup pnpm → Setup Node.js
    │
    ▼
Install Dependencies (--frozen-lockfile)
    │
    ▼
Build Frontend (umi build)
    │
    ▼
Setup SSH Key (写入私钥 + ssh-keyscan)
    │
    ▼
rsync dist/ → 服务器 /var/www/myblog/frontend/dist/
    │
    ▼
SSH: pm2 restart + nginx -s reload
    │
    ▼
rsync backend/ → 服务器 /var/www/myblog/backend/
    │
    ▼
SSH: pnpm install + pm2 restart
    │
    ├── 成功 → 微信通知 ✅
    └── 失败 → 微信通知 ❌
```

### 各步骤详解

#### 1. 拉取代码

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

使用官方 Action 将仓库代码克隆到 CI 虚拟机。`@v4` 表示 Action 的版本号。

#### 2. 安装 pnpm 和 Node.js

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: pnpm
    cache-dependency-path: frontend/pnpm-lock.yaml
```

**要点**：
- pnpm 版本必须和本地一致（本地 pnpm 10 生成的 lockfile v9，pnpm 8 无法解析）
- `cache: pnpm` 启用依赖缓存，加速后续构建
- `cache-dependency-path` 指定 lockfile 位置，因为前端不在根目录

#### 3. 安装依赖并构建

```yaml
- name: Install frontend dependencies
  working-directory: frontend
  run: pnpm install --frozen-lockfile

- name: Build frontend
  working-directory: frontend
  run: pnpm build
```

**`--frozen-lockfile` 的作用**：
- 严格按照 `pnpm-lock.yaml` 安装，不允许修改 lockfile
- 确保 CI 环境的依赖版本和本地开发完全一致
- 如果 lockfile 和 `package.json` 不同步会直接报错，避免隐性 bug

#### 4. 配置 SSH 密钥

```yaml
- name: Setup SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SERVER_SSH_KEY }}" > ~/.ssh/id_deploy
    chmod 600 ~/.ssh/id_deploy
    ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
```

**过程**：
1. 将存在 Secrets 中的 SSH 私钥写入文件
2. `chmod 600` 设置权限（SSH 要求私钥文件只有所有者可读写）
3. `ssh-keyscan` 获取服务器指纹并加入 known_hosts，避免首次连接的交互确认

#### 5. rsync 部署文件

```yaml
- name: Deploy to server
  run: |
    rsync -avz --delete \
      -e "ssh -i ~/.ssh/id_deploy" \
      frontend/dist/ \
      ${{ env.SERVER_USER }}@${{ env.SERVER_HOST }}:/var/www/myblog/frontend/dist/
```

**rsync vs scp**：

| 特性 | rsync | scp |
|------|-------|-----|
| 增量传输 | ✅ 只传输变更的文件 | ❌ 每次全量传输 |
| 删除旧文件 | ✅ `--delete` 自动删除 | ❌ 需手动清理 |
| 压缩传输 | ✅ `-z` 压缩 | ❌ 不压缩 |
| 速度 | 快（增量） | 慢（全量） |

**参数说明**：
- `-a`：归档模式，保留文件权限、时间戳等
- `-v`：详细输出
- `-z`：传输时压缩
- `--delete`：删除目标目录中源目录没有的文件
- `-e "ssh -i ..."`：指定 SSH 密钥

#### 6. 远程重启服务

```yaml
- name: Install backend dependencies & restart services
  run: |
    ssh -i ~/.ssh/id_deploy ${{ env.SERVER_USER }}@${{ env.SERVER_HOST }} << 'EOF'
      cd /var/www/myblog/backend
      pnpm install --frozen-lockfile 2>/dev/null || pnpm install
      pm2 restart blog-api 2>/dev/null || pm2 start src/index.js --name blog-api
      pm2 save
      nginx -s reload
    EOF
```

**pm2 命令**：
- `pm2 restart blog-api`：重启已有进程
- `pm2 start src/index.js --name blog-api`：首次启动时注册进程
- `pm2 save`：保存进程列表，服务器重启后自动恢复
- `2>/dev/null || ...`：如果进程不存在，忽略错误执行后备命令

#### 7. 微信通知

```yaml
- name: Notify WeChat on success
  if: success()
  run: |
    COMMIT_MSG=$(git log -1 --pretty=format:'%s')
    curl -s -X POST "https://sctapi.ftqq.com/${{ secrets.WECHAT_SEND_KEY }}.send" \
      -d "title=✅ 博客部署成功" \
      -d "desp=部署详情..."

- name: Notify WeChat on failure
  if: failure()
  run: |
    curl -s -X POST "https://sctapi.ftqq.com/${{ secrets.WECHAT_SEND_KEY }}.send" \
      -d "title=❌ 博客部署失败" \
      -d "desp=失败详情..."
```

**关键点**：
- `if: success()` / `if: failure()` 是条件执行，根据前面步骤的结果决定执行哪个通知
- 使用 Server酱 API，只需一个 HTTP POST 请求即可推送消息到微信
- `git log -1 --pretty=format:'%s'` 提取最新 commit 信息，让通知内容有上下文

## 五、Server酱（微信通知）

### 什么是 Server酱

Server酱（ServerChan）是一个免费的消息推送服务，可以通过调用 API 向微信发送通知。

### 工作原理

```
GitHub Actions                    Server酱服务器                微信
     │                                │                       │
     ├── HTTP POST (SendKey + 消息) ──►│                       │
     │                                ├── 推送到微信服务号 ────►│
     │                                │                       │ 用户收到消息
```

### API 格式

```bash
curl -X POST "https://sctapi.ftqq.com/{SendKey}.send" \
  -d "title=消息标题" \
  -d "desp=消息正文（支持 Markdown）"
```

### 注册步骤

1. 访问 https://sct.ftqq.com/
2. 微信扫码登录
3. 复制 SendKey
4. 关注「方糖」服务号（用于接收消息）

## 六、SSH 密钥认证原理

### 为什么需要 SSH 密钥

GitHub Actions 的 CI 虚拟机每次都是全新的，无法像本地终端一样输入密码。SSH 密钥认证实现了免密登录。

### 工作原理

```
1. 生成密钥对
   ssh-keygen → 私钥 (id_deploy) + 公钥 (id_deploy.pub)

2. 公钥放在服务器
   ssh-copy-id → 写入服务器的 ~/.ssh/authorized_keys

3. 私钥存在 GitHub Secrets
   CI 运行时取出私钥 → 连接服务器 → 服务器用公钥验证 → 认证通过
```

### 安全性

- **私钥**：只存在 GitHub Secrets 中，加密存储，日志自动脱敏
- **公钥**：存在服务器上，即使泄露也无法反推私钥
- **建议**：为 CI/CD 单独生成一对密钥，不要复用个人密钥

## 七、遇到的问题及解决方案

### 问题 1：pnpm 版本不匹配

**现象**：`Install frontend dependencies` 步骤报错退出

**原因**：
- 本地使用 pnpm 10，生成的 `pnpm-lock.yaml` 版本为 `lockfileVersion: '9.0'`
- Workflow 中配置了 `version: 8`，pnpm 8 无法解析 v9 格式的 lockfile
- `--frozen-lockfile` 模式下版本不兼容直接报错

**解决**：将 workflow 中的 pnpm 版本改为 10

```yaml
# 修改前
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 8    # ❌ 与本地不一致

# 修改后
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10   # ✅ 与本地一致
```

**教训**：CI 环境的工具版本必须和本地开发环境保持一致，特别是包管理器。

### 问题 2：服务器 git pull 失败

**现象**：之前尝试在服务器上直接 `git pull` 更新代码，但由于服务器访问 GitHub 不稳定（使用了 gitclone.com 镜像代理且同步不及时），导致拉取超时。

**解决**：放弃 `git pull` 方案，改用 `rsync` 从 CI 虚拟机直接传输构建产物和代码到服务器。GitHub Actions 的虚拟机在海外，访问 GitHub 无延迟。

### 问题 3：找不到 Secrets 配置页面

**现象**：在 GitHub 个人设置（Profile Settings）中找不到 Secrets and variables

**原因**：Secrets 是仓库级别的配置，不在个人设置中

**解决**：进入具体仓库页面 → Settings → Secrets and variables → Actions

## 八、面试常见问题

### Q1：你的项目是怎么部署的？

> 我搭建了基于 GitHub Actions 的 CI/CD 流水线。开发者 push 代码到 main 分支后，GitHub Actions 自动触发：先安装依赖和构建前端，然后通过 rsync + SSH 将产物同步到云服务器，远程执行 pm2 重启后端服务和 Nginx 重载。部署结果会通过 Server酱 API 推送到微信，实现全流程自动化。

### Q2：为什么选 GitHub Actions 而不是 Jenkins？

> 1. **零运维**：GitHub Actions 是 SaaS 服务，不需要自己搭建和维护 CI 服务器
> 2. **深度集成**：和 GitHub 仓库无缝集成，push 即触发，无需配置 Webhook
> 3. **免费额度**：公开仓库完全免费，私有仓库每月 2000 分钟免费额度
> 4. **丰富生态**：官方和社区提供了大量可复用的 Action

### Q3：rsync 和 scp 有什么区别？

> rsync 支持增量传输（只传变化的文件）、压缩传输、自动删除目标端多余文件，适合频繁部署。scp 每次都是全量传输，适合简单的一次性文件拷贝。在 CI/CD 场景中 rsync 更高效。

### Q4：`--frozen-lockfile` 有什么作用？

> 它让包管理器严格按照 lockfile 安装依赖，禁止任何修改。这保证 CI 环境安装的依赖版本和开发者本地完全一致，避免「本地没问题但线上挂了」的情况。如果 lockfile 和 package.json 不同步，会直接报错而不是静默修改。

### Q5：如何保证部署过程中的安全性？

> 1. **SSH 密钥**：使用专用的 ED25519 密钥对，私钥存在 GitHub Secrets（加密存储），不在代码中出现
> 2. **Secrets 脱敏**：GitHub Actions 日志自动替换 Secrets 值为 `***`
> 3. **最小权限**：`.env` 等敏感文件通过 rsync `--exclude` 排除，不会被覆盖
> 4. **隔离环境**：每次 CI 运行都是全新的虚拟机，运行结束即销毁

### Q6：如果部署失败了怎么排查？

> 1. 微信会收到失败通知，附带 GitHub Actions 链接
> 2. 点击链接查看具体哪个 Step 失败
> 3. 展开失败步骤查看完整日志
> 4. 常见原因：依赖安装失败（版本不匹配）、构建错误（代码有 bug）、SSH 连接失败（密钥问题）、服务器磁盘满

### Q7：如何实现微信通知？

> 使用 Server酱（ServerChan）服务。它提供一个 HTTP API，CI 流程结束后调用 `curl POST` 发送消息（支持 Markdown 格式），Server酱将消息转发到绑定的微信服务号。只需要一个 SendKey 即可，非常轻量。workflow 中通过 `if: success()` 和 `if: failure()` 条件判断发送不同内容的通知。

### Q8：如何实现零停机部署？

> 当前方案在部署过程中会有短暂的不可用窗口（pm2 restart 期间）。如果需要零停机，可以：
> 1. **pm2 reload**：替代 restart，使用 cluster 模式实现优雅重启
> 2. **蓝绿部署**：准备两套环境，部署到备用环境后切换 Nginx upstream
> 3. **滚动更新**：使用 Docker + K8s，逐步替换旧容器

## 九、扩展方向

| 方向 | 说明 |
|------|------|
| **多环境部署** | 添加 staging 分支，push 到 staging 部署到测试环境 |
| **PR 预览** | Pull Request 时自动部署预览版本 |
| **Docker 化** | 将前后端打包为 Docker 镜像，使用 docker-compose 部署 |
| **回滚机制** | 保留历史构建产物，一键回滚到上一个版本 |
| **性能监控** | 部署后自动运行 Lighthouse 检测，推送性能报告 |
| **代码质量** | 部署前运行 ESLint + 单元测试，不通过则阻止部署 |
