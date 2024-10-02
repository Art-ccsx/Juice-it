import React from 'react';
import useBoxSystem from '../hooks/useBoxSystem';
import InventorySlot from './InventorySlot';

const BoxInventory = ({ gameState, setGameState, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove }) => {
  const { openBox, useKeyOnLockbox } = useBoxSystem(gameState, setGameState);

  const handleBoxInteraction = (index, isCtrlClick, isRightClick) => {
    const item = gameState.boxesInventory[index];
    
    console.log(`BoxInventory: Interaction on item at index ${index}`, {
      item,
      isCtrlClick,
      isRightClick
    });

    if (isRightClick) {
      console.log(`BoxInventory: Right-click detected on item:`, item);
      // Use the handleItemInteraction for right-clicks on all items
      handleItemInteraction(`boxes_${index}`, isCtrlClick, isRightClick, 'contextmenu');
    } else if (!isRightClick) {
      if (item && item.id === 'box') {
        // Open boxes on left-click
        console.log(`Box click registered: ${index}, Timestamp: ${new Date().toISOString()}`);
        console.log('Box content:', item);
        openBox(index);
      } else if (item && item.id === 'simple_lockbox' && gameState.craftingItem && gameState.craftingItem.id === 'simple_key') {
        // Use key on lockbox
        console.log(`Attempting to open lockbox with key`);
        const keyIndex = gameState.boxesInventory.findIndex(i => i && i.id === 'simple_key');
        useKeyOnLockbox(keyIndex, index);
        // Reset crafting item
        setGameState(prevState => ({ ...prevState, craftingItem: null }));
      } else {
        console.log(`BoxInventory: Left-click on non-box item or invalid crafting combination, no action taken`);
      }
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Boxes and Keys</h3>
      <div className="flex flex-wrap mb-4">
        {gameState.boxesInventory.map((item, index) => (
          <InventorySlot
            key={index}
            item={item}
            index={`boxes_${index}`}
            handleItemInteraction={(isCtrlClick, isRightClick) => handleBoxInteraction(index, isCtrlClick, isRightClick)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            className="inventory-slot w-8 h-8"
          />
        ))}
      </div>
    </div>
  );
};

export default BoxInventory;