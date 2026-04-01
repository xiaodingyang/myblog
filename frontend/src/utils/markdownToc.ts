export interface TocItem {
  level: 2 | 3;
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
    const text = raw.trim();
    let baseId = slugify(text);
    const n = (slugCounts.get(baseId) ?? 0) + 1;
    slugCounts.set(baseId, n);
    const id = n === 1 ? baseId : `${baseId}-${n}`;
    items.push({ level, text, id });
  }
  return items;
}
