import React from 'react';
import Image from 'next/image';

const Tooltip = ({ item, position }) => {
  if (!item) return null;

  const hasAdditionalInfo = item.dropChance > 0 || item.stackable;

  return (
    <div 
      className="fixed z-10 bg-gray-800 text-white p-2 rounded shadow-lg"
      style={{ 
        top: position.y, 
        left: position.x,
        maxWidth: '600px', // Maximum width
        width: 'max-content', // Fit content
        minWidth: '200px', // Minimum width
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
      {item.modifiers && item.modifiers.length > 0 && (
        <>
          <hr className="my-1 border-gray-600" />
          <p className="text-sm font-bold">Modifiers:</p>
          {item.modifiers.map((modifier, index) => (
            <div key={index} className="flex items-center my-1">
              <div className="relative w-6 h-6">
                <Image src={modifier.icon} alt={modifier.name} layout="fill" objectFit="contain" />
                <div className="absolute top-0 right-0 text-xs font-bold" style={{
                  textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                  fontSize: '0.6rem',
                }}>
                  +{modifier.value}
                </div>
              </div>
              <div className="w-6 h-6">
                <Image src={modifier.itemIcon} alt={modifier.name} width={24} height={24} />
              </div>
              <p className="text-xs ml-1">
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