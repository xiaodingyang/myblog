import { message, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { history } from 'umi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { getRouterPathname } from '@/utils/runtimePath';
import analytics from '@/utils/analytics';

// Sentry 初始化（仅生产环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://your-sentry-dsn@sentry.io/your-project-id', // TODO: 替换为实际的 Sentry DSN
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.1, // 采样 10% 的页面加载
    replaysSessionSampleRate: 0.05, // 采样 5% 的 session 录制
    replaysOnErrorSampleRate: 1.0, // 有错误时 100% 录制 replay
  });
}

dayjs.locale('zh-cn');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 分钟内不重新请求
      retry: 1,                       // 失败重试 1 次
      refetchOnWindowFocus: false,    // 切换窗口不自动刷新
    },
  },
});

// 初始化访客统计埋点 SDK
if (typeof window !== 'undefined') {
    analytics.init();
}

// 全局初始化状态
export async function getInitialState(): Promise<{
    currentUser?: API.User;
    token?: string;
}> {
    // SSR 保护：Node.js 环境没有 localStorage
    if (typeof window === 'undefined') return {};

    const token = localStorage.getItem('token');

    if (token) {
        try {
            const res = await fetch('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.code === 0 && json.data) {
                localStorage.setItem('user', JSON.stringify(json.data));
                return { currentUser: json.data, token };
            }
        } catch {
            // 网络失败时回退到本地缓存
        }

        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return { currentUser: JSON.parse(userStr), token };
            } catch {
                // ignore
            }
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return {};
}



// 防止 401 重复弹窗
let _isRedirectingToLogin = false;

// 请求配置
export const request = {
    timeout: 10000,
    errorConfig: {
        errorHandler: (error: any) => {
            if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                    const p = getRouterPathname();
                    if (
                        p.startsWith('/admin') &&
                        !p.includes('/admin/login') &&
                        !_isRedirectingToLogin
                    ) {
                        _isRedirectingToLogin = true;
                        message.warning('请先登录');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setTimeout(() => {
                            history.push('/admin/login');
                            _isRedirectingToLogin = false;
                        }, 300);
                    }
                    return;
                }

                const errorMessage = (data?.message && data.message.trim()) || `请求错误: ${status}`;
                message.error(errorMessage);
            } else if (error.request) {
                message.error('网络错误，请检查网络连接');
            } else {
                message.error('请求配置错误');
            }
            throw error;
        },
    },
    requestInterceptors: [
        (config: any) => {
            // SSR 保护：构建时将相对路径转为绝对 URL
            if (typeof window === 'undefined') {
                const apiBase = process.env.SSR_API_BASE || 'http://localhost:3000';
                if (config.url && !config.url.startsWith('http')) {
                    config.url = `${apiBase}${config.url}`;
                }
                return config;
            }
            const adminToken = localStorage.getItem('token');
            const ghToken = localStorage.getItem('github_token');
            const isAdmin = getRouterPathname().startsWith('/admin');
            const bearer = isAdmin ? adminToken : ghToken || adminToken;
            if (bearer) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${bearer}`,
                };
            }
            return config;
        },
    ],
    responseInterceptors: [
        (response: any) => {
            return response;
        },
    ],
};

// 根组件配置
export function rootContainer(container: React.ReactNode) {
    // 从 localStorage 读取默认主题色（不使用 useModel，因为此时 model 系统还未初始化）
    const getDefaultColor = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('color-theme-id') || 'mint';
            const colorThemes = {
                pink: '#ffb3d9',
                rose: '#f43f5e',
                lavender: '#a78bfa',
                ocean: '#3b82f6',
                mint: '#10b981',
                amber: '#f59e0b',
                coral: '#ff6b6b',
                violet: '#8b5cf6',
                cyan: '#06b6d4',
                peach: '#fb7185',
            };
            return colorThemes[saved as keyof typeof colorThemes] || '#ffb3d9';
        }
        return '#ffb3d9';
    };

    return (
        <ErrorBoundary>
            <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider
                    locale={zhCN}
                    theme={{
                        token: {
                            colorPrimary: getDefaultColor(),
                            borderRadius: 8,
                            colorBgContainer: '#ffffff',
                        },
                        components: {
                            Button: {
                                borderRadius: 8,
                            },
                            Card: {
                                borderRadiusLG: 12,
                            },
                            Input: {
                                borderRadius: 8,
                            },
                        },
                    }}
                >
                    {container}
                </ConfigProvider>
            </QueryClientProvider>
            </HelmetProvider>
        </ErrorBoundary>
    );
}
