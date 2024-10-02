import React from 'react';
import InventorySlot from './InventorySlot';

const Storage = ({ inventory, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, clearStorage, sortStorage, craftingItem }) => {
  const handleStorageInteraction = (index, isCtrlClick, isRightClick) => {
    const timestamp = new Date().getTime();
    console.log(`Storage: Interaction on item at index ${index} (Timestamp: ${timestamp})`, {
      item: inventory[index],
      isCtrlClick,
      isRightClick
    });

    // Use the handleItemInteraction for all interactions
    handleItemInteraction(index, isCtrlClick, isRightClick, isRightClick ? 'contextmenu' : 'click');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Storage</h2>
        <div className="flex space-x-2">
          <button 
            onClick={sortStorage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sort Storage
          </button>
          <button 
            onClick={clearStorage}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear Storage
          </button>
        </div>
      </div>
      <div className="flex flex-wrap mb-2">
        {inventory.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={index}
            handleItemInteraction={(isCtrlClick, isRightClick) => handleStorageInteraction(index, isCtrlClick, isRightClick)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            className="inventory-slot"
            isCrafting={craftingItem !== null}
          />
        ))}
      </div>
    </div>
  );
}

export default Storage;