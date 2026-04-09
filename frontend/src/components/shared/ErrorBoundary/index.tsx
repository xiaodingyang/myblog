import React, { Component } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ errorInfo: info.componentStack || '' });
    // 上报 Sentry
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 24,
          background: '#f5f5f5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '48px 40px',
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
            <h2 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: 20 }}>
              页面加载出错了
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>
              可能是网络波动导致资源加载失败，请尝试刷新页面
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 32px',
                fontSize: 15,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              刷新页面
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: 24, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>
                  错误详情（仅开发环境可见）
                </summary>
                <pre style={{
                  background: '#f8fafc',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#ef4444',
                  overflow: 'auto',
                  maxHeight: 200,
                  marginTop: 8,
                }}>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
