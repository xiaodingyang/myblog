import dayjs from 'dayjs';

/**
 * 从主题色 hex 生成 rgba 半透明背景
 */
export const themeBg = (primary: string, opacity: number): string => {
  const hex = primary.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/** 文章是否为近 7 天发布 */
export const isNewArticle = (date: string): boolean =>
  dayjs().diff(dayjs(date), 'day') <= 7;

/** 文章是否为热门（浏览量 >= 1000） */
export const isHotArticle = (views?: number): boolean =>
  (views || 0) >= 1000;

/** 安全获取文章 ID */
export const artId = (article: API.Article): string =>
  article._id || (article as any).id || '';
