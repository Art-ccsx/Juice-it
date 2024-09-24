import React, { useState, useEffect, useRef } from 'react';
import InventorySlot from './InventorySlot';
import ItemParticles from './ItemParticles';

const Pouch = ({ inventory, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, isExploring, takeAllFromPouch }) => {
  const [updatedSlots, setUpdatedSlots] = useState({});
  const prevInventoryRef = useRef(inventory);
  const particleKeyRef = useRef(0);

  useEffect(() => {
    const newUpdatedSlots = {};
    inventory.forEach((item, index) => {
      const prevItem = prevInventoryRef.current[index];
      if (
        (item && !prevItem) || 
        (item && prevItem && (prevItem.id !== item.id || item.count !== prevItem.count))
      ) {
        newUpdatedSlots[index] = {
          item,
          key: particleKeyRef.current++
        };
      }
    });

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Pouch</h2>
      <div className="flex flex-wrap">
        {inventory.map((item, index) => (
          <div key={index} className="relative">
            <InventorySlot
              item={item}
              index={`pouch_${index}`}
              handleItemInteraction={isExploring ? null : handleItemInteraction}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onMouseMove={onMouseMove}
              className="inventory-slot"
              isExploring={isExploring}
            />
            {updatedSlots[index] && (
              <ItemParticles key={updatedSlots[index].key} item={updatedSlots[index].item} />
            )}
          </div>
        ))}
      </div>
      <button 
        onClick={isExploring ? null : takeAllFromPouch}
        className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${isExploring ? 'opacity-50' : ''}`}
        disabled={isExploring}
        style={{ cursor: isExploring ? 'default' : 'pointer' }}
      >
        Take All
      </button>
    </div>
  );
};

export default Pouch;