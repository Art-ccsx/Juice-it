import React from 'react';
import InventorySlot from './InventorySlot';

const Inventory = ({ inventory, moveItem, onDoubleClick, onMouseEnter, onMouseLeave, onMouseMove }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Storage</h2>
      <div className="flex flex-wrap">
        {inventory.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={index}
            moveItem={moveItem}
            onDoubleClick={onDoubleClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
          />
        ))}
      </div>
    </div>
  );
};

export default Inventory;