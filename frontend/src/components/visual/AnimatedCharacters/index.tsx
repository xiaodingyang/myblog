import { useState, useEffect, useRef, useMemo } from 'react';

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = '#1e293b',
  forceLookX,
  forceLookY,
}: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pos = useMemo(() => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const rect = pupilRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={pupilRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.08s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = '#1e293b',
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const pos = useMemo(() => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  }, [mouseX, mouseY, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={eyeRef}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: eyeColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
        transition: 'transform 0.1s ease-in-out',
      }}
    >
      {!isBlinking && (
        <div
          style={{
            width: pupilSize,
            height: pupilSize,
            borderRadius: '50%',
            background: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: 'transform 0.08s ease-out',
          }}
        />
      )}
    </div>
  );
};

interface AnimatedCharactersProps {
  isTyping?: boolean;
  isPassword?: boolean;
  primaryColor?: string;
}

export default function AnimatedCharacters({
  isTyping = false,
  isPassword = false,
  primaryColor = '#ec4899',
}: AnimatedCharactersProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [blink1, setBlink1] = useState(false);
  const [blink2, setBlink2] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const char1Ref = useRef<HTMLDivElement>(null);
  const char2Ref = useRef<HTMLDivElement>(null);
  const char3Ref = useRef<HTMLDivElement>(null);
  const char4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const schedule = (setter: (v: boolean) => void) => {
      const id = setTimeout(() => {
        setter(true);
        setTimeout(() => {
          setter(false);
          schedule(setter);
        }, 150);
      }, Math.random() * 4000 + 3000);
      return id;
    };
    const t1 = schedule(setBlink1);
    const t2 = schedule(setBlink2);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLooking(true);
      const t = setTimeout(() => setIsLooking(false), 800);
      return () => clearTimeout(t);
    }
    setIsLooking(false);
  }, [isTyping]);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const p1 = calcPos(char1Ref);
  const p2 = calcPos(char2Ref);
  const p3 = calcPos(char3Ref);
  const p4 = calcPos(char4Ref);

  return (
    <div
      style={{
        position: 'relative',
        width: 480,
        height: 370,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* 角色1: 主题色高个 (后排左) */}
      <div
        ref={char1Ref}
        style={{
          position: 'absolute',
          left: 20,
          bottom: 0,
          width: 112,
          height: 252,
          borderRadius: '34px 34px 22px 22px',
          background: primaryColor,
          zIndex: 1,
          overflow: 'hidden',
          transition: 'transform 0.3s ease-out',
          transform: isPassword
            ? 'skewX(0deg)'
            : isTyping
              ? `skewX(${(p1.bodySkew || 0) - 12}deg) translateX(56px)`
              : `skewX(${p1.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '0 6px 28px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            gap: 11,
            left: isLooking ? 30 : 20 + p1.faceX,
            top: isLooking ? 70 : 56 + p1.faceY,
            transition: 'all 0.2s ease-out',
          }}
        >
          <EyeBall
            size={30}
            pupilSize={14}
            maxDistance={8}
            isBlinking={blink1}
            forceLookX={isPassword ? -5 : isLooking ? 4 : undefined}
            forceLookY={isPassword ? -5 : isLooking ? 5 : undefined}
          />
          <EyeBall
            size={30}
            pupilSize={14}
            maxDistance={8}
            isBlinking={blink1}
            forceLookX={isPassword ? -5 : isLooking ? 4 : undefined}
            forceLookY={isPassword ? -5 : isLooking ? 5 : undefined}
          />
        </div>
      </div>

      {/* 角色2: 深色高个 (中间) */}
      <div
        ref={char2Ref}
        style={{
          position: 'absolute',
          left: 125,
          bottom: 0,
          width: 100,
          height: 280,
          borderRadius: '28px 28px 20px 20px',
          background: '#1e293b',
          zIndex: 2,
          transition: 'transform 0.3s ease-out',
          transform: isPassword
            ? 'skewX(0deg)'
            : isLooking
              ? `skewX(${(p2.bodySkew || 0) * 1.5 + 10}deg) translateX(28px)`
              : isTyping
                ? `skewX(${(p2.bodySkew || 0) * 1.5}deg)`
                : `skewX(${p2.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '0 6px 28px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            gap: 8,
            left: isPassword ? 14 : isLooking ? 45 : 36 + p2.faceX,
            top: isPassword ? 39 : isLooking ? 17 : 45 + p2.faceY,
            transition: 'all 0.2s ease-out',
          }}
        >
          <EyeBall
            size={28}
            pupilSize={12}
            maxDistance={8}
            isBlinking={blink2}
            forceLookX={isPassword ? -5 : isLooking ? 0 : undefined}
            forceLookY={isPassword ? -5 : isLooking ? -5 : undefined}
          />
          <EyeBall
            size={28}
            pupilSize={12}
            maxDistance={8}
            isBlinking={blink2}
            forceLookX={isPassword ? -5 : isLooking ? 0 : undefined}
            forceLookY={isPassword ? -5 : isLooking ? -5 : undefined}
          />
        </div>
      </div>

      {/* 角色3: 半圆 (前排左) */}
      <div
        ref={char3Ref}
        style={{
          position: 'absolute',
          left: 210,
          bottom: 0,
          width: 140,
          height: 112,
          borderRadius: '84px 84px 0 0',
          background: '#fb923c',
          zIndex: 3,
          transition: 'transform 0.3s ease-out',
          transform: isPassword ? 'skewX(0deg)' : `skewX(${p3.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '0 6px 28px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            gap: 20,
            left: isPassword ? 35 : 42 + (p3.faceX || 0),
            top: isPassword ? 28 : 34 + (p3.faceY || 0),
            transition: 'all 0.2s ease-out',
          }}
        >
          <Pupil
            size={14}
            maxDistance={7}
            pupilColor="#1e293b"
            forceLookX={isPassword ? -6 : undefined}
            forceLookY={isPassword ? -5 : undefined}
          />
          <Pupil
            size={14}
            maxDistance={7}
            pupilColor="#1e293b"
            forceLookX={isPassword ? -6 : undefined}
            forceLookY={isPassword ? -5 : undefined}
          />
        </div>
      </div>

      {/* 角色4: 亮色高个 (前排右) */}
      <div
        ref={char4Ref}
        style={{
          position: 'absolute',
          left: 322,
          bottom: 0,
          width: 126,
          height: 224,
          borderRadius: '30px 30px 20px 20px',
          background: '#facc15',
          zIndex: 3,
          transition: 'transform 0.3s ease-out',
          transform: isPassword ? 'skewX(0deg)' : `skewX(${p4.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '0 6px 28px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            gap: 20,
            left: isPassword ? 28 : 39 + (p4.faceX || 0),
            top: isPassword ? 49 : 56 + (p4.faceY || 0),
            transition: 'all 0.2s ease-out',
          }}
        >
          <Pupil
            size={14}
            maxDistance={7}
            pupilColor="#1e293b"
            forceLookX={isPassword ? -6 : undefined}
            forceLookY={isPassword ? -5 : undefined}
          />
          <Pupil
            size={14}
            maxDistance={7}
            pupilColor="#1e293b"
            forceLookX={isPassword ? -6 : undefined}
            forceLookY={isPassword ? -5 : undefined}
          />
        </div>
        {/* 小嘴 */}
        <div
          style={{
            position: 'absolute',
            width: 28,
            height: 4,
            borderRadius: 3,
            background: '#1e293b',
            left: isPassword ? 14 : 50 + (p4.faceX || 0),
            top: isPassword ? 123 : 123 + (p4.faceY || 0),
            transition: 'all 0.2s ease-out',
          }}
        />
      </div>
    </div>
  );
}
