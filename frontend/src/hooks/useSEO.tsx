import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

/** 生产环境 canonical 与分享链接用（与 nginx 主域名一致） */
export const SITE_ORIGIN = 'https://www.xiaodingyang.art';

const SITE_NAME = '若风的博客';
const DEFAULT_DESCRIPTION =
  '若风的个人技术博客，专注前端开发，分享 React、TypeScript、Node.js 等技术文章与实践经验。';
const DEFAULT_KEYWORDS = '若风,前端开发,React,TypeScript,Node.js,技术博客,JavaScript,Vue';

const MAX_DESC_LENGTH = 160;

interface SEOOptions {
  title?: string;
  /** 用于 og:title / twitter:title，不传则使用「页面标题 - 站点名」 */
  shareTitle?: string;
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

/**
 * SSR 兼容的 SEO hook，基于 react-helmet-async。
 *
 * **重要**：返回值必须渲染在组件 JSX 中，例如：
 * ```tsx
 * const seo = useSEO({ title: 'xxx' });
 * return <>{seo}<div>...</div></>;
 * ```
 */
export default function useSEO(options: SEOOptions = {}) {
  const {
    title,
    shareTitle,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    ogImage,
    ogUrl,
    ogType = 'website',
    omitOgImage = false,
    jsonLd,
  } = options;

  return useMemo(() => {
    const desc = truncateMetaDescription(description);
    const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - 前端技术分享`;
    const ogTwitterTitle = (shareTitle || fullTitle).trim();
    const pageUrl = absolutizeUrl(ogUrl) || SITE_ORIGIN;

    const absoluteImage = absolutizeUrl(ogImage);
    const ogImageFinal = absoluteImage || (!omitOgImage ? `${SITE_ORIGIN}/favicon.png` : undefined);

    const enrichedJsonLd =
      jsonLd && jsonLd.image && typeof jsonLd.image === 'string'
        ? { ...jsonLd, image: absolutizeUrl(jsonLd.image) }
        : jsonLd;

    return (
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={desc} />
        <meta name="keywords" content={keywords} />

        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={ogTwitterTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="zh_CN" />
        {ogImageFinal && <meta property="og:image" content={ogImageFinal} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content={ogImageFinal ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={ogTwitterTitle} />
        <meta name="twitter:description" content={desc} />
        {ogImageFinal && <meta name="twitter:image" content={ogImageFinal} />}

        {/* JSON-LD */}
        {enrichedJsonLd && (
          <script type="application/ld+json">{JSON.stringify(enrichedJsonLd)}</script>
        )}
      </Helmet>
    );
  }, [title, shareTitle, description, keywords, ogImage, ogUrl, ogType, omitOgImage, jsonLd]);
}

export { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS };
