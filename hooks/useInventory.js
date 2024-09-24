import { useCallback } from 'react';
import { ITEMS, MAP_ITEM, RARITY, INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, INITIAL_BOXES_INVENTORY_SIZE, MAP_MODIFIERS } from '../constants';

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

  const removeItem = useCallback((state, index) => {
    if (typeof index === 'string') {
      if (index === 'activeSlot') return { ...state, activeMap: null };
      if (index.startsWith('pouch_')) {
        const pouchIndex = parseInt(index.split('_')[1]);
        const newPouch = [...state.pouch];
        newPouch[pouchIndex] = null;
        return { ...state, pouch: newPouch };
      }
      if (index.startsWith('boxes_')) {
        const boxesIndex = parseInt(index.split('_')[1]);
        const newBoxesInventory = [...state.boxesInventory];
        newBoxesInventory[boxesIndex] = null;
        return { ...state, boxesInventory: newBoxesInventory };
      }
    }
    const newInventory = [...state.inventory];
    newInventory[index] = null;
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
    return inventory.reduce((sum, item) => {
      return sum + (item && item.id === itemId ? (item.count || 1) : 0);
    }, 0);
  }, []);

  // Interaction handlers
  const handleCtrlClick = useCallback((state, index) => {
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
  }, [getItem, setItem, removeItem]);

  const upgradeMap = useCallback((targetItem) => {
    const rarityOrder = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
    const currentRarityIndex = rarityOrder.findIndex(r => r.name === targetItem.rarity.name);
    const newRarity = rarityOrder[Math.min(currentRarityIndex + 1, rarityOrder.length - 1)];
    
    // Generate a random modifier
    const randomModifier = MAP_MODIFIERS[Math.floor(Math.random() * MAP_MODIFIERS.length)];
    const modifierValue = Math.floor(Math.random() * (randomModifier.maxValue - randomModifier.minValue + 1)) + randomModifier.minValue;
    
    const newModifier = {
      ...randomModifier,
      value: modifierValue,
    };
    
    return {
      ...targetItem,
      rarity: newRarity,
      name: `${newRarity.name} ${targetItem.name.split(' ').slice(1).join(' ')}`,
      modifiers: [...(targetItem.modifiers || []), newModifier],
    };
  }, []);

  const updateStateAfterCrafting = useCallback((state, index, upgradedMap, material) => {
    const newState = setItem(state, index, upgradedMap);
    return {
      ...newState,
      craftingItem: null,
      tooltipMessage: `Successfully upgraded map using ${material.name}`,
    };
  }, [setItem]);

  const isCraftingApplicable = useCallback((craftingItem, targetItem) => {
    return craftingItem.id === 'modifying_prism' && targetItem.isMapItem;
  }, []);

  const handleCraftingInteraction = useCallback((state, index) => {
    const material = state.craftingItem;
    const targetItem = getItem(index, state);
    
    if (material && targetItem && isCraftingApplicable(material, targetItem)) {
      const requiredAmount = 1;
      const materialCountInventory = countItem(state.inventory, material.id);
      const materialCountPouch = countItem(state.pouch, material.id);
      const totalMaterialCount = materialCountInventory + materialCountPouch;
      
      if (totalMaterialCount >= requiredAmount) {
        let newInventory = [...state.inventory];
        let newPouch = [...state.pouch];
        
        // Remove the material from inventory first, then from pouch if necessary
        if (materialCountInventory > 0) {
          newInventory = removeItems(newInventory, material.id, 1);
        } else {
          newPouch = removeItems(newPouch, material.id, 1);
        }
        
        const upgradedMap = upgradeMap(targetItem);
        
        return updateStateAfterCrafting(
          { ...state, inventory: newInventory, pouch: newPouch, craftingItem: null },
          index,
          upgradedMap,
          material
        );
      } else {
        return { ...state, tooltipMessage: `You need 1 ${material.name}` };
      }
    }
    
    return state;
  }, [getItem, countItem, removeItems, upgradeMap, updateStateAfterCrafting, isCraftingApplicable]);

  const handleRightClick = useCallback((state, index) => {
    const clickedItem = getItem(index, state);
    console.log('Right-click on item:', clickedItem);
    if (!clickedItem || !clickedItem.usable) return state;

    if (clickedItem.id === 'modifying_prism') {
      const source = typeof index === 'string' && index.startsWith('pouch_') ? 'pouch' : 'inventory';
      console.log('Setting crafting item:', { ...clickedItem, sourceIndex: index, source });
      return { ...state, craftingItem: { ...clickedItem, sourceIndex: index, source } };
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
    console.log('handleItemInteraction:', { index, isCtrlClick, isRightClick, mouseEvent, craftingItem: gameState.craftingItem });
    setGameState(prevState => {
      if (prevState.craftingItem && prevState.heldItem) return prevState;

      let newState = { ...prevState };

      if (isCtrlClick) {
        newState = handleCtrlClick(newState, index);
      } else if (isRightClick) {
        newState = handleRightClick(newState, index);
      } else if (!isRightClick && mouseEvent === 'click') {
        newState = handleLeftClick(newState, index);
      }

      console.log('New state after interaction:', { 
        craftingItem: newState.craftingItem, 
        heldItem: newState.heldItem 
      });

      return newState;
    });
  }, [handleCtrlClick, handleRightClick, handleLeftClick]);

  // Utility functions
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
      const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
      const sortedItems = prevState.inventory
        .filter(item => item !== null)
        .sort((a, b) => {
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      const newInventory = [
        ...sortedItems,
        ...Array(prevState.inventory.length - sortedItems.length).fill(null)
      ];

      return { ...prevState, inventory: newInventory };
    });
  }, []);

  const takeAllFromPouch = useCallback(() => {
    setGameState(prevState => {
      let newInventory = [...prevState.inventory];
      let newPouch = [...prevState.pouch];
      let newBoxesInventory = [...prevState.boxesInventory];
      let itemsMoved = false;

      newPouch.forEach((pouchItem, pouchIndex) => {
        if (pouchItem) {
          let remainingCount = pouchItem.count || 1;

          if (pouchItem.id === 'box' && prevState.boxesUnlocked) {
            const boxesIndex = newBoxesInventory.findIndex(slot => slot === null);
            if (boxesIndex !== -1) {
              newBoxesInventory[boxesIndex] = pouchItem;
              newPouch[pouchIndex] = null;
              itemsMoved = true;
            }
          } else {
            // Try to add to existing stacks first
            for (let i = 0; i < newInventory.length && remainingCount > 0; i++) {
              if (newInventory[i] && newInventory[i].id === pouchItem.id && newInventory[i].stackable) {
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
                newInventory[emptySlotIndex] = {...pouchItem, count: remainingCount};
                remainingCount = 0;
              }
            }

            if (remainingCount === 0) {
              newPouch[pouchIndex] = null;
              itemsMoved = true;
            }
          }
        }
      });

      if (itemsMoved) {
        return {
          ...prevState,
          inventory: newInventory,
          pouch: newPouch,
          boxesInventory: newBoxesInventory
        };
      }

      return prevState;
    });
  }, []);

  const unlockBoxes = useCallback(() => {
    setGameState(prevState => {
      const shiniesCount = prevState.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);
      const unlockCost = 1000;

      if (shiniesCount >= unlockCost) {
        const newInventory = prevState.inventory.map(item => {
          if (item && item.id === 'shinies') {
            return { ...item, count: item.count - unlockCost };
          }
          return item;
        });

        return {
          ...prevState,
          inventory: newInventory,
          boxesUnlocked: true,
          boxesInventory: Array(INITIAL_BOXES_INVENTORY_SIZE).fill(null)
        };
      }
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
