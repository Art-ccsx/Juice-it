import React from 'react';
import { ITEMS, MAP_ITEM } from '../constants';
import InventorySlot from './InventorySlot';

const Glossary = ({ discoveredItems, onMouseEnter, onMouseLeave, onMouseMove }) => {
  const allItems = [...ITEMS, MAP_ITEM];

  return (
    <div className="flex flex-wrap">
      {allItems.map((item, index) => (
        <InventorySlot
          key={item.id}
          item={discoveredItems.has(item.id) ? item : { ...item, name: '???', description: 'Not yet discovered' }}
          index={index}
          handleItemInteraction={() => {}} // Empty function, no interaction on click
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          className={`inventory-slot ${discoveredItems.has(item.id) ? '' : 'opacity-50'}`}
        />
      ))}
    </div>
  );
};

export default Glossary;