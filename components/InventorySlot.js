import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const InventorySlot = ({ item, index, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, className = 'inventory-slot', isActiveMap = false, isExploring = false, isCrafting = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleClick = (event) => {
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = event.button === 2;
    const isShiftHeld = event.shiftKey;
    handleItemInteraction(isCtrlClick, isRightClick, 'click', isShiftHeld);
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!handleItemInteraction || isExploring) return;

    const isCtrlClick = event.ctrlKey;
    const isShiftHeld = event.shiftKey;
    handleItemInteraction(isCtrlClick, true, 'contextmenu', isShiftHeld);
  };

  const handleMouseEnter = (e) => {
    setIsHovering(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (item && onMouseEnter) {
        onMouseEnter(e, item);
      }
    }, 50); // Small delay before showing tooltip
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  const handleMouseMove = (e) => {
    if (isHovering && item && onMouseMove) {
      onMouseMove(e, item);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const displayName = item ? item.name : '';

  return (
    <div 
      className={`${className} border border-gray-600`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
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