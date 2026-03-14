# 个人博客百度 SEO 优化实战总结

## 项目背景

- **技术栈**：Umi (React SPA) + Express (Node.js) + MongoDB
- **域名**：www.xiaodingyang.art
- **服务器**：腾讯云（OpenCloudOS 9.4），Nginx 反向代理
- **核心挑战**：SPA 单页应用对搜索引擎不友好，百度爬虫无法像传统多页应用那样直接抓取每个页面的内容

---

## 一、SEO 优化方案设计

### 1.1 SPA 的 SEO 困境

SPA 应用的 HTML 只有一个空壳 `<div id="root"></div>`，所有内容由 JavaScript 动态渲染。搜索引擎爬虫（尤其是百度）对 JS 渲染的支持有限，导致：

- 所有页面共享同一个 `<title>` 和 `<meta description>`
- 爬虫抓取到的是空白页面，无法识别内容
- 没有 sitemap，搜索引擎不知道网站有哪些页面

### 1.2 优化策略（不改架构的轻量方案）

| 优化项 | 目的 | 实现方式 |
|--------|------|----------|
| 动态 Title/Meta | 每个页面有独立的标题和描述 | 自定义 `useSEO` Hook |
| robots.txt | 告诉爬虫哪些路径可以抓取 | 静态文件放在 `public/` |
| sitemap.xml | 让搜索引擎发现所有页面 URL | 后端 API 动态生成 |
| 百度自动推送 | 用户每访问一个页面自动通知百度 | 注入 JS 脚本 |
| JSON-LD 结构化数据 | 帮助搜索引擎理解文章内容 | 文章详情页注入 |
| Open Graph 标签 | 社交媒体分享时展示标题和描述 | `useSEO` Hook 统一管理 |
| HTTPS | 百度对 HTTPS 站点有排名加权 | Let's Encrypt 免费证书 |

---

## 二、具体实现

### 2.1 useSEO Hook — 动态 SEO 标签

**问题**：Umi SPA 所有页面共用一个 `<title>`，百度无法区分不同页面。

**解决**：创建 `useSEO` Hook，每个页面调用时动态修改 `document.title` 和 `<meta>` 标签。

```typescript
// frontend/src/hooks/useSEO.ts
interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  jsonLd?: Record<string, any>;  // JSON-LD 结构化数据
}

export default function useSEO(options: SEOOptions = {}) {
  useEffect(() => {
    // 动态设置 document.title
    document.title = title ? `${title} - ${SITE_NAME}` : SITE_NAME;

    // 动态创建/更新 meta 标签
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('og:title', fullTitle);
    setMeta('og:description', description);

    // 注入 JSON-LD 结构化数据
    if (jsonLd) setJsonLd(jsonLd);

    // 组件卸载时清理 JSON-LD
    return () => removeJsonLd();
  }, [title, description, keywords, ...]);
}
```

**页面调用示例**：

```typescript
// 首页
useSEO({
  title: '首页',
  description: '若风的个人技术博客...',
  keywords: '若风,前端博客,React,TypeScript',
});

// 文章详情页（动态数据）
useSEO({
  title: article?.title,
  description: article?.summary,
  keywords: article?.tags?.map(t => t.name).join(','),
  ogType: 'article',
  jsonLd: {  // BlogPosting 结构化数据
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    datePublished: article.createdAt,
    author: { '@type': 'Person', name: '若风' },
  },
});
```

**核心技巧**：
- `setMeta` 函数先查找已有的 meta 标签，没有则创建，避免重复
- `og:` 开头的标签用 `property` 属性，其他用 `name` 属性
- JSON-LD 用 `data-seo-jsonld` 属性标记，方便组件卸载时精确清理

### 2.2 全局 Meta 标签和百度推送脚本

在 Umi 配置文件 `.umirc.ts` 中注入：

```typescript
// frontend/.umirc.ts
export default defineConfig({
  title: '若风的博客 - 前端技术分享',
  metas: [
    { name: 'baidu-site-verification', content: 'codeva-T2MxTzyMwa' },
    { name: 'description', content: '若风的个人技术博客...' },
    { name: 'keywords', content: '若风,前端开发,React,...' },
    { name: 'author', content: '若风' },
    { property: 'og:site_name', content: '若风的博客' },
    { property: 'og:locale', content: 'zh_CN' },
    { name: 'renderer', content: 'webkit' },           // 告诉双核浏览器用 webkit 渲染
    { name: 'applicable-device', content: 'pc,mobile' }, // 告诉百度适配 PC 和移动端
  ],
  headScripts: [
    // 百度自动推送脚本
    `(function(){
      var bp = document.createElement('script');
      var curProtocol = window.location.protocol.split(':')[0];
      if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
      } else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
      }
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(bp, s);
    })();`,
  ],
});
```

