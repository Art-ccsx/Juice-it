import React from 'react';
import InventorySlot from './InventorySlot';

const Storage = ({ inventory, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, clearStorage, sortStorage, craftingItem }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Storage</h2>
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm mr-2"
            onClick={sortStorage}
          >
            Sort Storage
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
            onClick={clearStorage}
          >
            Clear All Storage
          </button>
        </div>
      </div>
      <div className="flex flex-wrap">
        {inventory.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={index}
            handleItemInteraction={handleItemInteraction}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            craftingItem={craftingItem}
          />
        ))}
      </div>
    </div>
  );
};

export default Storage;