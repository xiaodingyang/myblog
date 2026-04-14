# 性能优化基线测试报告

## 测试信息

- **测试时间**: 2026-04-12 00:49
- **测试环境**: 生产环境 (https://xiaodingyang.art)
- **代码版本**: commit `9c3db14` (优化前)
- **测试工具**: Lighthouse (Chrome)

## 回滚确认

已成功回滚到优化前的代码状态：
- **当前 commit**: `9c3db14` - feat: 新增
- **回滚的优化提交**:
  - `e96a505` - 首页移除 framer-motion，改用 CSS 动画
  - `cd4c3d1` - 生产环境关闭 sourcemap
  - `3abc2c5` - 优化首屏加载性能
  - `e0051f7` - 添加性能优化测试结果
  - `a0105c3` - 添加任务完成报告

## 基线性能数据

### Desktop (桌面端)

| 指标 | 数值 | 评分 |
|------|------|------|
| **Performance Score** | **63/100** | 🟠 |
| First Contentful Paint (FCP) | 2.2s | 🟠 |
| Largest Contentful Paint (LCP) | 2.8s | 🟠 |
| Total Blocking Time (TBT) | 170ms | 🟢 |
| Cumulative Layout Shift (CLS) | 0.01 | 🟢 |
| Speed Index | 6.7s | 🔴 |

### Mobile (移动端)

| 指标 | 数值 | 评分 |
|------|------|------|
| **Performance Score** | **33/100** | 🔴 |
| First Contentful Paint (FCP) | 9.1s | 🔴 |
| Largest Contentful Paint (LCP) | 11.1s | 🔴 |
| Total Blocking Time (TBT) | 1,040ms | 🔴 |
| Cumulative Layout Shift (CLS) | 0.008 | 🟢 |
| Speed Index | 17.6s | 🔴 |

## 性能问题分析

### 主要问题

1. **移动端性能极差** (33分)
   - FCP 9.1s - 首屏内容渲染过慢
   - LCP 11.1s - 最大内容渲染严重超标 (标准 < 2.5s)
   - TBT 1,040ms - 主线程阻塞时间过长
   - Speed Index 17.6s - 视觉完成速度极慢

2. **桌面端性能不佳** (63分)
   - Speed Index 6.7s - 视觉完成速度慢
   - LCP 2.8s - 略超标准 (标准 < 2.5s)
   - FCP 2.2s - 首屏渲染偏慢

3. **布局稳定性良好**
   - Desktop CLS: 0.01
   - Mobile CLS: 0.008
   - 均符合标准 (< 0.1)

## 优化目标

基于基线数据，优化目标应为：

### Desktop 目标
- Performance Score: 63 → **90+**
- FCP: 2.2s → **< 1.0s**
- LCP: 2.8s → **< 2.0s**
- Speed Index: 6.7s → **< 3.0s**

### Mobile 目标
- Performance Score: 33 → **80+**
- FCP: 9.1s → **< 2.5s**
- LCP: 11.1s → **< 2.5s**
- TBT: 1,040ms → **< 300ms**
- Speed Index: 17.6s → **< 5.0s**

## 报告文件

- Desktop 报告: `baseline-desktop.report.html` / `baseline-desktop.report.json`
- Mobile 报告: `baseline-mobile.report.html` / `baseline-mobile.report.json`

---

**下一步**: 重新应用优化代码，进行对比测试
