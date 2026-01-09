/**
 * Confetti Effect Component
 * 100%達成時のクラッカーエフェクト
 */
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  velocityX: number;
  velocityY: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'];
const PARTICLE_COUNT = 100;

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // パーティクルを生成
    const newParticles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      newParticles.push({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocityX: (Math.random() - 0.5) * 15,
        velocityY: -10 - Math.random() * 10,
      });
    }
    setParticles(newParticles);

    // アニメーション終了後にコールバック
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            '--start-x': `${particle.x}%`,
            '--start-y': `${particle.y}%`,
            '--velocity-x': particle.velocityX,
            '--velocity-y': particle.velocityY,
            '--rotation': `${particle.rotation}deg`,
            '--scale': particle.scale,
            '--color': particle.color,
          } as React.CSSProperties}
        />
      ))}
      <div className="celebration-message">
        <span className="celebration-emoji">🎉</span>
        <span className="celebration-text">Congratulations!!</span>
        <span className="celebration-emoji">🎉</span>
      </div>
    </div>
  );
};
