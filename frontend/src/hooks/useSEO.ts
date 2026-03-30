import { useEffect } from 'react';

/** 生产环境canonical与分享链接用（与 nginx 主域名一致） */
export const SITE_ORIGIN = 'https://www.xiaodingyang.art';

const SITE_NAME = '若风的博客';
const DEFAULT_DESCRIPTION =
  '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。';
const DEFAULT_KEYWORDS = '若风,前端开发,React,TypeScript,Node.js,技术博客,JavaScript,Vue';

const MAX_DESC_LENGTH = 160;

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  /** 设为 true 时不强制默认图（用于极简洁页）；默认会为分享补一张图 */
  omitOgImage?: boolean;
  /** JSON-LD structured data object */
  jsonLd?: Record<string, any>;
}

function truncateMetaDescription(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= MAX_DESC_LENGTH) return t;
  return `${t.slice(0, MAX_DESC_LENGTH - 1)}…`;
}

/** 站点内相对路径转为绝对 URL，供 og:image / JSON-LD 使用 */
export function absolutizeUrl(url: string | undefined, origin: string = SITE_ORIGIN): string | undefined {
  if (!url) return undefined;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${origin.replace(/\/$/, '')}${path}`;
}

function setMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaByProperty(property: string) {
  document.querySelectorAll(`meta[property="${property}"]`).forEach((n) => n.remove());
}

function removeMetaByName(name: string) {
  document.querySelectorAll(`meta[name="${name}"]`).forEach((n) => n.remove());
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data: Record<string, any>) {
  let el = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-seo-jsonld', 'true');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove());
}

/**
 * 设置标题、描述、Open Graph、Twitter Card、canonical 与可选 JSON-LD。
 * 注：爬虫若执行 JS（如 Googlebot），可看到更新后的 head；「查看网页源代码」仍为构建壳模板属 SPA 常态。
 */
export default function useSEO(options: SEOOptions = {}) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    ogImage,
    ogUrl,
    ogType = 'website',
    omitOgImage = false,
    jsonLd,
  } = options;

  useEffect(() => {
    const desc = truncateMetaDescription(description);
    const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - 前端技术分享`;
    document.title = fullTitle;

    setMetaByName('description', desc);
    setMetaByName('keywords', keywords);

    const pageUrl =
      absolutizeUrl(ogUrl) ||
      (typeof window !== 'undefined' ? window.location.href.split('#')[0] : SITE_ORIGIN);

    setCanonical(pageUrl);

    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', desc);
    setMetaByProperty('og:type', ogType);
    setMetaByProperty('og:url', pageUrl);
    setMetaByProperty('og:site_name', SITE_NAME);
    setMetaByProperty('og:locale', 'zh_CN');

    const absoluteImage = absolutizeUrl(ogImage);
    if (absoluteImage) {
      setMetaByProperty('og:image', absoluteImage);
    } else if (!omitOgImage) {
      setMetaByProperty('og:image', `${SITE_ORIGIN}/favicon.png`);
    } else {
      removeMetaByProperty('og:image');
    }

    setMetaByName('twitter:card', absoluteImage || !omitOgImage ? 'summary_large_image' : 'summary');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', desc);
    if (absoluteImage || !omitOgImage) {
      setMetaByName('twitter:image', absoluteImage || `${SITE_ORIGIN}/favicon.png`);
    } else {
      removeMetaByName('twitter:image');
    }

    if (jsonLd) {
      const enriched =
        jsonLd.image && typeof jsonLd.image === 'string'
          ? { ...jsonLd, image: absolutizeUrl(jsonLd.image) }
          : jsonLd;
      setJsonLd(enriched);
    }

    return () => {
      removeJsonLd();
    };
  }, [title, description, keywords, ogImage, ogUrl, ogType, omitOgImage, jsonLd]);
}

export { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS };
