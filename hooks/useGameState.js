import { useState } from 'react';
import { INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE } from '../constants';

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
  });

  const [activeTab, setActiveTab] = useState('general');

  return { gameState, setGameState, activeTab, setActiveTab };
};

export default useGameState;