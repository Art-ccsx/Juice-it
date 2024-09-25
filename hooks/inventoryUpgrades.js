import { INITIAL_BOXES_INVENTORY_SIZE } from '../constants';

export const getInventoryUpgradeCost = (currentUpgrades) => {
  return Math.floor(1 * Math.pow(4, currentUpgrades));
};

export const addInventorySlot = (state, setGameState) => {
  const upgradeCost = getInventoryUpgradeCost(state.inventoryUpgrades);
  const shiniesCount = state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);

  if (shiniesCount >= upgradeCost) {
    const newInventory = state.inventory.map(item => {
      if (item && item.id === 'shinies') {
        return { ...item, count: item.count - upgradeCost };
      }
      return item;
    });

    setGameState({
      ...state,
      inventory: [...newInventory, null],
      inventoryUpgrades: state.inventoryUpgrades + 1,
    });
  }
};

export const addPouchSlot = (state, setGameState) => {
  const upgradeCost = getInventoryUpgradeCost(state.pouchUpgrades);
  const shiniesCount = state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);

  if (shiniesCount >= upgradeCost) {
    const newInventory = state.inventory.map(item => {
      if (item && item.id === 'shinies') {
        return { ...item, count: item.count - upgradeCost };
      }
      return item;
    });

    setGameState({
      ...state,
      inventory: newInventory,
      pouch: [...state.pouch, null],
      pouchUpgrades: state.pouchUpgrades + 1,
    });
  }
};

export const unlockBoxes = (state, setGameState) => {
  const shiniesCount = state.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);
  const unlockCost = 1000;

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
      boxesInventory: Array(INITIAL_BOXES_INVENTORY_SIZE).fill(null)
    });
  }
};