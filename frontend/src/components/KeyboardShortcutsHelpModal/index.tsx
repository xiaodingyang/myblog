import React from 'react';
import { Modal, Typography, Space, Divider } from 'antd';
import { KeyboardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface KeyboardShortcutsHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'j', description: '下一篇文章' },
  { key: 'k', description: '上一篇文章' },
  { key: 'g h', description: '跳转首页' },
  { key: '?', description: '显示/关闭此帮助面板' },
];

const KeyboardShortcutsHelpModal: React.FC<KeyboardShortcutsHelpModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={onClose}
      okText="关闭"
      cancelButtonProps={{ style: { display: 'none' } }}
      title={
        <Space>
          <KeyboardOutlined />
          <span>键盘快捷键</span>
        </Space>
      }
      centered
      width={400}
    >
      <div className="py-4">
        <Title level={5} className="!mt-0">导航快捷键</Title>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <Text>{s.description}</Text>
              <kbd
                className="px-3 py-1 rounded-lg text-sm font-mono"
                style={{
                  background: '#f0f0f0',
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 2px 0 #d9d9d9',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <Divider />
        <Text type="secondary" className="text-sm">
          按 <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#f0f0f0', border: '1px solid #d9d9d9' }}>?</kbd> 键可随时打开此面板
        </Text>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsHelpModal;
