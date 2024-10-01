import { INITIAL_BOXES_INVENTORY_SIZE } from '../constants';

export const getInventoryUpgradeCost = (currentUpgrades) => {
  return Math.floor(1 * Math.pow(4, currentUpgrades));
};

export const addInventorySlot = (state, setGameState) => {
  const upgradeCost = getInventoryUpgradeCost(state.inventoryUpgrades);
  const shiniesCount = state.inventory ? state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0) : 0;

  if (shiniesCount >= upgradeCost) {
    const newInventory = state.inventory ? state.inventory.map(item => {
      if (item && item.id === 'shinies') {
        return { ...item, count: item.count - upgradeCost };
      }
      return item;
    }) : [];

    setGameState({
      ...state,
      inventory: [...newInventory, null],
      inventoryUpgrades: state.inventoryUpgrades + 1,
    });
  } else {
    // Optionally, you can set a message in the state to inform the user they don't have enough shinies
    setGameState({
      ...state,
      tooltipMessage: `Not enough shinies. You need ${upgradeCost} shinies to upgrade.`
    });
  }
};

export const addPouchSlot = (state, setGameState) => {
  const upgradeCost = getInventoryUpgradeCost(state.pouchUpgrades);
  const shiniesCount = state.inventory ? state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0) : 0;

  if (shiniesCount >= upgradeCost) {
    const newInventory = state.inventory ? state.inventory.map(item => {
      if (item && item.id === 'shinies') {
        return { ...item, count: item.count - upgradeCost };
      }
      return item;
    }) : [];

    setGameState({
      ...state,
      inventory: newInventory,
      pouch: [...(state.pouch || []), null],
      pouchUpgrades: state.pouchUpgrades + 1,
    });
  } else {
    // Optionally, you can set a message in the state to inform the user they don't have enough shinies
    setGameState({
      ...state,
      tooltipMessage: `Not enough shinies. You need ${upgradeCost} shinies to upgrade.`
    });
  }
};

export const unlockBoxes = (state, setGameState) => {
  console.log('unlockBoxes called with state:', state);
  console.log('setGameState type:', typeof setGameState);

  // Check if setGameState is a function
  if (typeof setGameState !== 'function') {
    console.error('setGameState is not a function');
    return;
  }

  // Check if state exists
  if (!state) {
    console.error('State is undefined');
    setGameState(prevState => ({
      ...prevState,
      tooltipMessage: "Error: Game state is not initialized"
    }));
    return;
  }

  // Check if state.inventory exists
  if (!state.inventory) {
    console.error('Inventory is undefined');
    setGameState({
      ...state,
      tooltipMessage: "Error: Inventory is not initialized"
    });
    return;
  }

  const shiniesCount = state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);
  const unlockCost = 1;

  if (shiniesCount >= unlockCost) {
    const newInventory = state.inventory.map(item => {
      if (item && item.id === 'shinies') {
        return { ...item, count: item.count - unlockCost };
      }
      return item;
    });

    setGameState({
      ...state,
      inventory: newInventory,
      boxesUnlocked: true,
      boxesInventory: Array(INITIAL_BOXES_INVENTORY_SIZE).fill(null),
      boxDrops: Array(10).fill(null) // Initialize boxDrops with 10 empty slots
    });
  } else {
    setGameState({
      ...state,
      tooltipMessage: `Not enough shinies. You need ${unlockCost} shinies to unlock boxes.`
    });
  }
};