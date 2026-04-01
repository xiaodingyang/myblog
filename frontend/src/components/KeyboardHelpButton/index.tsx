import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { KeyboardOutlined } from '@ant-design/icons';
import KeyboardShortcutsHelpModal from '@/components/KeyboardShortcutsHelpModal';

const KeyboardHelpButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Tooltip title="键盘快捷键 (?)" placement="left">
        <Button
          type="default"
          shape="circle"
          icon={<KeyboardOutlined />}
          size="large"
          onClick={() => setVisible(true)}
          className="fixed bottom-6 right-6 z-50 shadow-lg"
          style={{
            width: 48,
            height: 48,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e0e0e0',
          }}
        />
      </Tooltip>
      <KeyboardShortcutsHelpModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
};

export default KeyboardHelpButton;
