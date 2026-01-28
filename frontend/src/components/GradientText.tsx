import React from 'react';

interface GradientTextProps {
  text: string;
  gradientId: string;
  from: string;
  mid: string;
  to: string;
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  gradientId,
  from,
  mid,
  to,
  className,
}) => {
  return (
    <span className={className} style={{ display: 'inline-block', lineHeight: 1 }}>
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="xMinYMid meet"
        style={{
          height: '1em',
          width: 'auto',
          verticalAlign: 'middle',
          display: 'block',
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="50%" stopColor={mid} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="22"
          fill={`url(#${gradientId})`}
          fontSize="20"
          fontWeight={700}
        >
          {text}
        </text>
      </svg>
    </span>
  );
};

export default GradientText;