**百度自动推送原理详解**：

百度提供了三种将网页 URL 提交给搜索引擎的方式：

| 方式 | 触发时机 | 特点 |
|------|----------|------|
| sitemap | 百度定期抓取 | 被动等待，收录慢 |
| 手动提交 | 你手动在站长后台提交 URL | 人工操作，URL 数量有限 |
| **自动推送** | 用户每次访问页面时 | 实时、自动、零维护 |

自动推送的工作流程：

```
用户访问你的博客页面
        ↓
浏览器加载页面 HTML
        ↓
执行 <head> 中注入的推送脚本
        ↓
脚本从百度 CDN 加载 push.js
        ↓
push.js 自动获取当前页面 URL（document.URL）
        ↓
向百度服务器发送请求：
  POST https://zz.bdstatic.com/linksubmit/push.js
  数据：当前页面的 URL
        ↓
百度收到 URL，加入待收录队列
```

代码逐行解析：

```javascript
(function(){
  // 1. 创建一个 <script> 标签
  var bp = document.createElement('script');

  // 2. 根据当前页面协议选择对应的推送脚本地址
  var curProtocol = window.location.protocol.split(':')[0];
  if (curProtocol === 'https') {
    bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
  } else {
    bp.src = 'http://push.zhanzhang.baidu.com/push.js';
  }

  // 3. 将 <script> 插入到页面第一个 <script> 标签之前
  //    这样它会尽早加载执行
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(bp, s);
})();
// 整个代码用 IIFE（立即执行函数）包裹，避免污染全局变量
```

**为什么放在 `.umirc.ts` 的 `headScripts` 里？**

Umi 的 `headScripts` 配置会在构建时将脚本注入到 HTML 的 `<head>` 中。这意味着：
- 用户访问任何页面都会执行这段脚本（因为 SPA 所有页面共用同一个 HTML）
- 它在页面加载的最早期就运行，不需要等 React 渲染完成
- 与 React 组件生命周期无关，是纯原生 JS

**效果**：你的博客每天有人访问 N 个页面，百度就会收到 N 次 URL 推送。访问量越大，百度发现新页面越快，收录速度也越快。

### 2.3 Sitemap.xml 动态生成

**问题**：静态 sitemap 无法反映实时的文章更新。

**解决**：后端 API 动态查询数据库，生成包含所有已发布文章、分类、标签的 XML sitemap。

```javascript
// backend/src/routes/sitemap.js
router.get('/', async (req, res) => {
  const articles = await Article.find({ status: 'published' })
    .select('_id updatedAt').sort({ updatedAt: -1 }).lean();
  const categories = await Category.find().select('_id').lean();
  const tags = await Tag.find().select('_id').lean();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 静态页面
  xml += `<url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>`;

  // 动态文章页面
  for (const article of articles) {
    xml += `<url>
      <loc>${SITE_URL}/article/${article._id}</loc>
      <lastmod>${article.updatedAt.toISOString().split('T')[0]}</lastmod>
      <priority>0.8</priority>
    </url>`;
  }

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});
```

**注册路由**：在 `backend/src/index.js` 中挂载到 `/sitemap.xml` 路径。

### 2.4 robots.txt

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://www.xiaodingyang.art/sitemap.xml
```

- `Disallow: /admin` — 阻止搜索引擎抓取后台管理页面
- `Sitemap` — 主动告知搜索引擎 sitemap 的位置

### 2.5 JSON-LD 结构化数据

在文章详情页注入 `BlogPosting` 类型的 JSON-LD，帮助搜索引擎理解文章内容：

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "文章标题",
  "description": "文章摘要",
  "image": "封面图 URL",
  "datePublished": "2026-03-14",
  "dateModified": "2026-03-14",
  "author": { "@type": "Person", "name": "若风" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "页面 URL" }
}
```

