import React, { useState, useEffect } from 'react';

const sizes = [
  { label: 'A-', value: 14 },
  { label: 'A', value: 16 },
  { label: 'A+', value: 20 },
] as const;

const STORAGE_KEY = 'article-font-size';
const DEFAULT_SIZE = 16;

const FontSizeAdjuster: React.FC = () => {
  const [current, setCurrent] = useState<number>(DEFAULT_SIZE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const size = saved ? Number(saved) : DEFAULT_SIZE;
    setCurrent(size);
    document.documentElement.style.setProperty('--article-font-size', `${size}px`);
  }, []);

  const handleChange = (size: number) => {
    setCurrent(size);
    document.documentElement.style.setProperty('--article-font-size', `${size}px`);
    localStorage.setItem(STORAGE_KEY, String(size));
  };

  return (
    <div className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 overflow-hidden">
      {sizes.map((s) => (
        <button
          key={s.value}
          onClick={() => handleChange(s.value)}
          className={`px-3 py-1 text-sm transition-colors ${
            current === s.value
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          style={{ fontSize: s.value > 16 ? 16 : s.value }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default FontSizeAdjuster;
