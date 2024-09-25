export const getItem = (index, state) => {
  if (typeof index === 'string') {
    if (index === 'activeSlot') return state.activeMap;
    if (index.startsWith('pouch_')) {
      const pouchIndex = parseInt(index.split('_')[1]);
      return state.pouch[pouchIndex];
    }
    if (index.startsWith('boxes_')) {
      const boxesIndex = parseInt(index.split('_')[1]);
      return state.boxesInventory[boxesIndex];
    }
  }
  return state.inventory[index];
};

export const setItem = (state, index, item) => {
  if (typeof index === 'string') {
    if (index === 'activeSlot') return { ...state, activeMap: item };
    if (index.startsWith('pouch_')) {
      const pouchIndex = parseInt(index.split('_')[1]);
      const newPouch = [...state.pouch];
      newPouch[pouchIndex] = item;
      return { ...state, pouch: newPouch };
    }
    if (index.startsWith('boxes_')) {
      const boxesIndex = parseInt(index.split('_')[1]);
      const newBoxesInventory = [...state.boxesInventory];
      newBoxesInventory[boxesIndex] = item;
      return { ...state, boxesInventory: newBoxesInventory };
    }
  }
  const newInventory = [...state.inventory];
  newInventory[index] = item;
  return { ...state, inventory: newInventory };
};

export const removeItem = (state, index) => {
  return setItem(state, index, null);
};

export const removeItems = (inventory, itemId, amount) => {
  let remaining = amount;
  return inventory.map(item => {
    if (!item || item.id !== itemId) return item;
    if (item.count <= remaining) {
      remaining -= item.count;
      return null;
    } else {
      return { ...item, count: item.count - remaining };
    }
  });
};

export const countItem = (inventory, itemId) => {
  return inventory.reduce((sum, item) => {
    return sum + (item && item.id === itemId ? (item.count || 1) : 0);
  }, 0);
};