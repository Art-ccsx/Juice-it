import React from 'react';
import InventorySlot from './InventorySlot';
import ContinuousParticles from './ContinuousParticles';

const ActiveMap = ({ activeMap, handleItemInteraction, onMouseEnter, onMouseLeave, onMouseMove, isExploring }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Active Map</h2>
      <div className="bg-gray-800 rounded-md inline-block relative">
        <InventorySlot
          item={activeMap}
          index="activeSlot"
          handleItemInteraction={isExploring ? null : handleItemInteraction}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          className={`inventory-slot active-map-slot`}
          isActiveMap={true}
          isExploring={isExploring}
        />
        {isExploring && activeMap && (
          <ContinuousParticles color={activeMap.rarity.color} />
        )}
      </div>
    </div>
  );
};

export default ActiveMap;