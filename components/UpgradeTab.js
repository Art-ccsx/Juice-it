import React from 'react';
import Glossary from './Glossary';
import Settings from './Settings';
import { INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, ITEMS } from '../constants';

const UpgradeTab = ({ inventorySlots, pouchSlots, addInventorySlot, addPouchSlot, onMouseEnter, onMouseLeave, onMouseMove, getInventoryUpgradeCost, shiniesCount }) => {
  const inventoryUpgradeCost = getInventoryUpgradeCost(inventorySlots - INITIAL_INVENTORY_SIZE);
  const pouchUpgradeCost = getInventoryUpgradeCost(pouchSlots - INITIAL_POUCH_SIZE);
  const shiniesItem = ITEMS.find(item => item.id === 'shinies');

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">General Upgrades</h3>
      <div className="flex items-center justify-between mb-2">
        <span>Storage Slots: {inventorySlots}</span>
        <div className="flex items-center">
          <button
            className="bg-game-button hover:bg-game-button-hover text-white font-bold py-1 px-2 rounded text-sm mr-2"
            onClick={addInventorySlot}
            disabled={shiniesCount < inventoryUpgradeCost}
          >
            Add Storage Slot
          </button>
          <div 
            className="flex items-center"
            onMouseEnter={(e) => onMouseEnter(e, shiniesItem)}
            onMouseLeave={onMouseLeave}
            onMouseMove={(e) => onMouseMove(e, shiniesItem)}
          >
            <span className="mr-1">Cost:</span>
            <span className="font-bold mr-1">{inventoryUpgradeCost}</span>
            <div className="w-4 h-4 inline-block">
              <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: shiniesItem.shape }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span>Pouch Slots: {pouchSlots}</span>
        <div className="flex items-center">
          <button
            className="bg-game-button hover:bg-game-button-hover text-white font-bold py-1 px-2 rounded text-sm mr-2"
            onClick={addPouchSlot}
            disabled={shiniesCount < pouchUpgradeCost}
          >
            Add Pouch Slot
          </button>
          <div 
            className="flex items-center"
            onMouseEnter={(e) => onMouseEnter(e, shiniesItem)}
            onMouseLeave={onMouseLeave}
            onMouseMove={(e) => onMouseMove(e, shiniesItem)}
          >
            <span className="mr-1">Cost:</span>
            <span className="font-bold mr-1">{pouchUpgradeCost}</span>
            <div className="w-4 h-4 inline-block">
              <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: shiniesItem.shape }} />
            </div>
          </div>
        </div>
      </div>
      <div>Available Shinies: {shiniesCount}</div>
    </div>
  );
};

export default UpgradeTab;