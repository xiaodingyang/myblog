/**
 * Canvas 趋势图组件
 *
 * P0+P1 完整实现：
 * - 坐标系 + Catmull-Rom 平滑曲线 + 渐变面积填充
 * - 三层发光描边（霓虹灯效果）
 * - 入场画线动画（easeOutCubic，1200ms）
 * - 数据点弹出动画（easeOutBack）
 * - Hover 涟漪扩散（600ms）
 * - 毛玻璃 Tooltip（边界碰撞检测）
 * - 主题色联动 + DPR 高清适配
 */

import { useEffect, useRef, useCallback } from 'react';
import { useModel } from 'umi';
import { getColorThemeById } from '@/config/colorThemes';

interface TrendChartProps {
  dates: string[];
  pv: number[];
  uv: number[];
  height?: number;
}

// ===== 工具函数 =====

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// Catmull-Rom → Bezier 曲线
function buildCurvePath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) { ctx.lineTo(pts[1].x, pts[1].y); return; }
  const T = 0.5;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) * T / 3, p1.y + (p2.y - p0.y) * T / 3,
      p2.x - (p3.x - p1.x) * T / 3, p2.y - (p3.y - p1.y) * T / 3,
      p2.x, p2.y,
    );
  }
}

// 近似曲线长度
function pathLength(pts: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

// 圆角矩形
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ===== 组件 =====

const TrendChart: React.FC<TrendChartProps> = ({ dates = [], pv = [], uv = [], height = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const state = useRef({
    animStart: 0,
    progress: 0,
    hoveredIdx: -1,
    mouseX: 0,
    mouseY: 0,
    ripples: [] as { x: number; y: number; t: number }[],
    visible: true,
    running: false,
  });

  const { themeId } = useModel('colorModel');
  const color = getColorThemeById(themeId)?.primary || '#10b981';

  // ===== 渲染帧 =====

  const frame = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    const box = containerRef.current;
    if (!canvas || !box) return;
    const S = state.current;
    const dpr = window.devicePixelRatio || 1;
    const W = box.clientWidth;
    const H = height;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    if (dates.length === 0) {
      S.running = false;
      return;
    }

    // 布局
    const PL = 50, PR = 20, PT = 20, PB = 30;
    const CW = W - PL - PR;
    const CH = H - PT - PB;
    const maxV = Math.max(...pv, ...uv, 1);
    const yMax = Math.ceil(maxV * 1.1 / 5) * 5;
    const xOf = (i: number) => PL + (i / (dates.length - 1 || 1)) * CW;
    const yOf = (v: number) => PT + CH - (v / yMax) * CH;

    // 动画进度
    if (!S.animStart) S.animStart = ts;
    S.progress = Math.min(1, (ts - S.animStart) / 1200);
    const prog = easeOutCubic(S.progress);

    // === 参考线 + Y轴 ===
    for (let i = 0; i <= 4; i++) {
      const y = PT + (CH / 4) * i;
      ctx.strokeStyle = 'rgba(148,163,184,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PL, y);
      ctx.lineTo(PL + CW, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui,sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round(yMax - (yMax / 4) * i)), PL - 8, y);
    }

    // === X轴 ===
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xstep = dates.length <= 7 ? 1 : Math.ceil(dates.length / 6);
    dates.forEach((d, i) => {
      if (i % xstep === 0 || i === dates.length - 1) ctx.fillText(d.slice(5), xOf(i), PT + CH + 8);
    });

    // === 绘制系列 ===
    const drawSeries = (data: number[], alpha: number) => {
      const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v) }));
      if (pts.length < 2) return;

      const total = pathLength(pts);
      const drawLen = total * prog;

      // 计算可见点
      let acc = 0;
      const vis = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        if (acc + seg <= drawLen) { vis.push(pts[i]); acc += seg; }
        else {
          const t = seg > 0 ? (drawLen - acc) / seg : 0;
          vis.push({ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t });
          break;
        }
      }
      if (vis.length < 2) return;

      // 面积填充
      ctx.beginPath();
      buildCurvePath(ctx, vis);
      ctx.lineTo(vis[vis.length - 1].x, PT + CH);
      ctx.lineTo(vis[0].x, PT + CH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PT, 0, PT + CH);
      grad.addColorStop(0, hexToRgba(color, 0.3 * alpha));
      grad.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = grad;
      ctx.fill();

      // 发光层 1：宽模糊
      ctx.save();
      ctx.beginPath();
      buildCurvePath(ctx, vis);
      ctx.strokeStyle = hexToRgba(color, alpha * 0.15);
      ctx.lineWidth = 6;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.restore();

      // 发光层 2：中模糊
      ctx.save();
      ctx.beginPath();
      buildCurvePath(ctx, vis);
      ctx.strokeStyle = hexToRgba(color, alpha * 0.4);
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // 发光层 3：核心线
      ctx.beginPath();
      buildCurvePath(ctx, vis);
      ctx.strokeStyle = hexToRgba(color, alpha);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // 数据点
      pts.forEach((p, i) => {
        let pl = 0;
        for (let j = 1; j <= i; j++) pl += Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y);
        if (pl > drawLen) return;
        // 弹出动画
        const ratio = total > 0 ? pl / total : 0;
        const pp = Math.max(0, Math.min(1, (prog - ratio * 0.7) / 0.3));
        if (pp <= 0) return;
        const sc = easeOutBack(pp);
        const hovered = S.hoveredIdx === i && alpha === 1;
        const r = (hovered ? 6 : 4) * sc;

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    drawSeries(uv, 0.5);
    drawSeries(pv, 1);

    // === 涟漪 ===
    S.ripples = S.ripples.filter(r => ts - r.t < 600);
    S.ripples.forEach(r => {
      const p = (ts - r.t) / 600;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 5 + p * 25, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba(color, 0.6 * (1 - p));
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // === 垂直参考线 ===
    if (S.hoveredIdx >= 0 && S.hoveredIdx < dates.length) {
      const hx = xOf(S.hoveredIdx);
      ctx.beginPath();
      ctx.moveTo(hx, PT);
      ctx.lineTo(hx, PT + CH);
      ctx.strokeStyle = hexToRgba(color, 0.2);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // === Tooltip ===
    if (S.hoveredIdx >= 0 && S.hoveredIdx < dates.length) {
      const i = S.hoveredIdx;
      const tw = 150;
      const th = 72;
      const pad = 10;
      let tx = S.mouseX + 12;
      let ty = S.mouseY - th - 12;
      if (tx + tw > W - pad) tx = S.mouseX - tw - 12;
      if (tx < pad) tx = pad;
      // 优先在指针上方；顶上不去则改到下方，再整体钳在画布内（避免被 canvas 底部裁切）
      if (ty < pad) ty = S.mouseY + 12;
      if (ty + th > H - pad) ty = H - th - pad;
      if (ty < pad) ty = pad;

      // 毛玻璃背景
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      roundRect(ctx, tx, ty, tw, th, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // 文字
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui,sans-serif';
      ctx.fillText(dates[i], tx + 12, ty + 10);
      ctx.fillStyle = '#1e293b';
      ctx.font = '500 14px system-ui,sans-serif';
      ctx.fillText(`PV  ${pv[i].toLocaleString()}`, tx + 12, ty + 28);
      ctx.fillStyle = hexToRgba(color, 0.7);
      ctx.fillText(`UV  ${uv[i].toLocaleString()}`, tx + 12, ty + 48);
    }

    // 是否需要继续动画
    const needAnim = S.progress < 1 || S.ripples.length > 0 || S.hoveredIdx >= 0;
    if (needAnim && S.visible) {
      rafRef.current = requestAnimationFrame(frame);
    } else {
      S.running = false;
    }
  }, [dates, pv, uv, color, height]);

  const kick = useCallback(() => {
    const S = state.current;
    if (!S.running && S.visible) {
      S.running = true;
      rafRef.current = requestAnimationFrame(frame);
    }
  }, [frame]);

  // 数据变化时重置动画
  useEffect(() => {
    state.current.animStart = 0;
    state.current.progress = 0;
    kick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [dates, pv, uv, color, kick]);

  // 鼠标事件
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const S = state.current;
      S.mouseX = x;
      S.mouseY = y;

      if (dates.length === 0) return;
      const PL = 50, PR = 20, PT = 20, PB = 30;
      const CW = rect.width - PL - PR;
      const CH = rect.height - PT - PB;
      const maxV = Math.max(...pv, ...uv, 1);
      const yMax = Math.ceil(maxV * 1.1 / 5) * 5;
      const xOf = (i: number) => PL + (i / (dates.length - 1 || 1)) * CW;
      const yOf = (v: number) => PT + CH - (v / yMax) * CH;

      let best = -1, bestD = 25;
      dates.forEach((_, i) => {
        const px = xOf(i);
        const d = Math.hypot(x - px, y - yOf(pv[i]));
        if (d < bestD) { bestD = d; best = i; }
      });

      const prev = S.hoveredIdx;
      S.hoveredIdx = best;
      if (best >= 0 && best !== prev) {
        S.ripples.push({ x: xOf(best), y: yOf(pv[best]), t: performance.now() });
      }
      kick();
    };

    const onLeave = () => { state.current.hoveredIdx = -1; kick(); };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [dates, pv, uv, kick]);

  // 页面可见性
  useEffect(() => {
    const handler = () => {
      state.current.visible = !document.hidden;
      if (!document.hidden) kick();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [kick]);

  // 容器尺寸变化
  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => kick());
    ro.observe(box);
    return () => ro.disconnect();
  }, [kick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'crosshair' }} />
    </div>
  );
};

export default TrendChart;
