import { message, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

// 全局初始化状态
export async function getInitialState(): Promise<{
    currentUser?: API.User;
    token?: string;
}> {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const currentUser = JSON.parse(userStr);
            return { currentUser, token };
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    return {};
}

// 请求配置
export const request = {
    timeout: 10000,
    errorConfig: {
        errorHandler: (error: any) => {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    message.error('登录已过期，请重新登录');
                    window.location.href = '/admin/login';
                    return;
                }
                message.error(data?.message || `请求错误: ${status}`);
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
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
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
            const saved = localStorage.getItem('color-theme-id') || 'pink';
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
    );
}
