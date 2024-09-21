import { useCallback } from 'react';
import { ITEMS, MAP_ITEM, RARITY } from '../constants';

const useInventory = (gameState, setGameState) => {
  const getItem = useCallback((index, state) => {
    if (typeof index === 'string') {
      if (index === 'activeSlot') return state.activeMap;
      if (index.startsWith('pouch_')) {
        const pouchIndex = parseInt(index.split('_')[1]);
        return state.pouch[pouchIndex];
      }
    }
    return state.inventory[index];
  }, []);

  const setItem = useCallback((state, index, item) => {
    if (typeof index === 'string') {
      if (index === 'activeSlot') {
        return { ...state, activeMap: item };
      }
      if (index.startsWith('pouch_')) {
        const pouchIndex = parseInt(index.split('_')[1]);
        const newPouch = [...state.pouch];
        newPouch[pouchIndex] = item;
        return { ...state, pouch: newPouch };
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
    return inventory.reduce((sum, item) => {
      return sum + (item && item.id === itemId ? item.count : 0);
    }, 0);
  }, []);

  const handleCtrlClick = useCallback((state, index) => {
    const item = getItem(index, state);
    if (!item) return state;

    if (typeof index === 'string') {
      if (index.startsWith('pouch_')) {
        const storageIndex = state.inventory.findIndex(slot => slot === null);
        if (storageIndex !== -1) {
          return setItem(setItem(state, index, null), storageIndex, item);
        }
      } else if (index === 'activeSlot') {
        const storageIndex = state.inventory.findIndex(slot => slot === null);
        if (storageIndex !== -1) {
          return setItem(setItem(state, 'activeSlot', null), storageIndex, item);
        }
      }
    } else if (typeof index === 'number') {
      if (item.isMapItem) {
        return setItem(setItem(state, index, null), 'activeSlot', item);
      }
    }

    return state;
  }, [getItem, setItem]);

  const isCraftingApplicable = useCallback((craftingItem, targetItem) => {
    // Check if the crafting item is a Modifying Prism and the target is a map
    return craftingItem.id === 'modifying_prism' && targetItem.isMapItem;
  }, []);

  const handleCraftingInteraction = useCallback((state, index) => {
    const material = state.craftingItem;
    const targetItem = getItem(index, state);
    console.log('Crafting interaction:', { material, targetItem });
    if (material && targetItem && isCraftingApplicable(material, targetItem)) {
      console.log('Crafting is applicable');
      const requiredAmount = 1; // Modifying Prism always requires 1
      const materialCount = countItem(state.inventory, material.id);
      if (materialCount >= requiredAmount) {
        console.log('Sufficient material for crafting');
        
        // Remove the used material from inventory
        const newInventory = removeItems(state.inventory, material.id, requiredAmount);
        
        // Implement map rarity upgrade logic
        const rarityOrder = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
        const currentRarityIndex = rarityOrder.findIndex(r => r.name === targetItem.rarity.name);
        const newRarity = rarityOrder[Math.min(currentRarityIndex + 1, rarityOrder.length - 1)];
        
        const upgradedMap = {
          ...targetItem,
          rarity: newRarity,
          name: `${newRarity.name} ${targetItem.name.split(' ').slice(1).join(' ')}`,
        };

        let updatedState = {
          ...state,
          inventory: newInventory,
          craftingItem: { ...material, sourceIndex: material.sourceIndex }, // Keep crafting mode on
          tooltipMessage: `Upgraded map to ${newRarity.name} rarity!`,
        };

        if (typeof index === 'string') {
          if (index.startsWith('pouch_')) {
            updatedState.pouch = state.pouch.map((item, i) => i === parseInt(index.split('_')[1]) ? upgradedMap : item);
          } else if (index === 'activeSlot') {
            updatedState.activeMap = upgradedMap;
          }
        } else {
          updatedState.inventory = updatedState.inventory.map((item, i) => i === index ? upgradedMap : item);
        }

        console.log('Crafting successful, updated state:', updatedState);
        return updatedState;
      } else {
        console.log('Insufficient material for crafting');
        return {
          ...state,
          tooltipMessage: `You need 1 ${material.name}`,
        };
      }
    }
    console.log('Crafting not applicable or failed');
    return state;
  }, [getItem, countItem, removeItems, isCraftingApplicable]);

  const handleItemInteraction = useCallback((index, isCtrlClick = false, isRightClick = false, mouseEvent = 'click') => {
    console.log(`Interaction: index=${index}, isCtrlClick=${isCtrlClick}, isRightClick=${isRightClick}, mouseEvent=${mouseEvent}`);
    
    setGameState(prevState => {
      console.log('Current state:', prevState);

      // Mutual exclusivity check
      if (prevState.craftingItem && prevState.heldItem) {
        console.log('Mutual exclusivity: Both craftingItem and heldItem are present');
        return prevState;
      }

      // Handle Ctrl+Click
      if (isCtrlClick) {
        console.log('Handling Ctrl+Click');
        if (prevState.craftingItem) {
          console.log('Cancelling crafting mode and performing regular ctrl+click action');
          return handleCtrlClick({ ...prevState, craftingItem: null }, index);
        }
        return handleCtrlClick(prevState, index);
      }

      // Handle Right-Click
      if (isRightClick) {
        console.log('Handling Right-Click');
        if (prevState.heldItem) {
          console.log('Item is held, doing nothing');
          return prevState;
        }
        if (prevState.craftingItem) {
          console.log('Cancelling crafting mode');
          return { ...prevState, craftingItem: null };
        } else {
          const clickedItem = getItem(index, prevState);
          console.log('Clicked item:', clickedItem);
          if (clickedItem && clickedItem.id === 'modifying_prism') {
            console.log('Entering crafting mode with Modifying Prism');
            return {
              ...prevState,
              craftingItem: { ...clickedItem, sourceIndex: index },
            };
          }
        }
        console.log('Right-click did not result in any action');
        return prevState;
      }

      // Handle Left-Click
      if (!isRightClick && mouseEvent === 'click') {
        console.log('Handling Left-Click');
        if (prevState.craftingItem) {
          console.log('Attempting to craft');
          return handleCraftingInteraction(prevState, index);
        }

        const clickedItem = getItem(index, prevState);
        console.log('Clicked item:', clickedItem);

        if (!prevState.heldItem) {
          console.log('No item held, attempting to pick up clicked item');
          if (clickedItem) {
            console.log('Picking up item:', clickedItem);
            return setItem({ ...prevState, heldItem: clickedItem }, index, null);
          } else {
            console.log('No item to pick up');
          }
        } else {
          console.log('Item is held, attempting to place or swap');
          if (!clickedItem) {
            console.log('Placing held item in empty slot');
            return setItem({ ...prevState, heldItem: null }, index, prevState.heldItem);
          } else if (clickedItem.id === prevState.heldItem.id && clickedItem.stackable) {
            console.log('Stacking items');
            const totalCount = clickedItem.count + prevState.heldItem.count;
            if (totalCount <= clickedItem.maxStack) {
              console.log('Stacking all items');
              return setItem({ ...prevState, heldItem: null }, index, { ...clickedItem, count: totalCount });
            } else {
              console.log('Partial stacking');
              const remainingCount = totalCount - clickedItem.maxStack;
              return setItem(
                { 
                  ...prevState, 
                  heldItem: { ...prevState.heldItem, count: remainingCount } 
                }, 
                index, 
                { ...clickedItem, count: clickedItem.maxStack }
              );
            }
          } else {
            console.log('Swapping items');
            return setItem({ ...prevState, heldItem: clickedItem }, index, prevState.heldItem);
          }
        }
      }

      console.log('No action taken, returning previous state');
      return prevState;
    });
  }, [getItem, setItem, handleCtrlClick, handleCraftingInteraction]);

  const addInventorySlot = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      inventory: [...prevState.inventory, null],
    }));
  }, []);

  const addPouchSlot = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      pouch: [...prevState.pouch, null],
    }));
  }, []);

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
      return prevState;
    });
  }, []);

  const getInventoryUpgradeCost = useCallback((currentUpgrades) => {
    return Math.floor(1 * Math.pow(4, currentUpgrades));
  }, []);

  const clearStorage = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      inventory: prevState.inventory.map(() => null),
    }));
  }, []);

  const sortStorage = useCallback(() => {
    setGameState(prevState => {
      console.log('Starting storage sorting');
      
      const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
      
      const sortedItems = prevState.inventory
        .filter(item => item !== null)
        .sort((a, b) => {
          console.log(`Comparing items: ${a.name} (${a.rarity.name}) and ${b.name} (${b.rarity.name})`);
          
          // First, sort by rarity
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) {
            console.log(`Sorted by rarity: ${rarityDiffA < rarityDiffB ? a.name : b.name} comes first`);
            return rarityDiffA - rarityDiffB;
          }
          
          // If rarity is the same, sort by name
          const nameDiff = a.name.localeCompare(b.name);
          console.log(`Sorted by name: ${nameDiff < 0 ? a.name : b.name} comes first`);
          return nameDiff;
        });

      console.log('Sorted items:', sortedItems.map(item => `${item.name} (${item.rarity.name})`));

      const newInventory = [
        ...sortedItems,
        ...Array(prevState.inventory.length - sortedItems.length).fill(null)
      ];

      console.log('New inventory:', newInventory.map(item => item ? `${item.name} (${item.rarity.name})` : 'empty'));

      return { ...prevState, inventory: newInventory };
    });
  }, []);

  const takeAllFromPouch = useCallback(() => {
    setGameState(prevState => {
      console.log('Taking all items from pouch');
      let newInventory = [...prevState.inventory];
      let newPouch = [...prevState.pouch];

      newPouch.forEach((pouchItem, pouchIndex) => {
        if (pouchItem) {
          console.log(`Processing pouch item: ${pouchItem.name}, count: ${pouchItem.count}`);
          let remainingCount = pouchItem.count;

          // First, try to add to existing stacks
          for (let i = 0; i < newInventory.length; i++) {
            if (newInventory[i] && newInventory[i].id === pouchItem.id && newInventory[i].stackable) {
              const spaceInStack = newInventory[i].maxStack - newInventory[i].count;
              const amountToAdd = Math.min(spaceInStack, remainingCount);
              newInventory[i].count += amountToAdd;
              remainingCount -= amountToAdd;
              console.log(`Added ${amountToAdd} to existing stack in inventory slot ${i}`);
              if (remainingCount === 0) break;
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
            newInventory[emptySlot] = { ...pouchItem, count: amountToAdd };
            remainingCount -= amountToAdd;
            console.log(`Added ${amountToAdd} to new stack in inventory slot ${emptySlot}`);
          }

          if (remainingCount === 0) {
            newPouch[pouchIndex] = null;
            console.log(`Removed item from pouch slot ${pouchIndex}`);
          } else {
            newPouch[pouchIndex] = { ...pouchItem, count: remainingCount };
            console.log(`Updated pouch slot ${pouchIndex} with remaining count: ${remainingCount}`);
          }
        }
      });

      console.log('Finished taking all items from pouch');
      return {
        ...prevState,
        inventory: newInventory,
        pouch: newPouch,
      };
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
  };
};

export default useInventory;
