import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

const Tooltip = ({ item, position }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: -1000, y: -1000 }); // Start off-screen
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!item || !tooltipRef.current) return;

    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipRect = tooltip.getBoundingClientRect();
      const padding = 10; // Padding from viewport edges

      let x = position.x + padding;
      let y = position.y + padding;

      // Check if tooltip goes beyond right edge of viewport
      if (x + tooltipRect.width > viewportWidth - padding) {
        x = position.x - tooltipRect.width - padding;
      }

      // Check if tooltip goes beyond bottom edge of viewport
      if (y + tooltipRect.height > viewportHeight - padding) {
        y = viewportHeight - tooltipRect.height - padding;
      }

      // Ensure tooltip doesn't go beyond left edge
      x = Math.max(padding, x);

      // Ensure tooltip doesn't go beyond top edge
      y = Math.max(padding, y);

      setTooltipPosition({ x, y });
    };

    // Delay the initial position update to ensure the tooltip has rendered
    setTimeout(updatePosition, 0);

    // Add event listener for window resize
    window.addEventListener('resize', updatePosition);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [item, position]);

  if (!item) return null;

  const hasAdditionalInfo = item.dropChance > 0 || item.stackable;

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-10 bg-gray-800 text-white p-2 rounded shadow-lg"
      style={{ 
        top: tooltipPosition.y, 
        left: tooltipPosition.x,
        maxWidth: '300px',
        width: 'max-content',
        minWidth: '200px',
        pointerEvents: 'none',
        opacity: tooltipPosition.x === -1000 ? 0 : 1, // Hide tooltip until positioned
        transition: 'opacity 0.1s ease-in-out',
      }}
    >
      <p className="font-bold" style={{ color: item.rarity?.color || '#FFFFFF' }}>{item.name}</p>
      {item.rarity && (
        <p className="text-xs italic" style={{ color: item.rarity.color }}>{item.rarity.name}</p>
      )}
      <hr className="my-1 border-gray-600" />
      <p className="text-sm">{item.description}</p>
      {hasAdditionalInfo && <hr className="my-1 border-gray-600" />}
      {item.dropChance > 0 && (
        <p className="text-xs">Drop chance: {(item.dropChance * 100).toFixed(1)}% per loot tick</p>
      )}
      {item.stackable && (
        <p className="text-xs">Max stack: {item.maxStack}</p>
      )}
      {(item.modifiers && item.modifiers.length > 0) && (
        <>
          <hr className="my-1 border-gray-600" />
          <p className="text-sm font-bold">Modifiers:</p>
          {item.modifiers.map((modifier, index) => (
            <div key={index} className="flex items-center my-1">
              <div className="flex items-center mr-1">
                {modifier.icon && (
                  <div className="relative w-6 h-6 mr-1">
                    <Image 
                      src={modifier.id.includes('conversion') ? '/assets/uncommon_upgrade.png' : modifier.icon} 
                      alt={modifier.name} 
                      layout="fill" 
                      objectFit="contain" 
                    />
                    {modifier.value && (
                      <div className="absolute top-0 right-0 text-xs font-bold" style={{
                        textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                        fontSize: '0.6rem',
                      }}>
                        {modifier.id.includes('percentage') || modifier.id.includes('chance') ? `${modifier.value}%` : 
                         modifier.id.includes('quantity') || modifier.id.includes('conversion') ? `+${modifier.value}` :
                         `${modifier.value}`}
                      </div>
                    )}
                  </div>
                )}
                {modifier.itemIcon && (
                  <div className="w-6 h-6 mr-1">
                    <Image src={modifier.itemIcon} alt={modifier.name} width={24} height={24} />
                  </div>
                )}
              </div>
              <p className="text-xs flex-grow">
                {modifier.description.replace('{x}', modifier.value)}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Tooltip;