import { message, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { history } from 'umi';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { getRouterPathname } from '@/utils/runtimePath';
import analytics from '@/utils/analytics';

dayjs.locale('zh-cn');

// 初始化访客统计埋点 SDK
if (typeof window !== 'undefined') {
    analytics.init();
}

// 全局初始化状态
export async function getInitialState(): Promise<{
    currentUser?: API.User;
    token?: string;
}> {
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
            const adminToken = localStorage.getItem('token');
            const ghToken = localStorage.getItem('github_token');
            const isAdmin =
                typeof window !== 'undefined' && getRouterPathname().startsWith('/admin');
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
        </ErrorBoundary>
    );
}
