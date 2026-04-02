export interface TocItem {
  level: 2 | 3;
  /** 展示用纯文本（已去掉 **、` ` 等内联 Markdown） */
  text: string;
  id: string;
}

function slugify(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'section';
}

/** 去掉标题行里的内联 Markdown / 链接，避免目录里出现 **xxx** */
export function stripHeadingInlineMarkdown(raw: string): string {
  let t = raw.trim();
  for (let i = 0; i < 6; i++) {
    const prev = t;
    t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
    t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    t = t.replace(/\*\*([\s\S]+?)\*\*/g, '$1');
    t = t.replace(/__([\s\S]+?)__/g, '$1');
    t = t.replace(/`([^`]+)`/g, '$1');
    if (t === prev) break;
  }
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/\*+/g, '').replace(/_{2,}/g, '');
  return t.trim();
}

/** 从 Markdown 源码提取 h2 / h3，生成与渲染时一致的 id（重复标题自动加后缀） */
export function extractTocFromMarkdown(md: string): TocItem[] {
  const lines = md.split(/\n/);
  const items: TocItem[] = [];
  const slugCounts = new Map<string, number>();

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    const raw = h2?.[1] ?? h3?.[1];
    if (!raw) continue;
    const level = h2 ? (2 as const) : (3 as const);
    const text = stripHeadingInlineMarkdown(raw);
    if (!text) continue;
    // id 仍基于原始标题行生成，避免已发布文章锚点与历史构建不一致
    let baseId = slugify(raw.trim());
    const n = (slugCounts.get(baseId) ?? 0) + 1;
    slugCounts.set(baseId, n);
    const id = n === 1 ? baseId : `${baseId}-${n}`;
    items.push({ level, text, id });
  }
  return items;
}
