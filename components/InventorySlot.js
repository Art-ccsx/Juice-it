import React from 'react';
import Image from 'next/image';

const InventorySlot = ({ item, index, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, className = 'inventory-slot', isActiveMap = false, isExploring = false, isCrafting = false }) => {

  const handleClick = (event) => {
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = event.button === 2;
    const isShiftHeld = event.shiftKey;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'click', isShiftHeld);
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = true;
    const isShiftHeld = event.shiftKey;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'contextmenu', isShiftHeld);
  };

  // Use the item's actual name without modification
  const displayName = item ? item.name : '';

  return (
    <div 
      className={`${className} border border-gray-600`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => item && onMouseEnter(e, item)}
      onMouseLeave={onMouseLeave}
      onMouseMove={(e) => item && onMouseMove(e, item)}
      style={{
        borderColor: item && item.rarity ? item.rarity.color : undefined,
      }}
      data-index={index}
    >
      {item && (
        <div className="inventory-slot-content">
          <Image
            src={`/assets/${item.id}.png`}
            alt={displayName}
            layout="fill"
            objectFit="contain"
            draggable="false"
            className="inventory-slot-image"
          />
          {item.stackable && item.count > 1 && (
            <div className="item-count">
              {item.count}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InventorySlot;