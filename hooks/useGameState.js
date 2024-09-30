import { useState } from 'react';
import { INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, INITIAL_BOXES_INVENTORY_SIZE, BOX_DROPS_INVENTORY_SIZE } from '../constants';

const useGameState = () => {
  const [gameState, setGameState] = useState({
    exploreTime: 10,
    exploring: false,
    exploreProgress: 0,
    countdown: 0,
    inventory: Array(INITIAL_INVENTORY_SIZE).fill(null),
    pouch: Array(INITIAL_POUCH_SIZE).fill(null),
    activeMap: null,
    inventoryUpgrades: 0,
    pouchUpgrades: 0,
    discoveredItems: new Set(),
    autorun: true,
    heldItem: null,
    craftingItem: null,
    tooltipMessage: null,
    boxesUnlocked: false,
    boxesInventory: Array(INITIAL_BOXES_INVENTORY_SIZE).fill(null),
    boxDrops: Array(BOX_DROPS_INVENTORY_SIZE).fill(null),
  });

  const [activeTab, setActiveTab] = useState('general');
  const [leftActiveTab, setLeftActiveTab] = useState('???');

  return { gameState, setGameState, activeTab, setActiveTab, leftActiveTab, setLeftActiveTab };
};

export default useGameState;