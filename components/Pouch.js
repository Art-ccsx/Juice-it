import React from 'react';
import InventorySlot from './InventorySlot';

const Pouch = ({ inventory, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, isExploring, takeAllFromPouch }) => {
  const handleTakeAll = () => {
    if (isExploring) return;
    takeAllFromPouch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Pouch</h2>
        <button
          className="bg-game-button hover:bg-game-button-hover text-white font-bold py-1 px-2 rounded text-sm"
          onClick={handleTakeAll}
          disabled={isExploring}
        >
          Take All
        </button>
      </div>
      <div className="flex flex-wrap">
        {inventory.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={`pouch_${index}`}
            handleItemInteraction={isExploring ? null : handleItemInteraction}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            className="inventory-slot"
            isPouch={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Pouch;