**面试高频问题**：JSON-LD 与 Microdata 的区别？
- JSON-LD：通过 `<script type="application/ld+json">` 注入，与 HTML 解耦，维护方便
- Microdata：通过 HTML 属性（`itemscope`、`itemprop`）标注，与 HTML 耦合
- Google 推荐使用 JSON-LD

---

## 三、Nginx 配置

```nginx
server {
    listen 80;
    server_name xiaodingyang.art www.xiaodingyang.art;

    root /var/www/myblog/frontend/dist;
    index index.html;

    # Gzip 压缩（减小传输体积，提升加载速度，间接影响 SEO）
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml;

    # 静态资源长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sitemap 代理（后端动态生成）
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:3000;
    }

    # SPA 路由 fallback — 关键！
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**`try_files` 的作用**（面试常考）：
1. `$uri` — 先尝试匹配真实文件（如 robots.txt、JS/CSS 文件）
2. `$uri/` — 尝试匹配目录
3. `/index.html` — 都找不到则返回 index.html，由前端路由处理

这就是 SPA 在 Nginx 下能正常工作的关键。没有这个配置，刷新 `/articles` 页面会返回 404。

---

## 四、HTTP 转 HTTPS

### 4.1 为什么要 HTTPS？

- **SEO 加权**：百度和 Google 都对 HTTPS 站点有排名加权
- **安全性**：防止中间人攻击、数据篡改、运营商劫持（注入广告）
- **浏览器信任**：Chrome 等浏览器会对 HTTP 站点标记"不安全"
- **现代 API 依赖**：Service Worker、Geolocation 等 API 要求 HTTPS

### 4.2 Let's Encrypt 免费证书

[Let's Encrypt](https://letsencrypt.org/) 是一个免费、自动化的证书颁发机构（CA），通过 Certbot 工具可以一键申请和部署。

```bash
# 1. 安装 Certbot 和 Nginx 插件
dnf install -y certbot python3-certbot-nginx

# 2. 申请证书并自动配置 Nginx
certbot --nginx -d xiaodingyang.art -d www.xiaodingyang.art \
  --non-interactive --agree-tos --email your@email.com --redirect
```

参数说明：
- `--nginx`：自动检测并修改 Nginx 配置
- `-d`：指定域名，可以多个
- `--redirect`：自动添加 HTTP 301 跳转到 HTTPS
- `--non-interactive`：非交互模式，适合脚本执行

### 4.3 Certbot 对 Nginx 的修改

运行 Certbot 前后，Nginx 配置的变化：

**之前**（只有 HTTP）：
```nginx
server {
    listen 80;
    server_name xiaodingyang.art www.xiaodingyang.art;
    root /var/www/myblog/frontend/dist;
    # ...其他配置...
}
```

**之后**（Certbot 自动修改）：
```nginx
# HTTPS 服务（新增）
server {
    listen 443 ssl;
    server_name xiaodingyang.art www.xiaodingyang.art;
    root /var/www/myblog/frontend/dist;

    # Certbot 自动添加的 SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/xiaodingyang.art/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xiaodingyang.art/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ...原有的 location 配置不变...
}

# HTTP → HTTPS 301 跳转（Certbot 自动改写原 server 块）
server {
    listen 80;
    server_name xiaodingyang.art www.xiaodingyang.art;

    if ($host = www.xiaodingyang.art) {
        return 301 https://$host$request_uri;
    }
    if ($host = xiaodingyang.art) {
        return 301 https://$host$request_uri;
    }
    return 404;
}
```

**核心变化**：
1. 新增 443 端口监听，配置 SSL 证书
2. 原来的 80 端口不再返回内容，而是 **301 永久重定向**到 HTTPS
3. 301 而不是 302 的原因：告诉搜索引擎"这个跳转是永久的，请直接收录 HTTPS 版本"

### 4.4 证书自动续期

Let's Encrypt 证书有效期为 **90 天**，需要定期续期：

```bash
# 开启自动续期定时任务
systemctl start certbot-renew.timer
systemctl enable certbot-renew.timer

# 手动测试续期（不会真的续期，只是模拟）
certbot renew --dry-run
```

Certbot 的 timer 会每天检查两次，证书到期前 30 天自动续期。

### 4.5 验证 HTTPS 生效

```bash
# 检查 HTTPS 是否正常
curl -s -o /dev/null -w "%{http_code}" https://www.xiaodingyang.art/
# 应返回 200

