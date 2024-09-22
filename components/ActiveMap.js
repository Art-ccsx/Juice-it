import React from 'react';
import InventorySlot from './InventorySlot';

const ActiveMap = ({ activeMap, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, isExploring }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Active Map</h2>
      <div className="bg-gray-800 rounded-md inline-block">
        <InventorySlot
          item={activeMap}
          index="activeSlot"
          handleItemInteraction={isExploring ? null : handleItemInteraction}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          className="active-map-slot"
          isActiveMap={true}
          isExploring={isExploring}
        />
      </div>
    </div>
  );
};

export default ActiveMap;