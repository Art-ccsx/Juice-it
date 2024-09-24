import React from 'react';
import Image from 'next/image';

const InventorySlot = ({ item, index, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, className = 'inventory-slot', isActiveMap = false, isExploring = false }) => {

  const handleClick = (event) => {
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = event.button === 2;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'click');
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = true;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'contextmenu');
  };

  const getBorderColor = () => {
    if (!item) return 'transparent';
    return item.rarity.color;
  };

  return (
    <div 
      className={`${className} select-none`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => item && onMouseEnter(e, item)}
      onMouseLeave={onMouseLeave}
      onMouseMove={(e) => item && onMouseMove(e, item)}
      style={{
        borderColor: item ? getBorderColor() : '#4a5568',
        borderWidth: '1px',
        borderStyle: 'solid',
        cursor: isExploring ? 'default' : 'pointer'
      }}
    >
      {item && (
        <div className="w-full h-full relative p-2 select-none">
          <Image
            src={`/assets/${item.id}.png`}
            alt={item.name}
            layout="fill"
            objectFit="contain"
            draggable="false"
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
};

export default InventorySlot;