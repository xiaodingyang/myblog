/**
 * 动效偏好检测
 * 尊重用户的 prefers-reduced-motion 设置
 */

let _cached: boolean | undefined;

export const prefersReducedMotion = (): boolean => {
  if (_cached !== undefined) return _cached;
  if (typeof window === 'undefined') return false;
  _cached = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return _cached;
};

/** 是否为触摸设备（无 hover 能力） */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none)').matches;
};

/** 是否为移动端视口 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    _cached = e.matches;
  });
}
