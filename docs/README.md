# 📚 文档索引

本目录包含博客项目的所有技术文档，已按类别分文件夹组织。

---

## 📂 目录结构

```
docs/
├── README.md                    # 本文件（文档索引）
├── deployment/                  # 🚀 部署运维类
├── feature-design/              # 🎨 功能设计类
├── technical/                   # 🔧 技术实现类
├── architecture/                # 🏗️ 架构设计类
└── tests/                       # 🧪 测试相关
```

---

## 📂 文档分类

### 🚀 [deployment/](./deployment/) - 部署运维类

**用途**: 服务器部署、Nginx 配置、CI/CD 自动化

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [nginx-scalable-config.conf](./deployment/nginx-scalable-config.conf) | 优化后的 Nginx 配置模板 | ⭐⭐ |
| [CI-CD自动化部署总结.md](./deployment/CI-CD自动化部署总结.md) | GitHub Actions 自动化部署 | ⭐ |

---

### 🎨 [feature-design/](./feature-design/) - 功能设计类

**用途**: 产品需求、UI 设计、功能规划

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [PRJ-博客需求总览.md](./feature-design/PRJ-博客需求总览.md) | 项目整体需求概览 | ⭐⭐⭐ |
| [PRJ-优化计划与功能需求.md](./feature-design/PRJ-优化计划与功能需求.md) | 功能优化计划与技术债务 | ⭐⭐ |
| [计数功能PRD.md](./feature-design/计数功能PRD.md) | 计数功能产品需求文档 | ⭐⭐ |
| [计数功能UI设计规格.md](./feature-design/计数功能UI设计规格.md) | 计数功能 UI 设计规范 | ⭐ |
| [计数功能UI设计审查报告.md](./feature-design/计数功能UI设计审查报告.md) | 计数功能 UI 审查结果 | ⭐ |
| [访客统计优化方案.md](./feature-design/访客统计优化方案.md) | 访客统计功能优化 | ⭐ |
| [站内AI答疑助手-设计方案.md](./feature-design/站内AI答疑助手-设计方案.md) | 基于站内语料的 RAG 答疑：架构、分阶段、接口与安全 | ⭐⭐ |

---

### 🔧 [technical/](./technical/) - 技术实现类

**用途**: 具体功能实现、性能优化、技术总结

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [GitHub-OAuth登录与评论系统实战总结.md](./technical/GitHub-OAuth登录与评论系统实战总结.md) | GitHub OAuth 登录与评论系统实现 | ⭐⭐⭐ |
| [首屏性能优化总结.md](./technical/首屏性能优化总结.md) | 首屏加载性能优化（代码分割、缓存） | ⭐⭐⭐ |
| [SEO优化实战总结.md](./technical/SEO优化实战总结.md) | 百度 SEO 优化（SSR/SSG、sitemap） | ⭐⭐ |
| [前端性能与工程化优化实战总结.md](./technical/前端性能与工程化优化实战总结.md) | 前端性能与工程化优化 | ⭐⭐ |
| [前端埋点SDK实现原理.md](./technical/前端埋点SDK实现原理.md) | 埋点 SDK 设计与实现 | ⭐ |

---

### 🏗️ [architecture/](./architecture/) - 架构设计类

**用途**: 系统架构、技术选型、模块设计

| 文档 | 说明 | 重要性 |
|------|------|--------|
| [架构优化方案.md](./architecture/架构优化方案.md) | 系统架构优化与技术栈升级 | ⭐⭐⭐ |

---

### 🧪 [tests/](./tests/) - 测试相关

**用途**: 测试用例、测试报告、测试脚本

---

## 🎯 快速导航

### 我是新开发者，想了解项目
1. 先读 → [feature-design/PRJ-博客需求总览.md](./feature-design/PRJ-博客需求总览.md) - 了解项目需求
2. 再读 → [architecture/架构优化方案.md](./architecture/架构优化方案.md) - 了解技术架构

### 我要部署服务
1. 参考 → [deployment/nginx-scalable-config.conf](./deployment/nginx-scalable-config.conf) - Nginx 配置模板
2. 参考 → [deployment/CI-CD自动化部署总结.md](./deployment/CI-CD自动化部署总结.md) - CI/CD 配置

