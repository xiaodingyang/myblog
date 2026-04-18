import React, { Component, ReactNode } from 'react';
import { Button, Typography, Card } from 'antd';
import { CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { BORDER_RADIUS } from '@/styles/designTokens';

const { Title, Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  /** 错误时的回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 自定义 fallback 组件 */
  fallback?: ReactNode;
  /** 是否显示错误详情（仅开发环境建议开启） */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * React 错误边界组件
 * 捕获子组件的 JavaScript 错误，显示优雅的错误提示而非崩溃白屏
 *
 * 注意：只能捕获子组件渲染过程中的错误，不能捕获：
 * - 事件处理器内的错误
 * - 异步代码的错误
 * - 服务端渲染错误
 * - 错误边界自身抛出的错误
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示错误 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误日志
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // 可选：上报到错误追踪服务
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV !== 'production' } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <Card
            className="max-w-lg w-full text-center shadow-lg"
            style={{ borderRadius: BORDER_RADIUS.CARD_LARGE }}
          >
            <div className="flex flex-col items-center gap-4">
              <CloseCircleOutlined className="text-5xl text-red-400" />

              <Title level={4} className="!mb-0 text-gray-700">
                页面出现了一些问题
              </Title>

              <Text type="secondary" className="text-sm">
                别担心，这可能是临时问题。试试刷新页面或返回首页。
              </Text>

              <div className="flex gap-3 mt-2">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReload}
                >
                  刷新页面
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={this.handleGoHome}
                >
                  返回首页
                </Button>
              </div>

              {showDetails && error && (
                <div className="w-full mt-4 p-4 bg-gray-50 rounded-card-sm text-left">
                  <Text strong className="text-xs text-gray-500 block mb-1">
                    错误信息：
                  </Text>
                  <Paragraph
                    className="!mb-0 !text-xs !font-mono text-red-600 whitespace-pre-wrap break-all"
                    style={{ maxHeight: 120, overflow: 'auto' }}
                  >
                    {error.toString()}
                  </Paragraph>

                  {errorInfo && (
                    <>
                      <Text strong className="text-xs text-gray-500 block mt-2 mb-1">
                        组件堆栈：
                      </Text>
                      <Paragraph
                        className="!mb-0 !text-xs !font-mono text-gray-600 whitespace-pre-wrap"
                        style={{ maxHeight: 120, overflow: 'auto' }}
                      >
                        {errorInfo.componentStack}
                      </Paragraph>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