# 检查 HTTP 是否 301 跳转到 HTTPS
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://www.xiaodingyang.art/
# 应返回 301 -> https://www.xiaodingyang.art/

# 检查证书信息
echo | openssl s_client -connect www.xiaodingyang.art:443 2>/dev/null | openssl x509 -noout -dates
# 显示证书有效期
```

### 4.6 注意事项

- **混合内容问题**：HTTPS 页面中引用 HTTP 资源（图片、JS）会被浏览器阻止，需确保所有资源都用 HTTPS 或协议相对路径（`//`）
- **百度站长平台**：HTTP 和 HTTPS 被视为两个不同站点，需要分别添加验证
- **sitemap 和 robots.txt 中的 URL** 也需要更新为 `https://`

---

## 五、百度站长平台配置

### 5.1 站点验证

百度提供两种验证方式：

| 方式 | 做法 | 优缺点 |
|------|------|--------|
| 文件验证 | 放一个 `.html` 文件到网站根目录 | 简单，但需要百度能访问到文件 |
| HTML标签验证 | 在 `<head>` 中加 `<meta name="baidu-site-verification">` | 不依赖文件访问，更稳定 |

我们两种都做了，最终用 HTML 标签验证通过。

### 5.2 提交 Sitemap

验证通过后，在「普通收录」→「sitemap」中提交 sitemap 地址，百度会定期抓取。

### 5.3 抓取诊断

百度提供「抓取诊断」工具，可以模拟百度爬虫抓取你的页面，查看抓取结果是否正确。

---

## 六、遇到的问题和解决方案

### 问题 1：百度站点验证失败 — "无法连接到您网站的服务器"

**现象**：文件验证和 HTML 标签验证都报同样的错误。

**排查过程**：
1. 从外网 curl 网站正常返回 200 → 排除网站本身的问题
2. 检查 Nginx 错误日志，发现百度 IP `220.196.160.73` 确实到达了服务器
3. 但后续请求来自不同的 IP（`220.196.160.83`、`220.196.160.144` 等）

**根本原因**：服务器防火墙（iptables + ipset）的 `YJ-GLOBAL-INBLOCK` 黑名单中包含了多个百度爬虫 IP，导致百度部分请求被 DROP。

**解决**：
```bash
# 查找被屏蔽的百度 IP
ipset list YJ-GLOBAL-INBLOCK | grep "220.196"

# 逐个移除
ipset del YJ-GLOBAL-INBLOCK 220.196.160.83
ipset del YJ-GLOBAL-INBLOCK 220.196.160.144
ipset del YJ-GLOBAL-INBLOCK 220.196.160.151
ipset del YJ-GLOBAL-INBLOCK 220.196.160.45
```

**经验**：云服务器的自动安全防护（如腾讯云的云镜）可能会误封爬虫 IP。做 SEO 时要注意检查防火墙规则。

### 问题 2：Nginx 内部重定向死循环

**现象**：Nginx error log 出现 `rewrite or internal redirection cycle while internally redirecting to "/index.html"`

**根本原因**：前端构建（`pnpm build`）过程中，`dist/` 目录被清空重建，恰好百度爬虫在此期间访问，`index.html` 不存在导致 `try_files` 循环重定向。

**经验**：生产环境部署时应使用蓝绿部署或先构建到临时目录再原子替换，避免构建期间的服务中断。

### 问题 3：Git 仓库无法从国内服务器拉取

**现象**：服务器上 `git pull` 超时。

**根本原因**：服务器全局 git 配置了 `url.https://gitclone.com/github.com/.insteadof=https://github.com/`，使用 gitclone.com 镜像加速，但镜像同步有延迟，导致最新提交拉不到。

**解决**：改用 SCP 直接传文件到服务器，绕过 git。

```bash
scp frontend/.umirc.ts root@162.14.83.58:/var/www/myblog/frontend/.umirc.ts
```

### 问题 4：百度抓取诊断显示 "DNS 无法解析 IP"

**现象**：在百度站长后台「抓取诊断」中，HTTP 版本的站点显示 DNS 解析失败。

**解决**：切换到 HTTPS 站点进行抓取诊断，HTTP 版本会 301 跳转到 HTTPS，百度可能对跳转前的 HTTP 版本有缓存问题。在 HTTPS 站点下重新抓取，状态变为「抓取成功（有跳转）」。

---

## 七、SEO 优化效果验证清单

