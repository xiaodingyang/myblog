import React, { createContext, useContext } from 'react';

// ================================================
// React 19 新增：use() Hook 读取 Context
// ================================================
// React 19 允许使用 use() 来读取 Context，这比 useContext() 更灵活
// use() 可以在条件语句、循环中使用，而 useContext() 必须在外层调用

export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
}

export const defaultTheme: Theme = {
  primaryColor: '#1677ff',
  backgroundColor: '#ffffff',
  textColor: 'rgba(0, 0, 0, 0.88)',
  borderRadius: 6,
};

export const DarkTheme: Theme = {
  primaryColor: '#1668dc',
  backgroundColor: '#141414',
  textColor: 'rgba(255, 255, 255, 0.88)',
  borderRadius: 6,
};

// 创建 Context
const ThemeContext = createContext<Theme>(defaultTheme);

// Provider 组件
export function ThemeProvider({ 
  children, 
  theme = defaultTheme 
}: { 
  children: React.ReactNode;
  theme?: Theme;
}) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// ================================================
// React 19: use() 读取 Context（替代 useContext）
// ================================================
// 重要：use() 可以在条件语句中使用，但仍然不能在渲染期间多次调用
// 这是一个简化的使用方式
export function useTheme(): Theme {
  // React 19 支持 use(context) 语法读取 Context
  // 注意：在当前 React 19 版本中，use(Context) 仍然需要 Provider 存在
  // 这种模式对于需要动态切换 Context 的场景很有用
  return useContext(ThemeContext);
}

// 为了兼容，我们保留 useContext 作为备选
export { useContext as useThemeContext };
