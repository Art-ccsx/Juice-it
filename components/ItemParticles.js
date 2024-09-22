import React, { useMemo } from 'react';

const Particle = ({ color, x, y, delay }) => (
  <div
    className="absolute w-1 h-1 rounded-full"
    style={{
      backgroundColor: color,
      left: `${x}%`,
      top: `${y}%`,
      animation: `particle-fade 1s ease-out ${delay}s forwards`,
    }}
  />
);

const ItemParticles = ({ color }) => {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <Particle key={particle.id} color={color} x={particle.x} y={particle.y} delay={particle.delay} />
      ))}
    </div>
  );
};

export default React.memo(ItemParticles);