import React, { useEffect, useRef } from 'react';

const ContinuousParticles = ({ color }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full';
      particle.style.backgroundColor = color;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `particle-fade 1s ease-out forwards`;
      container.appendChild(particle);

      setTimeout(() => {
        container.removeChild(particle);
      }, 1000);
    };

    const intervalId = setInterval(createParticle, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [color]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
  );
};

export default ContinuousParticles;