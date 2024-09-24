import React from 'react';
import Image from 'next/image';

const InventorySlot = ({ item, index, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, className = 'inventory-slot', isActiveMap = false, isExploring = false }) => {

  const handleClick = (event) => {
    if (!handleItemInteraction || (isActiveMap && isExploring)) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = event.button === 2;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'click');
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!handleItemInteraction || (isActiveMap && isExploring)) return;

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
      className={`${className} relative w-14 h-14 p-0 ${isActiveMap && isExploring ? 'cursor-not-allowed' : ''} select-none`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => item && onMouseEnter(e, item)}
      onMouseLeave={onMouseLeave}
      onMouseMove={(e) => item && onMouseMove(e, item)}
      style={{
        borderColor: item ? getBorderColor() : '#4a5568', // Use default border color when no item
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {item && (
        <div className="w-full h-full relative select-none">
          <Image
            src={`/assets/${item.id}.png`}
            alt={item.name}
            layout="fill"
            objectFit="contain"
            draggable="false"
          />
          {item.stackable && item.count > 1 && (
            <div className="absolute bottom-0 right-0 text-white text-xs font-bold pr-[2px] pb-[1px] select-none pointer-events-none" style={{
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}>
              {item.count}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventorySlot;