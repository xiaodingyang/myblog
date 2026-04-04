import React, { useState } from 'react';
import { Tabs, Input, Button, message, ColorPicker, Space, Typography } from 'antd';
import type { Color } from 'antd/es/color-picker';

const { TextArea } = Input;
const { Text } = Typography;

const JsonTab: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
    } catch (e: any) {
      message.error(`格式化失败: ${e.message}`);
    }
  };

  return (
    <div className="space-y-3">
      <TextArea rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="粘贴 JSON..." />
      <Button type="primary" onClick={format}>格式化</Button>
      <TextArea rows={8} value={output} readOnly />
    </div>
  );
};

const Base64Tab: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  return (
    <div className="space-y-3">
      <TextArea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入文本..." />
      <Space>
        <Button type="primary" onClick={() => setOutput(btoa(unescape(encodeURIComponent(input))))}>编码</Button>
        <Button onClick={() => { try { setOutput(decodeURIComponent(escape(atob(input)))); } catch { message.error('解码失败'); } }}>解码</Button>
      </Space>
      <TextArea rows={4} value={output} readOnly />
    </div>
  );
};

const TimestampTab: React.FC = () => {
  const [ts, setTs] = useState('');
  const [result, setResult] = useState('');

  const convert = () => {
    const num = Number(ts);
    if (isNaN(num)) { message.error('请输入有效数字'); return; }
    const ms = num > 1e12 ? num : num * 1000;
    setResult(new Date(ms).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  };

  return (
    <div className="space-y-3">
      <Input placeholder="输入时间戳（秒或毫秒）" value={ts} onChange={(e) => setTs(e.target.value)} />
      <Button type="primary" onClick={convert}>转换</Button>
      {result && <Text>结果：{result}</Text>}
    </div>
  );
};

const ColorTab: React.FC = () => {
  const [color, setColor] = useState<Color | string>('#1677ff');

  const c = typeof color === 'string' ? null : color;
  const hex = c ? c.toHexString() : String(color);

  return (
    <div className="space-y-3">
      <ColorPicker value={color} onChange={setColor} />
      {c && (
        <div className="space-y-1">
          <Text>HEX: {c.toHexString()}</Text><br />
          <Text>RGB: {c.toRgbString()}</Text><br />
          <Text>HSL: {c.toHslString()}</Text>
        </div>
      )}
    </div>
  );
};

const ToolsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-4">开发者工具箱</h1>
    <Tabs items={[
      { key: 'json', label: 'JSON 格式化', children: <JsonTab /> },
      { key: 'base64', label: 'Base64 编解码', children: <Base64Tab /> },
      { key: 'timestamp', label: '时间戳转换', children: <TimestampTab /> },
      { key: 'color', label: '颜色选择器', children: <ColorTab /> },
    ]} />
  </div>
);

export default ToolsPage;
