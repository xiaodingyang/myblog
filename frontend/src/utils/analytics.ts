/**
 * 访客统计埋点 SDK
 * 功能：
 * 1. 自动记录页面访问（PV）
 * 2. 生成并管理 sessionId
 * 3. 调用后端 API 记录访问数据
 */

interface VisitData {
  path: string;
  title: string;
  referrer: string;
  sessionId: string;
  userAgent: string;
  timestamp: number;
}

class Analytics {
  private sessionId: string;
  private isInitialized: boolean = false;
  private apiEndpoint: string = '/api/visits';

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * 获取或创建 sessionId
   * sessionId 存储在 localStorage 中，用于标识唯一访客
   */
  private getOrCreateSessionId(): string {
    const storageKey = 'visitor_session_id';
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      // 生成新的 sessionId：时间戳 + 随机字符串
      sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  /**
   * 初始化埋点 SDK
   * 监听路由变化，自动记录页面访问
   */
  public init(): void {
    if (this.isInitialized) {
      console.warn('[Analytics] SDK 已经初始化');
      return;
    }

    this.isInitialized = true;

    // 记录首次页面访问
    this.trackPageView();

    // 监听路由变化（Umi 4 使用 history API）
    if (typeof window !== 'undefined') {
      // 监听 popstate 事件（浏览器前进/后退）
      window.addEventListener('popstate', () => {
        this.trackPageView();
      });

      // 监听 pushState 和 replaceState（需要重写原生方法）
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.trackPageView();
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.trackPageView();
      };

      console.log('[Analytics] SDK 初始化成功');
    }
  }

  /**
   * 记录页面访问
   */
  public trackPageView(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const visitData: VisitData = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    // 发送访问数据到后端
    this.sendVisitData(visitData);
  }

  /**
   * 发送访问数据到后端
   */
  private async sendVisitData(data: VisitData): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('[Analytics] 发送访问数据失败:', response.statusText);
      }
    } catch (error) {
      // 静默失败，不影响用户体验
      console.error('[Analytics] 发送访问数据异常:', error);
    }
  }

  /**
   * 手动记录自定义事件（扩展功能）
   */
  public trackEvent(eventName: string, eventData?: Record<string, any>): void {
    console.log('[Analytics] 自定义事件:', eventName, eventData);
    // 可以扩展为发送自定义事件到后端
  }

  /**
   * 获取当前 sessionId
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

// 导出单例实例
const analytics = new Analytics();

export default analytics;
