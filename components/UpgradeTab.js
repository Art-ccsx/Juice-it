import React, { useMemo } from 'react';
import Image from 'next/image';
import Glossary from './Glossary';
import Settings from './Settings';
import { INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, ITEMS, INITIAL_BOXES_INVENTORY_SIZE } from '../constants';

const CostDisplay = React.memo(({ cost, item, onMouseEnter, onMouseLeave, onMouseMove }) => (
  <div 
    className="flex items-center"
    onMouseEnter={(e) => onMouseEnter(e, item)}
    onMouseLeave={onMouseLeave}
    onMouseMove={(e) => onMouseMove(e, item)}
  >
    <span className="mr-1">Cost:</span>
    <span className="font-bold mr-1">{cost}</span>
    <div className="w-4 h-4 relative">
      <Image
        src={`/assets/${item.id}.png`}
        alt={item.name}
        layout="fill"
        objectFit="contain"
      />
    </div>
  </div>
));

const UpgradeTab = React.memo(({ inventorySlots, pouchSlots, addInventorySlot, addPouchSlot, onMouseEnter, onMouseLeave, onMouseMove, getInventoryUpgradeCost, shiniesCount, unlockBoxes, boxesUnlocked, gameState, setGameState }) => {
  const inventoryUpgradeCost = useMemo(() => getInventoryUpgradeCost(inventorySlots - INITIAL_INVENTORY_SIZE), [getInventoryUpgradeCost, inventorySlots]);
  const pouchUpgradeCost = useMemo(() => getInventoryUpgradeCost(pouchSlots - INITIAL_POUCH_SIZE), [getInventoryUpgradeCost, pouchSlots]);
  const shiniesItem = useMemo(() => ITEMS.find(item => item.id === 'shinies'), []);

  const handleUnlockBoxes = () => {
    console.log('Current game state:', gameState);
    unlockBoxes(gameState, setGameState);
  };

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
          <CostDisplay cost={inventoryUpgradeCost} item={shiniesItem} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} />
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
          <CostDisplay cost={pouchUpgradeCost} item={shiniesItem} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} />
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span>Unlock Boxes</span>
        <div className="flex items-center">
          {boxesUnlocked ? (
            <button
              className="bg-green-500 text-white font-bold py-1 px-2 rounded text-sm mr-2 cursor-default"
              disabled
            >
              ✓ Unlocked
            </button>
          ) : (
            <button
              className="bg-game-button hover:bg-game-button-hover text-white font-bold py-1 px-2 rounded text-sm mr-2"
              onClick={handleUnlockBoxes}
              disabled={shiniesCount < 1}
            >
              Unlock Boxes
            </button>
          )}
          {!boxesUnlocked && (
            <CostDisplay cost={1} item={shiniesItem} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseMove={onMouseMove} />
          )}
        </div>
      </div>
      <div>Available Shinies: {shiniesCount}</div>
    </div>
  );
});

export default UpgradeTab;