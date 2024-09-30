import React from 'react';
import { ITEMS, MAP_ITEM } from '../constants';
import InventorySlot from './InventorySlot';

const Glossary = ({ discoveredItems, spawnItem, onMouseEnter, onMouseLeave, onMouseMove }) => {
  const allItems = [...ITEMS, MAP_ITEM];

  const handleItemInteraction = (index) => {
    const item = allItems[index];
    if (discoveredItems.has(item.id)) {
      spawnItem(item.id);
    }
  };

  return (
    <div className="flex flex-wrap">
      {allItems.map((item, index) => (
        <InventorySlot
          key={item.id}
          item={discoveredItems.has(item.id) ? item : { ...item, name: '???', description: 'Not yet discovered' }}
          index={index}
          handleItemInteraction={handleItemInteraction}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          className={`inventory-slot ${discoveredItems.has(item.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        />
      ))}
    </div>
  );
};

export default Glossary;