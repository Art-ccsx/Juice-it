import React from 'react';

const InventorySlot = ({ item, index, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, className = 'inventory-slot', isPouch = false, isActiveMap = false, isExploring = false, craftingItem }) => {

  const handleClick = (event) => {
    if (!handleItemInteraction || (isActiveMap && isExploring)) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = event.button === 2;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'click');
  };
  
  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation(); // Stop the event from bubbling up
    console.log('Right-click detected on InventorySlot');
    if (!handleItemInteraction || (isActiveMap && isExploring)) return;

    const isCtrlClick = event.ctrlKey;
    const isRightClick = true;
    handleItemInteraction(index, isCtrlClick, isRightClick, 'contextmenu');
  };

  return (
    <div 
      className={`${className} relative ${isActiveMap && isExploring ? 'cursor-not-allowed' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={(e) => item && onMouseEnter(e, item)}
      onMouseLeave={onMouseLeave}
      onMouseMove={(e) => item && onMouseMove(e, item)}
    >
      <div className={`w-full h-full rounded-md relative ${isActiveMap ? 'border-2 border-blue-500' : ''} ${isActiveMap && isExploring ? 'border-yellow-500' : ''}`}>
        {item && (
          <div className="w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: item.shape }} />
            {item.stackable && item.count > 1 && (
              <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {item.count}
              </div>
            )}
          </div>
        )}
        {craftingItem && craftingItem.sourceIndex === index && (
          <div className="absolute inset-0 bg-yellow-500 bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Active</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySlot;