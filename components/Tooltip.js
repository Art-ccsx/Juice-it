import React from 'react';

const Tooltip = ({ item, position }) => {
  if (!item) return null;

  const hasAdditionalInfo = item.dropChance > 0 || item.stackable;

  return (
    <div 
      className="fixed z-10 bg-gray-800 text-white p-2 rounded shadow-lg"
      style={{ top: position.y, left: position.x }}
    >
      <p className="font-bold" style={{ color: item.rarity.color }}>{item.name}</p>
      <p className="text-xs italic" style={{ color: item.rarity.color }}>{item.rarity.name}</p>
      <hr className="my-1 border-gray-600" />
      <p className="text-sm">{item.description}</p>
      {hasAdditionalInfo && <hr className="my-1 border-gray-600" />}
      {item.dropChance > 0 && (
        <p className="text-xs">Drop chance: {(item.dropChance * 100).toFixed(1)}% per loot tick</p>
      )}
      {item.stackable && (
        <p className="text-xs">Max stack: {item.maxStack}</p>
      )}
    </div>
  );
};

export default Tooltip;