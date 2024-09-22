import { useCallback } from 'react';
import { ITEMS, MAP_ITEM, RARITY, INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, INITIAL_BOXES_INVENTORY_SIZE } from '../constants';

const useInventory = (gameState, setGameState) => {
  // Helper functions
  const getItem = useCallback((index, state) => {
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
  }, []);

  const setItem = useCallback((state, index, item) => {
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
  }, []);

  const removeItems = useCallback((inventory, itemId, amount) => {
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
  }, []);

  const countItem = useCallback((inventory, itemId) => {
    return inventory.reduce((sum, item) => sum + (item && item.id === itemId ? item.count : 0), 0);
  }, []);

  // Interaction handlers
  const handleCtrlClick = useCallback((state, index) => {
    const item = getItem(index, state);
    if (!item) return state;

    let newState = {...state};

    if (typeof index === 'string') {
      if (index.startsWith('pouch_') || index === 'activeSlot') {
        if (item.id === 'box' && state.boxesUnlocked) {
          const boxesIndex = state.boxesInventory.findIndex(slot => slot === null);
          if (boxesIndex !== -1) {
            return setItem(setItem(state, index, null), `boxes_${boxesIndex}`, item);
          }
        } else {
          // Try to add to existing stacks first
          let remainingCount = item.count;
          const newInventory = [...state.inventory];
          
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
            const emptySlotIndex = newInventory.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1) {
              newInventory[emptySlotIndex] = {...item, count: remainingCount};
              remainingCount = 0;
            }
          }

          // Update the state
          newState = setItem(newState, 'inventory', newInventory);
          if (remainingCount === 0) {
            newState = setItem(newState, index, null);
          } else {
            newState = setItem(newState, index, {...item, count: remainingCount});
          }
          return newState;
        }
      }
    } else if (typeof index === 'number' && item.isMapItem && !state.exploring) {
      return setItem(setItem(state, index, null), 'activeSlot', item);
    }

    return state;
  }, [getItem, setItem]);

  const handleCraftingInteraction = useCallback((state, index) => {
    const material = state.craftingItem;
    const targetItem = getItem(index, state);
    
    if (material && targetItem && isCraftingApplicable(material, targetItem)) {
      const requiredAmount = 1;
      const materialCount = countItem(state.inventory, material.id);
      
      if (materialCount >= requiredAmount) {
        const newInventory = removeItems(state.inventory, material.id, requiredAmount);
        const upgradedMap = upgradeMap(targetItem);
        
        return updateStateAfterCrafting(state, index, newInventory, upgradedMap, material);
      } else {
        return { ...state, tooltipMessage: `You need 1 ${material.name}` };
      }
    }
    
    return state;
  }, [getItem, countItem, removeItems]);

  const handleRightClick = useCallback((state, index) => {
    const clickedItem = getItem(index, state);
    if (!clickedItem || !clickedItem.usable) return state;

    if (clickedItem.id === 'modifying_prism') {
      return { ...state, craftingItem: { ...clickedItem, sourceIndex: index } };
    }

    // Handle other usable items here

    return state;
  }, [getItem]);

  const handleLeftClick = useCallback((state, index) => {
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
  }, [getItem, setItem, handleCraftingInteraction]);

  const handleItemInteraction = useCallback((index, isCtrlClick, isRightClick, mouseEvent) => {
    setGameState(prevState => {
      if (prevState.craftingItem && prevState.heldItem) return prevState;

      if (isCtrlClick) {
        return handleCtrlClick(prevState.craftingItem ? { ...prevState, craftingItem: null } : prevState, index);
      }

      if (isRightClick) {
        return handleRightClick(prevState, index);
      }

      if (!isRightClick && mouseEvent === 'click') {
        return handleLeftClick(prevState, index);
      }

      return prevState;
    });
  }, [handleCtrlClick, handleRightClick, handleLeftClick]);

  // Utility functions
  const isCraftingApplicable = useCallback((craftingItem, targetItem) => {
    return craftingItem.id === 'modifying_prism' && targetItem.isMapItem;
  }, []);

  const upgradeMap = useCallback((targetItem) => {
    const rarityOrder = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
    const currentRarityIndex = rarityOrder.findIndex(r => r.name === targetItem.rarity.name);
    const newRarity = rarityOrder[Math.min(currentRarityIndex + 1, rarityOrder.length - 1)];
    
    return {
      ...targetItem,
      rarity: newRarity,
      name: `${newRarity.name} ${targetItem.name.split(' ').slice(1).join(' ')}`,
    };
  }, []);

  const updateStateAfterCrafting = useCallback((state, index, newInventory, upgradedMap, material) => {
    let updatedState = {
      ...state,
      inventory: newInventory,
      craftingItem: null,
      tooltipMessage: `Upgraded map to ${upgradedMap.rarity.name} rarity!`,
    };

    if (typeof index === 'string') {
      if (index.startsWith('pouch_')) {
        updatedState.pouch = state.pouch.map((item, i) => i === parseInt(index.split('_')[1]) ? upgradedMap : item);
      } else if (index === 'activeSlot') {
        updatedState.activeMap = upgradedMap;
      } else if (index.startsWith('boxes_')) {
        updatedState.boxesInventory = state.boxesInventory.map((item, i) => i === parseInt(index.split('_')[1]) ? upgradedMap : item);
      }
    } else {
      updatedState.inventory = updatedState.inventory.map((item, i) => i === index ? upgradedMap : item);
    }

    return updatedState;
  }, []);

  // Additional inventory management functions
  const getInventoryUpgradeCost = useCallback((currentUpgrades) => {
    return Math.floor(1 * Math.pow(4, currentUpgrades));
  }, []);

  const addInventorySlot = useCallback(() => {
    setGameState(prevState => {
      const upgradeCost = getInventoryUpgradeCost(prevState.inventoryUpgrades);
      const shiniesCount = prevState.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);

      if (shiniesCount >= upgradeCost) {
        const newInventory = prevState.inventory.map(item => {
          if (item && item.id === 'shinies') {
            return { ...item, count: item.count - upgradeCost };
          }
          return item;
        });

        return {
          ...prevState,
          inventory: [...newInventory, null],
          inventoryUpgrades: prevState.inventoryUpgrades + 1,
        };
      }
      return prevState;
    });
  }, [getInventoryUpgradeCost]);

  const addPouchSlot = useCallback(() => {
    setGameState(prevState => {
      const upgradeCost = getInventoryUpgradeCost(prevState.pouchUpgrades);
      const shiniesCount = prevState.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);

      if (shiniesCount >= upgradeCost) {
        const newInventory = prevState.inventory.map(item => {
          if (item && item.id === 'shinies') {
            return { ...item, count: item.count - upgradeCost };
          }
          return item;
        });

        return {
          ...prevState,
          inventory: newInventory,
          pouch: [...prevState.pouch, null],
          pouchUpgrades: prevState.pouchUpgrades + 1,
        };
      }
      return prevState;
    });
  }, [getInventoryUpgradeCost]);

  const getMap = useCallback(() => {
    setGameState(prevState => {
      const emptySlot = prevState.inventory.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        const newInventory = [...prevState.inventory];
        newInventory[emptySlot] = { ...MAP_ITEM, count: 1 };
        return {
          ...prevState,
          inventory: newInventory,
          discoveredItems: new Set([...prevState.discoveredItems, MAP_ITEM.id])
        };
      }
      // If there's no empty slot, show a tooltip message
      return {
        ...prevState,
        tooltipMessage: "No empty slots in inventory for a new map!"
      };
    });
  }, []);

  const clearStorage = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      inventory: prevState.inventory.map(() => null),
    }));
  }, []);

  const sortStorage = useCallback(() => {
    setGameState(prevState => {
      console.log('Sorting storage...');
      const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
      const sortedItems = prevState.inventory
        .filter(item => item !== null)
        .sort((a, b) => {
          console.log(`Comparing items: ${a.name} (max stack: ${a.maxStack}) and ${b.name} (max stack: ${b.maxStack})`);
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      console.log('Sorted items:', sortedItems.map(item => `${item.name} (count: ${item.count}, max stack: ${item.maxStack})`));

      const newInventory = [
        ...sortedItems,
        ...Array(prevState.inventory.length - sortedItems.length).fill(null)
      ];

      return { ...prevState, inventory: newInventory };
    });
  }, []);

  const takeAllFromPouch = useCallback(() => {
    console.log('takeAllFromPouch function called');
    setGameState(prevState => {
      console.log('Current state:', JSON.stringify(prevState, null, 2));
      let newInventory = [...prevState.inventory];
      let newPouch = [...prevState.pouch];
      let newBoxesInventory = [...prevState.boxesInventory];
      let itemsMoved = false;

      newPouch.forEach((pouchItem, pouchIndex) => {
        if (pouchItem) {
          console.log(`Processing pouch item at index ${pouchIndex}:`, pouchItem);
          let remainingCount = pouchItem.count;
          console.log(`Initial remaining count: ${remainingCount}`);

          if (pouchItem.id === 'box' && prevState.boxesUnlocked) {
            const boxesIndex = newBoxesInventory.findIndex(slot => slot === null);
            if (boxesIndex !== -1) {
              console.log(`Moving box to boxes inventory at index ${boxesIndex}`);
              newBoxesInventory[boxesIndex] = { ...pouchItem, count: 1 };
              remainingCount--;
              itemsMoved = true;
            }
          }

          // Try to add to existing stacks
          for (let i = 0; i < newInventory.length && remainingCount > 0; i++) {
            if (newInventory[i] && newInventory[i].id === pouchItem.id && newInventory[i].stackable) {
              const spaceInStack = newInventory[i].maxStack - newInventory[i].count;
              const amountToAdd = Math.min(spaceInStack, remainingCount);
              console.log(`Adding ${amountToAdd} to existing stack at index ${i}`);
              newInventory[i] = {
                ...newInventory[i],
                count: newInventory[i].count + amountToAdd
              };
              remainingCount -= amountToAdd;
              itemsMoved = true;
            }
          }

          // If there are still items remaining, find empty slots
          while (remainingCount > 0) {
            const emptySlot = newInventory.findIndex(slot => slot === null);
            if (emptySlot === -1) {
              console.log('No more empty slots in inventory');
              break;
            }
            const amountToAdd = Math.min(remainingCount, pouchItem.maxStack);
            console.log(`Adding ${amountToAdd} to new stack at index ${emptySlot}`);
            newInventory[emptySlot] = { ...pouchItem, count: amountToAdd };
            remainingCount -= amountToAdd;
            itemsMoved = true;
          }

          if (remainingCount === 0) {
            console.log(`Removing item from pouch at index ${pouchIndex}`);
            newPouch[pouchIndex] = null;
          } else {
            console.log(`Updating pouch item count at index ${pouchIndex} to ${remainingCount}`);
            newPouch[pouchIndex] = { ...pouchItem, count: remainingCount };
          }
        }
      });

      console.log('Items moved:', itemsMoved);
      console.log('New inventory:', newInventory);
      console.log('New pouch:', newPouch);
      console.log('New boxes inventory:', newBoxesInventory);

      return itemsMoved ? { ...prevState, inventory: newInventory, pouch: newPouch, boxesInventory: newBoxesInventory } : prevState;
    });
  }, [setGameState]);

  const unlockBoxes = useCallback(() => {
    console.log('unlockBoxes function called');
    setGameState(prevState => {
      console.log('Current state:', prevState);
      const shiniesCount = prevState.inventory.reduce((sum, item) => 
        sum + (item && item.id === 'shinies' ? item.count : 0), 0);
      console.log('Current shinies count:', shiniesCount);
      
      if (shiniesCount >= 10 && !prevState.boxesUnlocked) {
        console.log('Unlocking boxes');
        const newInventory = prevState.inventory.map(item => {
          if (item && item.id === 'shinies') {
            return { ...item, count: item.count - 10 };
          }
          return item;
        }).filter(item => item === null || item.count > 0);

        return {
          ...prevState,
          boxesUnlocked: true,
          inventory: newInventory,
        };
      }
      console.log('Cannot unlock boxes: insufficient shinies or already unlocked');
      return prevState;
    });
  }, []);

  return {
    handleItemInteraction,
    addInventorySlot,
    addPouchSlot,
    getMap,
    getInventoryUpgradeCost,
    clearStorage,
    sortStorage,
    takeAllFromPouch,
    unlockBoxes,
  };
};

export default useInventory;
