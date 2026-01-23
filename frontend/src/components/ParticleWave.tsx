import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useModel } from 'umi';
import { getThemeById } from '@/config/particleThemes';

interface ParticleWaveProps {
  className?: string;
}

const ParticleWave: React.FC<ParticleWaveProps> = ({ className }) => {
  const { themeId } = useModel('particleModel');
  const currentTheme = getThemeById(themeId);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = null;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 粒子参数
    const particleCount = 15000;
    const waveWidth = 200;
    const waveDepth = 100;

    // 创建波浪粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 初始化波浪粒子
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * waveWidth;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = (Math.random() - 0.5) * waveDepth;

      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        colors[i3] = 0;
        colors[i3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i3 + 2] = 1;
      } else if (colorChoice < 0.8) {
        colors[i3] = 0.1;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else {
        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 1;
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // 波浪粒子着色器
    const vertexShader = `
      attribute float size;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        float glow = exp(-dist * 3.0);
        
        vec3 finalColor = vColor + glow * 0.5;
        gl_FragColor = vec4(finalColor, alpha * 0.8);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 创建散景粒子
    const bokehCount = 100;
    const bokehGeometry = new THREE.BufferGeometry();
    const bokehPositions = new Float32Array(bokehCount * 3);
    const bokehColors = new Float32Array(bokehCount * 3);
    const bokehSizes = new Float32Array(bokehCount);

    for (let i = 0; i < bokehCount; i++) {
      const i3 = i * 3;
      bokehPositions[i3] = (Math.random() - 0.5) * waveWidth * 1.5;
      bokehPositions[i3 + 1] = Math.random() * -30 - 10;
      bokehPositions[i3 + 2] = (Math.random() - 0.5) * waveDepth * 2;

      bokehColors[i3] = 0.2;
      bokehColors[i3 + 1] = 0.5 + Math.random() * 0.3;
      bokehColors[i3 + 2] = 1;

      bokehSizes[i] = Math.random() * 15 + 8;
    }

    bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
    bokehGeometry.setAttribute('color', new THREE.BufferAttribute(bokehColors, 3));
    bokehGeometry.setAttribute('size', new THREE.BufferAttribute(bokehSizes, 1));

    const bokehMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.3);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const bokehParticles = new THREE.Points(bokehGeometry, bokehMaterial);
    scene.add(bokehParticles);

    // ========== 雨滴系统（带拖影） ==========
    const dropCount = 150; // 雨滴数量
    const trailLength = 12; // 拖影长度（每个雨滴由多少个点组成）

    // 雨滴数据
    interface RainDrop {
      x: number;
      z: number;
      y: number;
      velocity: number;
      active: boolean;
      maxHeight: number;
      trail: number[]; // 存储拖影Y位置
      opacity: number;
    }

    const rainDrops: RainDrop[] = [];
    for (let i = 0; i < dropCount; i++) {
      // 初始化时只激活少量雨滴（10%），让大部分处于非活跃状态以便持续生成
      const shouldActivate = Math.random() < 0.1;
      const x = (Math.random() - 0.5) * waveWidth * 0.9;
      const z = (Math.random() - 0.5) * waveDepth * 0.7;
      const waveHeight = Math.sin(x * 0.05) * 8 + Math.sin(z * 0.08) * 5;
      const startHeight = shouldActivate ? waveHeight + Math.random() * 40 : -200;
      
      rainDrops.push({
        x,
        z,
        y: startHeight,
        velocity: shouldActivate ? 0.5 + Math.random() * 0.7 : 0,
        active: shouldActivate,
        maxHeight: waveHeight + 80 + Math.random() * 120,
        trail: new Array(trailLength).fill(startHeight),
        opacity: shouldActivate ? 1.0 : 0,
      });
    }

    // 创建雨滴拖影几何体（使用点粒子，每个雨滴有多个拖影点）
    const trailPointCount = dropCount * trailLength;
    const dropTrailGeometry = new THREE.BufferGeometry();
    const dropTrailPositions = new Float32Array(trailPointCount * 3);
    const dropTrailColors = new Float32Array(trailPointCount * 3);
    const dropTrailSizes = new Float32Array(trailPointCount);

    // 初始化拖影点大小（越靠后越小）
    for (let i = 0; i < dropCount; i++) {
      for (let j = 0; j < trailLength; j++) {
        const idx = i * trailLength + j;
        dropTrailSizes[idx] = 4 * (1 - j / trailLength) * 0.5; // 从2到0渐变，减小一半
      }
    }

    dropTrailGeometry.setAttribute('position', new THREE.BufferAttribute(dropTrailPositions, 3));
    dropTrailGeometry.setAttribute('color', new THREE.BufferAttribute(dropTrailColors, 3));
    dropTrailGeometry.setAttribute('size', new THREE.BufferAttribute(dropTrailSizes, 1));

    // 拖影材质 - 使用着色器
    const dropTrailMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // 创建拖影粒子
    const dropTrailParticles = new THREE.Points(dropTrailGeometry, dropTrailMaterial);
    scene.add(dropTrailParticles);

    // 额外的发光雨滴头部粒子
    const dropHeadGeometry = new THREE.BufferGeometry();
    const dropHeadPositions = new Float32Array(dropCount * 3);
    const dropHeadColors = new Float32Array(dropCount * 3);
    const dropHeadSizes = new Float32Array(dropCount);

    for (let i = 0; i < dropCount; i++) {
      dropHeadSizes[i] = (6 + Math.random() * 4) * 0.5; // 随机大小 3-5，减小一半
    }

    dropHeadGeometry.setAttribute('position', new THREE.BufferAttribute(dropHeadPositions, 3));
    dropHeadGeometry.setAttribute('color', new THREE.BufferAttribute(dropHeadColors, 3));
    dropHeadGeometry.setAttribute('size', new THREE.BufferAttribute(dropHeadSizes, 1));

    const dropHeadMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          float glow = exp(-dist * 2.0);
          
          vec3 finalColor = vColor + glow * 0.8;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dropHeadParticles = new THREE.Points(dropHeadGeometry, dropHeadMaterial);
    scene.add(dropHeadParticles);

    // 时间变量
    let time = 0;
    let lastSpawnTime = 0; // 上次生成时间

    // 计算波浪高度的函数
    const getWaveHeight = (x: number, z: number, t: number) => {
      return Math.sin(x * 0.05 + t) * 8 +
             Math.sin(z * 0.08 + t * 0.8) * 5 +
             Math.sin((x + z) * 0.03 + t * 1.2) * 3;
    };

    // 激活一个雨滴的辅助函数
    const activateDrop = (drop: RainDrop) => {
      drop.x = (Math.random() - 0.5) * waveWidth * 0.9;
      drop.z = (Math.random() - 0.5) * waveDepth * 0.7;
      const waveHeight = getWaveHeight(drop.x, drop.z, time);
      drop.y = waveHeight;
      drop.velocity = 0.5 + Math.random() * 0.7;
      drop.maxHeight = waveHeight + 80 + Math.random() * 120;
      drop.active = true;
      drop.opacity = 0.5;
      drop.trail.fill(waveHeight);
    };

    // 动画循环
    const animate = () => {
      time += 0.02;

      const wavePositions = particles.geometry.attributes.position.array as Float32Array;

      // 更新波浪粒子
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = wavePositions[i3];
        const z = wavePositions[i3 + 2];
        wavePositions[i3 + 1] = getWaveHeight(x, z, time);
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // 更新雨滴
      const tPos = dropTrailParticles.geometry.attributes.position.array as Float32Array;
      const tCol = dropTrailParticles.geometry.attributes.color.array as Float32Array;
      const hPos = dropHeadParticles.geometry.attributes.position.array as Float32Array;
      const hCol = dropHeadParticles.geometry.attributes.color.array as Float32Array;

      // 统计活跃雨滴数量
      let activeCount = 0;
      const inactiveIndices: number[] = [];

      for (let i = 0; i < dropCount; i++) {
        const drop = rainDrops[i];

        if (drop.active) {
          activeCount++;
          // 更新拖影位置（从后往前移动）
          for (let j = trailLength - 1; j > 0; j--) {
            drop.trail[j] = drop.trail[j - 1];
          }
          drop.trail[0] = drop.y;

          // 缓慢向上移动
          drop.velocity = Math.max(drop.velocity * 0.995, 0.3); // 逐渐减速但保持最小速度
          drop.y += drop.velocity;

          // 淡入效果
          if (drop.opacity < 1) {
            drop.opacity = Math.min(drop.opacity + 0.05, 1);
          }

          // 到达最大高度后开始消失
          if (drop.y > drop.maxHeight) {
            drop.opacity -= 0.03;
            if (drop.opacity <= 0) {
              drop.active = false;
              drop.y = -200;
              drop.trail.fill(-200);
              inactiveIndices.push(i);
            }
          }
        } else {
          inactiveIndices.push(i);
        }
      }

      // 基于时间的生成：每 0.1 秒至少生成 2-3 个新雨滴
      const timeSinceLastSpawn = time - lastSpawnTime;
      if (timeSinceLastSpawn >= 0.1 && inactiveIndices.length > 0) {
        const spawnCount = Math.min(2 + Math.floor(Math.random() * 2), inactiveIndices.length);
        const shuffledIndices = [...inactiveIndices].sort(() => Math.random() - 0.5);
        for (let n = 0; n < spawnCount; n++) {
          const i = shuffledIndices[n];
          activateDrop(rainDrops[i]);
        }
        lastSpawnTime = time;
      }

      // 确保持续生成：每帧至少激活 3-5 个新雨滴
      const targetActiveCount = 20; // 降低目标活跃数量，让更多雨滴可以生成
      const needActivate = Math.max(3, targetActiveCount - activeCount); // 至少激活3个
      
      // 随机激活一些非活跃的雨滴
      const remainingInactive = inactiveIndices.filter(i => !rainDrops[i].active);
      if (remainingInactive.length > 0) {
        const shuffledIndices = [...remainingInactive].sort(() => Math.random() - 0.5); // 打乱顺序
        for (let n = 0; n < Math.min(needActivate, shuffledIndices.length); n++) {
          const i = shuffledIndices[n];
          activateDrop(rainDrops[i]);
        }
      }

      // 额外的随机激活（概率激活，提高概率）
      for (let i = 0; i < dropCount; i++) {
        const drop = rainDrops[i];
        if (!drop.active && Math.random() < 0.25) { // 提高概率到 25%
          activateDrop(drop);
        }
      }

      // 更新所有雨滴的渲染数据
      for (let i = 0; i < dropCount; i++) {
        const drop = rainDrops[i];
        
        // 更新雨滴头部位置
        const hi3 = i * 3;
        hPos[hi3] = drop.x;
        hPos[hi3 + 1] = drop.y;
        hPos[hi3 + 2] = drop.z;

        // 头部颜色 - 使用青色/白色，更亮更明显
        const brightness = drop.active ? (0.8 + Math.sin(time * 5 + i) * 0.2) : 0; // 闪烁效果
        hCol[hi3] = 0.5 * brightness * drop.opacity;
        hCol[hi3 + 1] = 1.0 * brightness * drop.opacity;
        hCol[hi3 + 2] = 1.0 * brightness * drop.opacity;

        // 更新拖影点粒子
        for (let j = 0; j < trailLength; j++) {
          const pointIndex = (i * trailLength + j) * 3;
          
          // 位置
          tPos[pointIndex] = drop.x;
          tPos[pointIndex + 1] = drop.trail[j];
          tPos[pointIndex + 2] = drop.z;

          // 颜色渐变（越靠后越暗）
          const fade = 1 - (j / trailLength);
          const baseOpacity = drop.opacity;

          tCol[pointIndex] = 0.6 * fade * baseOpacity;
          tCol[pointIndex + 1] = 1.0 * fade * baseOpacity;
          tCol[pointIndex + 2] = 1.0 * fade * baseOpacity;
        }
      }

      dropTrailParticles.geometry.attributes.position.needsUpdate = true;
      dropTrailParticles.geometry.attributes.color.needsUpdate = true;
      dropHeadParticles.geometry.attributes.position.needsUpdate = true;
      dropHeadParticles.geometry.attributes.color.needsUpdate = true;

      // 相机轻微摆动
      camera.position.x = Math.sin(time * 0.3) * 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 窗口大小调整
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      bokehGeometry.dispose();
      bokehMaterial.dispose();
      dropTrailGeometry.dispose();
      dropTrailMaterial.dispose();
      dropHeadGeometry.dispose();
      dropHeadMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        background: currentTheme.backgroundGradient || currentTheme.backgroundColor || 'linear-gradient(180deg, #000000 0%, #0a1628 50%, #0d1f3c 100%)',
      }}
    />
  );
};

export default ParticleWave;
