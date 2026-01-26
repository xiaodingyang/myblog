# MongoDB 安装指南

## macOS 安装方法

### 方法一：使用 Homebrew（推荐）

#### 1. 安装 Homebrew（如果还没有）
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. 添加 MongoDB 仓库
```bash
brew tap mongodb/brew
```

#### 3. 安装 MongoDB
```bash
brew install mongodb-community
```

#### 4. 启动 MongoDB 服务

**方式 A：作为后台服务启动（推荐）**
```bash
brew services start mongodb-community
```

**方式 B：手动启动**
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

#### 5. 验证安装
```bash
# 检查 MongoDB 是否运行
brew services list

# 或者连接 MongoDB shell
mongosh
```

### 方法二：使用官方安装包

1. 访问 MongoDB 官网：https://www.mongodb.com/try/download/community
2. 选择 macOS 版本（推荐选择 .tgz 格式）
3. 下载并解压
4. 将 MongoDB 添加到 PATH：
   ```bash
   export PATH=<mongodb安装目录>/bin:$PATH
   ```
5. 创建数据目录：
   ```bash
   mkdir -p /data/db
   sudo chown -R $(whoami) /data/db
   ```
6. 启动 MongoDB：
   ```bash
   mongod
   ```

### 方法三：使用 Docker

如果已安装 Docker，可以使用以下命令：

```bash
# 运行 MongoDB 容器
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# 查看运行状态
docker ps

# 停止容器
docker stop mongodb

# 启动容器
docker start mongodb
```

## 验证安装

### 1. 检查 MongoDB 是否运行
```bash
# Homebrew 方式
brew services list

# 或检查端口
lsof -i :27017
```

### 2. 连接 MongoDB Shell
```bash
mongosh
```

在 MongoDB Shell 中运行：
```javascript
// 显示当前数据库
db

// 显示所有数据库
show dbs

// 退出
exit
```

### 3. 测试项目连接

进入后端目录并启动项目：
```bash
cd backend
npm run dev
```

如果看到 "✅ MongoDB Connected" 消息，说明连接成功！

## 常用命令

### 启动/停止 MongoDB 服务（Homebrew）
```bash
# 启动
brew services start mongodb-community

# 停止
brew services stop mongodb-community

# 重启
brew services restart mongodb-community

# 查看状态
brew services list
```

### MongoDB Shell 常用命令
```javascript
// 切换数据库
use blog

// 查看集合
show collections

// 查看文档
db.articles.find()

// 清空集合
db.articles.deleteMany({})
```

## 故障排除

### 问题 1：端口 27017 已被占用
```bash
# 查找占用端口的进程
lsof -i :27017

# 杀死进程（替换 PID 为实际进程号）
kill -9 <PID>
```

### 问题 2：权限错误
```bash
# 确保数据目录有写权限
sudo chown -R $(whoami) /data/db
# 或对于 Homebrew 安装
sudo chown -R $(whoami) /opt/homebrew/var/mongodb
```

### 问题 3：无法连接
- 检查 MongoDB 是否正在运行
- 检查防火墙设置
- 确认连接字符串正确：`mongodb://localhost:27017/blog`

## 项目配置

项目已配置 MongoDB 连接，默认连接地址为：
- 本地：`mongodb://localhost:27017/blog`

如需修改，可在后端目录创建 `.env` 文件：
```env
MONGODB_URI=mongodb://localhost:27017/blog
```

## 下一步

安装完成后：
1. 启动 MongoDB 服务
2. 进入 `backend` 目录
3. 运行 `npm run dev` 或 `pnpm dev`
4. 查看控制台确认 MongoDB 连接成功
