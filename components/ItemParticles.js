import React, { useEffect, useRef } from 'react';

const ItemParticles = ({ item, color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];

    // ... rest of your particle animation logic

    // Use the color prop when creating particles
    const createParticle = () => {
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 5 + 1,
        color: color || item.rarity.color,
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3 - 1.5,
      };
    };

    // ... rest of your animation code

  }, [item, color]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />;
};

export default ItemParticles;