import React, { useState } from 'react';
import { Tooltip } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import KeyboardShortcutsHelpModal from '@/components/KeyboardShortcutsHelpModal';
import {
  FAB_SIZE_PX,
  FAB_RIGHT_PX,
  FAB_KEYBOARD_BOTTOM_PX,
} from '@/components/floatingActionsConstants';

const KeyboardHelpButton: React.FC<{ embedded?: boolean }> = ({ embedded }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Tooltip title="键盘快捷键 (?)" placement="left">
        <button
          type="button"
          aria-label="键盘快捷键"
          onClick={() => setVisible(true)}
          className={`rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 ${embedded ? '' : 'fixed z-40'}`}
          style={{
            ...(embedded
              ? { position: 'relative' }
              : { right: FAB_RIGHT_PX, bottom: FAB_KEYBOARD_BOTTOM_PX }),
            width: FAB_SIZE_PX,
            height: FAB_SIZE_PX,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 0,
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e0e0e0',
            cursor: 'pointer',
          }}
        >
          <span className="inline-flex items-center justify-center" style={{ width: 22, height: 22 }}>
            <KeyOutlined style={{ fontSize: 20, lineHeight: 1 }} />
          </span>
        </button>
      </Tooltip>
      <KeyboardShortcutsHelpModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
};

export default KeyboardHelpButton;
