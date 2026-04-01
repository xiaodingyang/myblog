/** 按每分钟约 200 字（中英混排近似）估算阅读分钟数 */
export function estimateReadingMinutes(markdown: string): number {
  if (!markdown?.trim()) return 1;
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/[#>*_\-~`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const count = plain.length;
  return Math.max(1, Math.ceil(count / 200));
}
