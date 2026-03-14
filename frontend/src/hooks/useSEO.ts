import { useEffect } from 'react';

const SITE_NAME = '若风的博客';
const DEFAULT_DESCRIPTION = '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。';
const DEFAULT_KEYWORDS = '若风,前端开发,React,TypeScript,Node.js,技术博客,JavaScript,Vue';

interface SEOOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
  /** JSON-LD structured data object */
  jsonLd?: Record<string, any>;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) ||
           document.querySelector(`meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:')) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
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
  const el = document.querySelector('script[data-seo-jsonld]');
  if (el) el.remove();
}

/**
 * Sets document title, meta description, keywords, Open Graph tags,
 * and optional JSON-LD structured data for the current page.
 */
export default function useSEO(options: SEOOptions = {}) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    ogImage,
    ogUrl,
    ogType = 'website',
    jsonLd,
  } = options;

  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMeta('description', description);
    setMeta('keywords', keywords);

    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:type', ogType);
    if (ogUrl) setMeta('og:url', ogUrl);
    if (ogImage) setMeta('og:image', ogImage);
    setMeta('og:site_name', SITE_NAME);

    if (jsonLd) {
      setJsonLd(jsonLd);
    }

    return () => {
      removeJsonLd();
    };
  }, [title, description, keywords, ogImage, ogUrl, ogType, jsonLd]);
}

export { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS };
