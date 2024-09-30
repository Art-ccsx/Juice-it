import React, { useEffect, useRef } from 'react';

const ItemParticles = ({ item }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !item) return;

    const particleCount = 10;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full';
      particle.style.backgroundColor = item.rarity?.color || '#FFFFFF';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animation = `particle-fade 1s ease-out forwards`;
      
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = Math.random() * 50 + 50;
      particle.style.setProperty('--tw-translate-x', `${Math.cos(angle) * speed}%`);
      particle.style.setProperty('--tw-translate-y', `${Math.sin(angle) * speed}%`);

      container.appendChild(particle);
      particles.push(particle);
    }

    const timer = setTimeout(() => {
      particles.forEach(p => {
        if (container.contains(p)) {
          container.removeChild(p);
        }
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      particles.forEach(p => {
        if (container.contains(p)) {
          container.removeChild(p);
        }
      });
    };
  }, [item]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
  );
};

export default ItemParticles;