/**
 * 访客统计埋点 SDK
 *
 * 三层去重机制：
 * 1. pathname 对比 — replaceState 只在路径真正变化时上报
 * 2. 5 分钟间隔 — 同一页面短时间内不重复计数
 * 3. 50ms 防抖 — 合并同一时刻的多次触发
 */

class Analytics {
  private sessionId: string;
  private lastPath: string = '';
  private lastVisitTime: number = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private originalPushState: typeof history.pushState;
  private originalReplaceState: typeof history.replaceState;

  private readonly VISIT_INTERVAL = 5 * 60 * 1000; // 5 分钟
  private readonly DEBOUNCE_MS = 50; // 50ms 防抖

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.originalPushState = history.pushState.bind(history);
    this.originalReplaceState = history.replaceState.bind(history);
  }

  /**
   * 获取或创建 sessionId（存于 localStorage）
   */
  private getOrCreateSessionId(): string {
    const key = 'visitor_session_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(key, id);
    }
    return id;
  }

  /**
   * 初始化 SDK：记录首次访问 + 监听路由变化
   */
  public init(): void {
    this.trackPageView();

    // popstate：浏览器前进/后退
    window.addEventListener('popstate', this.handleRouteChange);

    // pushState：代码跳转
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      this.originalPushState(...args);
      this.trackPageView();
    };

    // replaceState：仅 pathname 变化时上报
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      const prev = location.pathname;
      this.originalReplaceState(...args);
      if (location.pathname !== prev) {
        this.trackPageView();
      }
    };
  }

  private handleRouteChange = (): void => {
    this.trackPageView();
  };

  /**
   * 记录页面访问（第 3 层：50ms 防抖）
   */
  public trackPageView(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.doTrackPageView();
    }, this.DEBOUNCE_MS);
  }

  /**
   * 实际上报逻辑（第 2 层：5 分钟间隔去重）
   */
  private doTrackPageView(): void {
    const currentPath = location.pathname;
    const now = Date.now();

    if (currentPath === this.lastPath && now - this.lastVisitTime < this.VISIT_INTERVAL) {
      return;
    }

    this.lastPath = currentPath;
    this.lastVisitTime = now;

    this.sendData({
      path: currentPath,
      title: document.title,
      referer: document.referrer,
      sessionId: this.sessionId,
    });
  }

  /**
   * 使用 sendBeacon 发送数据（不阻塞页面，页面关闭也能发出）
   */
  private sendData(data: Record<string, unknown>): void {
    try {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      if (!navigator.sendBeacon('/api/stats/visit', blob)) {
        fetch('/api/stats/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // 静默失败
    }
  }

  /**
   * 清理所有监听器和劫持（组件卸载时调用）
   */
  public destroy(): void {
    window.removeEventListener('popstate', this.handleRouteChange);
    history.pushState = this.originalPushState;
    history.replaceState = this.originalReplaceState;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

const analytics = new Analytics();
export default analytics;