```bash
# 1. 检查页面 meta 标签
curl -s https://www.xiaodingyang.art/ | grep -oE '<title>[^<]+</title>|<meta[^>]*description[^>]*>'

# 2. 检查 sitemap
curl -s https://www.xiaodingyang.art/sitemap.xml | head -20

# 3. 检查 robots.txt
curl -s https://www.xiaodingyang.art/robots.txt

# 4. 检查 HTTPS 跳转
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}" http://www.xiaodingyang.art/

# 5. 检查百度收录情况（需等待 1-4 周）
# 在百度搜索：site:www.xiaodingyang.art
```

---

## 八、面试高频问题

### Q1: SPA 如何做 SEO？

**轻量方案**（本项目采用）：
- 动态修改 `document.title` 和 `<meta>` 标签
- 后端生成 sitemap.xml
- 注入 JSON-LD 结构化数据
- 百度主动推送脚本

**重量方案**（适合大型项目）：
- SSR（服务端渲染）：Next.js / Nuxt.js
- SSG（静态站点生成）：预渲染每个页面为 HTML
- Prerender.io：检测到爬虫时返回预渲染的 HTML

### Q2: robots.txt 和 sitemap.xml 的关系？

- `robots.txt` 告诉爬虫**哪些路径可以/不可以抓取**
- `sitemap.xml` 告诉爬虫**网站有哪些页面**
- `robots.txt` 中声明 `Sitemap: URL` 让爬虫自动发现 sitemap
- 两者互补：robots.txt 是"门卫"，sitemap 是"导览图"

### Q3: 什么是 JSON-LD？为什么用它？

JSON-LD（JSON for Linking Data）是一种结构化数据格式，通过 `<script type="application/ld+json">` 嵌入 HTML。搜索引擎通过它理解页面内容的语义（如：这是一篇博客文章，作者是谁，发布时间是什么）。

优势：
- 与 HTML 完全解耦，不影响页面结构
- Google 官方推荐格式
- 可以触发搜索结果的富文本展示（Rich Snippets）

### Q4: 百度 SEO 和 Google SEO 的区别？

| 维度 | 百度 | Google |
|------|------|--------|
| JS 渲染支持 | 较弱，SPA 收录困难 | 较好，能执行 JS |
| 收录速度 | 慢（1-4 周） | 快（几天） |
| HTTPS | 有加权 | 强制要求 |
| 站长工具 | 百度搜索资源平台 | Google Search Console |
| 主动推送 | 支持自动推送脚本 | 无，靠 sitemap |
| 结构化数据 | 支持但效果有限 | 强力支持 Rich Snippets |

### Q5: Nginx 中 `try_files` 的作用？

`try_files $uri $uri/ /index.html` 是 SPA 部署的核心配置：
1. 先尝试匹配真实静态文件（JS/CSS/图片）
2. 再尝试匹配目录
3. 都找不到则返回 `index.html`，由前端路由（React Router）处理

没有它，用户直接访问 `/articles` 等前端路由会得到 404。

### Q6: 如何验证 SEO 是否生效？

1. `curl` 检查 HTML 源码中的 meta 标签
2. 浏览器「查看源代码」搜索 `description`、`ld+json`
3. 切换页面观察浏览器标签栏 title 变化
4. 百度站长后台「抓取诊断」模拟爬虫
5. 百度搜索 `site:域名` 查看收录情况
6. Google 的 [Rich Results Test](https://search.google.com/test/rich-results) 验证结构化数据

---

## 九、文件清单

| 文件 | 说明 | 新增/修改 |
|------|------|-----------|
| `frontend/src/hooks/useSEO.ts` | SEO Hook | 新增 |
| `frontend/.umirc.ts` | 全局 meta、百度推送脚本 | 修改 |
| `frontend/public/robots.txt` | 爬虫规则 | 新增 |
| `frontend/public/baidu_verify_*.html` | 百度验证文件 | 新增 |
| `backend/src/routes/sitemap.js` | Sitemap API | 新增 |
| `backend/src/index.js` | 注册 sitemap 路由 | 修改 |
| `nginx.conf` | Nginx 配置 | 新增 |
| `frontend/src/pages/*/index.tsx` | 9 个页面添加 useSEO | 修改 |
| `frontend/src/pages/articles/detail.tsx` | 文章页添加 JSON-LD | 修改 |
