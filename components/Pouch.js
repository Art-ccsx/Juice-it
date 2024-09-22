import React, { useState, useEffect, useRef } from 'react';
import InventorySlot from './InventorySlot';
import ItemParticles from './ItemParticles';

const Pouch = ({ inventory, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, isExploring, takeAllFromPouch }) => {
  const [updatedSlots, setUpdatedSlots] = useState({});
  const prevInventoryRef = useRef(inventory);
  const particleKeyRef = useRef(0);

  useEffect(() => {
    console.log('Inventory updated:', inventory);
    console.log('Previous inventory:', prevInventoryRef.current);

    const newUpdatedSlots = {};
    inventory.forEach((item, index) => {
      const prevItem = prevInventoryRef.current[index];
      if (
        (item && !prevItem) || 
        (item && prevItem && (prevItem.id !== item.id || item.count !== prevItem.count))
      ) {
        console.log(`Slot ${index} updated:`, { prevItem, newItem: item });
        newUpdatedSlots[index] = {
          item,
          key: particleKeyRef.current++
        };
      }
    });

    console.log('New updated slots:', newUpdatedSlots);

    if (Object.keys(newUpdatedSlots).length > 0) {
      setUpdatedSlots(prev => ({...prev, ...newUpdatedSlots}));
    }

    prevInventoryRef.current = inventory;
  }, [inventory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdatedSlots({});
    }, 1000);

    return () => clearTimeout(timer);
  }, [updatedSlots]);

  const handleTakeAll = () => {
    if (isExploring) return;
    takeAllFromPouch();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Pouch</h2>
        <button
          className="bg-game-button hover:bg-game-button-hover text-white font-bold py-1 px-2 rounded text-sm"
          onClick={handleTakeAll}
          disabled={isExploring}
        >
          Take All
        </button>
      </div>
      <div className="flex flex-wrap relative">
        {inventory.map((item, index) => (
          <div key={`pouch_${index}`} className="relative">
            <InventorySlot
              item={item}
              index={`pouch_${index}`}
              handleItemInteraction={isExploring ? null : handleItemInteraction}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onMouseMove={onMouseMove}
              className="inventory-slot"
              isPouch={true}
            />
            {updatedSlots[index] && item && (
              <ItemParticles 
                key={updatedSlots[index].key} 
                color={item.rarity.color} 
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pouch;