### 我要优化 Nginx 配置
1. 参考 → [deployment/nginx-scalable-config.conf](./deployment/nginx-scalable-config.conf) - 配置模板

### 我要做性能优化
1. 前端性能 → [technical/首屏性能优化总结.md](./technical/首屏性能优化总结.md)
2. 工程化 → [technical/前端性能与工程化优化实战总结.md](./technical/前端性能与工程化优化实战总结.md)
3. SEO → [technical/SEO优化实战总结.md](./technical/SEO优化实战总结.md)

### 我要实现新功能
1. 参考 → [feature-design/计数功能PRD.md](./feature-design/计数功能PRD.md) - PRD 模板
2. 参考 → [feature-design/计数功能UI设计规格.md](./feature-design/计数功能UI设计规格.md) - UI 设计模板
3. 参考 → [technical/GitHub-OAuth登录与评论系统实战总结.md](./technical/GitHub-OAuth登录与评论系统实战总结.md) - 实现案例

---

## 📊 文档统计

| 类别 | 文档数量 | 总大小 |
|------|---------|--------|
| 部署运维类 | 2 | ~20 KB |
| 功能设计类 | 6 | ~110 KB |
| 技术实现类 | 5 | ~90 KB |
| 架构设计类 | 1 | ~25 KB |
| 测试相关 | 1 目录 | - |
| **总计** | **15** | **~245 KB** |

---

## 🔄 文档更新记录

### 2026-04-19
- ✅ 清理所有 Vercel 相关文档和引用
- ✅ 删除过时的部署文档

### 2026-04-13
- ✅ 新增 `nginx-scalable-config.conf` - 优化配置模板
- ✅ 新增 `README.md` - 文档索引（本文件）

### 2026-04-09
- ✅ 更新 `架构优化方案.md`

### 2026-04-07
- ✅ 新增 `计数功能PRD.md`
- ✅ 新增 `计数功能UI设计规格.md`
- ✅ 新增 `计数功能UI设计审查报告.md`
- ✅ 新增 `访客统计优化方案.md`

### 2026-04-06
- ✅ 新增 `前端埋点SDK实现原理.md`

### 2026-04-05
- ✅ 新增 `PRJ-博客需求总览.md`
- ✅ 新增 `PRJ-优化计划与功能需求.md`

### 2026-03-29
- ✅ 新增 `CI-CD自动化部署总结.md`
- ✅ 新增 `GitHub-OAuth登录与评论系统实战总结.md`
- ✅ 新增 `SEO优化实战总结.md`
- ✅ 新增 `前端性能与工程化优化实战总结.md`
- ✅ 新增 `首屏性能优化总结.md`

---

## 📝 文档规范

### 命名规范
- **部署运维类**: `deployment-*`, `nginx-*`, `*-guide.md`
- **功能设计类**: `PRJ-*`, `*功能PRD.md`, `*UI设计*.md`
- **技术实现类**: `*实战总结.md`, `*实现原理.md`, `*优化方案.md`
- **架构设计类**: `架构*.md`

### 文档结构
1. 标题和简介
2. 目录（可选）
3. 正文内容
4. 相关文档链接
5. 更新记录

### Markdown 格式
- 使用标准 Markdown 语法
- 代码块指定语言（```javascript, ```bash 等）
- 使用表格展示对比数据
- 使用 emoji 增强可读性（适度）

---

## 🤝 贡献指南

### 新增文档
1. 按照分类放入对应目录
2. 遵循命名规范
3. 更新本 README.md 索引
4. 更新文档更新记录

### 更新文档
1. 在文档末尾添加更新记录
2. 更新本 README.md 的更新记录部分

---

## 📞 联系方式

如有文档相关问题，请：
1. 查看相关文档的"常见问题"部分
2. 查看服务器日志（Nginx、PM2）
3. 参考其他相关文档

---

*最后更新: 2026-04-13*
*维护者: 请在更新文档后同步更新本索引*
