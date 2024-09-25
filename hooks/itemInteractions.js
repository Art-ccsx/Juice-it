import { getItem, setItem, removeItem, removeItems, countItem } from './inventoryHelpers';
import { ITEMS } from '../constants';

export const handleCtrlClick = (state, index) => {
  const item = getItem(index, state);
  if (!item) return state;

  let newState = {...state};

  if (typeof index === 'string') {
    if (index.startsWith('pouch_') || index === 'activeSlot') {
      // Move item from pouch or active slot to inventory
      let remainingCount = item.count || 1;
      let newInventory = [...newState.inventory];

      // First, try to add to existing stacks
      for (let i = 0; i < newInventory.length && remainingCount > 0; i++) {
        if (newInventory[i] && newInventory[i].id === item.id && newInventory[i].stackable) {
          const spaceInStack = newInventory[i].maxStack - newInventory[i].count;
          const amountToAdd = Math.min(spaceInStack, remainingCount);
          newInventory[i] = {
            ...newInventory[i],
            count: newInventory[i].count + amountToAdd
          };
          remainingCount -= amountToAdd;
        }
      }

      // If there are still items remaining, find an empty slot
      if (remainingCount > 0) {
        const emptySlot = newInventory.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
          newInventory[emptySlot] = { ...item, count: remainingCount };
          remainingCount = 0;
        }
      }

      // Update the inventory and remove the item from the source if all were moved
      newState = { ...newState, inventory: newInventory };
      if (remainingCount === 0) {
        newState = removeItem(newState, index);
      } else {
        // If not all items were moved, update the count in the source
        newState = setItem(newState, index, { ...item, count: remainingCount });
      }
      return newState;
    } else if (index.startsWith('boxes_')) {
      // Handle boxes inventory if needed
      // ... (existing code for boxes)
    }
  } else {
    // Move item from inventory to active slot or pouch
    if (item.isMapItem && newState.activeMap === null) {
      newState = setItem(newState, 'activeSlot', item);
      newState = removeItem(newState, index);
      return newState;
    } else {
      const emptyPouchSlot = newState.pouch.findIndex(slot => slot === null);
      if (emptyPouchSlot !== -1) {
        newState = setItem(newState, `pouch_${emptyPouchSlot}`, item);
        newState = removeItem(newState, index);
        return newState;
      }
    }
  }

  return state;
};

export const handleRightClick = (state, index) => {
  const clickedItem = getItem(index, state);
  if (!clickedItem || !clickedItem.usable) return state;

  if (clickedItem.id === 'modifying_prism') {
    const source = typeof index === 'string' && index.startsWith('pouch_') ? 'pouch' : 'inventory';
    return { ...state, craftingItem: { ...clickedItem, sourceIndex: index, source } };
  }

  // Handle other usable items here

  return state;
};

export const handleLeftClick = (state, index, handleCraftingInteraction) => {
  if (state.craftingItem) {
    return handleCraftingInteraction(state, index);
  }

  const clickedItem = getItem(index, state);

  if (!state.heldItem) {
    if (clickedItem) {
      return setItem({ ...state, heldItem: clickedItem }, index, null);
    }
  } else {
    if (!clickedItem) {
      return setItem({ ...state, heldItem: null }, index, state.heldItem);
    } else if (clickedItem.id === state.heldItem.id && clickedItem.stackable) {
      const itemDefinition = ITEMS.find(item => item.id === clickedItem.id);
      const maxStack = itemDefinition ? itemDefinition.maxStack : clickedItem.maxStack;
      const totalCount = clickedItem.count + state.heldItem.count;
      if (totalCount <= maxStack) {
        return setItem({ ...state, heldItem: null }, index, { ...clickedItem, count: totalCount });
      } else {
        return setItem(
          { ...state, heldItem: { ...state.heldItem, count: totalCount - maxStack } },
          index,
          { ...clickedItem, count: maxStack }
        );
      }
    } else {
      return setItem({ ...state, heldItem: clickedItem }, index, state.heldItem);
    }
  }

  return state;
};