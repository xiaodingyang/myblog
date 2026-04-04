import React, { useState, useEffect, useCallback } from 'react';
import { Modal, List, Typography, Tag, Space } from 'antd';
import { KeyOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ShortcutItem {
  /** 快捷键描述 */
  description: string;
  /** 按键组合 */
  keys: string[];
  /** 是否仅在文章页生效 */
  articleOnly?: boolean;
}

/**
 * 博客键盘快捷键列表
 */
const shortcuts: ShortcutItem[] = [
  { description: '回到页面顶部', keys: ['Ctrl', 'Home'] },
  { description: '打开搜索（首页）', keys: ['/'] },
  { description: '返回上一页', keys: ['Alt', '←'] },
  { description: '前进下一页', keys: ['Alt', '→'] },
  { description: '收藏当前文章（文章页）', keys: ['Ctrl', 'D'], articleOnly: true },
  { description: '复制文章链接（文章页）', keys: ['Ctrl', 'Shift', 'C'], articleOnly: true },
];

interface KeyboardShortcutsHelpProps {
  /** 是否显示帮助按钮 */
  showHelpButton?: boolean;
  /** 帮助按钮位置 */
  position?: { top?: number; right?: number };
}

/**
 * 键盘快捷键帮助组件
 * - 自动监听键盘快捷键
 * - 提供可关闭的帮助弹窗
 */
const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  showHelpButton = true,
  position = { top: 120, right: 24 },
}) => {
  const [visible, setVisible] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // 检测是否为 Mac
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // 监听快捷键打开帮助弹窗
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Shift + / 打开帮助
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setVisible(true);
      }
      // Escape 关闭弹窗
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [visible]);

  // 全局快捷键处理
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + Home: 回到顶部
      if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const renderKeys = useCallback(
    (keys: string[]) => {
      return keys.map((key, index) => {
        // Mac 上显示 ⌘ 代替 Ctrl
        let displayKey = key;
        if (key === 'Ctrl' && isMac) displayKey = '⌘';
        if (key === 'Shift' && isMac) displayKey = '⇧';
        if (key === 'Alt' && isMac) displayKey = '⌥';
        if (key === 'Home') displayKey = '↖';

        return (
          <React.Fragment key={key}>
            <kbd
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                fontSize: 12,
                fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                backgroundColor: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                margin: '0 2px',
              }}
            >
              {displayKey}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-gray-400 mx-1">+</span>
            )}
          </React.Fragment>
        );
      });
    },
    [isMac]
  );

  return (
    <>
      {showHelpButton && (
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="fixed z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
          style={{
            top: position.top,
            right: position.right,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
          aria-label="键盘快捷键帮助"
          title="键盘快捷键 (Shift+?)"
        >
          <QuestionCircleOutlined className="text-lg text-gray-600" />
        </button>
      )}

      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>键盘快捷键</span>
          </Space>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={480}
        centered
      >
        <List
          dataSource={shortcuts}
          renderItem={(item) => (
            <List.Item
              style={{ padding: '12px 0' }}
              extra={
                item.articleOnly && (
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    仅文章页
                  </Tag>
                )
              }
            >
              <List.Item.Meta
                title={
                  <Text className="text-gray-700">{item.description}</Text>
                }
                description={
                  <span className="mt-1 flex items-center gap-1">
                    {renderKeys(item.keys)}
                  </span>
                }
              />
            </List.Item>
          )}
        />

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Text type="secondary" className="text-xs">
            提示：在输入框中这些快捷键不会生效，以免干扰正常输入。
          </Text>
        </div>
      </Modal>
    </>
  );
};

export default KeyboardShortcutsHelp;
