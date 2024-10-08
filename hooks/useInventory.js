import { useCallback, useState, useEffect } from 'react';
import { ITEMS, MAP_ITEM, RARITY } from '../constants';
import { getItem, setItem, removeItem } from './inventoryHelpers';
import { handleCtrlClick, handleRightClick, handleLeftClick } from './itemInteractions';
import { handleCraftingInteraction, initializeCraftableItems } from './craftingLogic';
import { getInventoryUpgradeCost, addInventorySlot as addInventorySlotUpgrade, addPouchSlot as addPouchSlotUpgrade, unlockBoxes } from './inventoryUpgrades';
import useBoxSystem from './useBoxSystem';
import { generateLockboxModifier, generateKeyModifier } from './boxLootSystem';

const useInventory = (gameState, setGameState) => {
  const { openBox, takeAllFromBoxDrops, clearBoxDrops, useKeyOnLockbox } = useBoxSystem(gameState, setGameState);
  const [upgradedItem, setUpgradedItem] = useState(null);

  useEffect(() => {
    initializeCraftableItems();
  }, []);

  const upgradeKey = useCallback((keyIndex) => {
    return setGameState(prevState => {
      const key = prevState.boxesInventory[keyIndex];
      if (!key || key.id !== 'simple_key' || key.rarity.name !== 'Common') {
        return prevState;
      }

      const modifier = generateKeyModifier();
      const upgradedKey = {
        ...key,
        rarity: RARITY.UNCOMMON,
        modifiers: [modifier],
        name: modifier.appendToEnd ? `Key ${modifier.name}` : `${modifier.name.replace('of ', '')} Key`,
      };

      const newBoxesInventory = [...prevState.boxesInventory];
      newBoxesInventory[keyIndex] = upgradedKey;

      return {
        ...prevState,
        boxesInventory: newBoxesInventory,
      };
    });
  }, []);

  const handleItemInteraction = useCallback((index, isCtrlClick, isRightClick, mouseEvent, isShiftHeld) => {
    console.log('handleItemInteraction called:', { index, isCtrlClick, isRightClick, mouseEvent, isShiftHeld });
    
    setGameState(prevState => {
      console.log('setGameState in handleItemInteraction, current state:', prevState);
      
      if (prevState.craftingItem && prevState.heldItem) return prevState;

      let newState = { ...prevState };

      // Remove the check for duplicate actions
      // const actionKey = `${index}-${isCtrlClick}-${isRightClick}-${mouseEvent}`;
      // if (newState.lastProcessedAction === actionKey) {
      //   console.log('Duplicate action detected, ignoring');
      //   return prevState;
      // }
      // newState.lastProcessedAction = actionKey;

      if (isCtrlClick) {
        newState = handleCtrlClick(newState, index);
      } else if (isRightClick) {
        console.log('Right-click detected in handleItemInteraction');
        if (typeof index === 'string' && index.startsWith('boxes_')) {
          const boxIndex = parseInt(index.split('_')[1]);
          const item = newState.boxesInventory[boxIndex];
          console.log('Right-clicked item in boxes inventory:', item);
          if (item && (item.usable || item.id === 'simple_key')) {
            console.log('Setting craftingItem:', item);
            newState.craftingItem = item;
            return newState;
          }
        }
        newState = handleRightClick(newState, index);
      } else if (!isRightClick && mouseEvent === 'click') {
        if (newState.craftingItem && newState.craftingItem.id === 'modifying_prism') {
          if (typeof index === 'string' && index.startsWith('boxes_')) {
            const boxIndex = parseInt(index.split('_')[1]);
            const item = newState.boxesInventory[boxIndex];
            if (item && item.id === 'simple_key' && item.rarity.name === 'Common') {
              upgradeKey(boxIndex);
              const prismIndex = newState.inventory.findIndex(i => i && i.id === 'modifying_prism');
              if (prismIndex !== -1) {
                newState.inventory[prismIndex].count -= 1;
                if (newState.inventory[prismIndex].count === 0) {
                  newState.inventory[prismIndex] = null;
                }
              }
              if (!isShiftHeld) {
                newState.craftingItem = null;
              } else if (newState.inventory[prismIndex]) {
                newState.craftingItem = { ...newState.inventory[prismIndex] };
              } else {
                newState.craftingItem = null;
              }
              return newState;
            } else {
              if (!isShiftHeld) {
                newState.craftingItem = null;
              }
              return newState;
            }
          }
        }
        // Handle other click interactions
        if (typeof index === 'string') {
          if (index.startsWith('boxes_')) {
            const boxIndex = parseInt(index.split('_')[1]);
            const item = newState.boxesInventory[boxIndex];
            if (item && item.id === 'box') {
              openBox(boxIndex);
            } else if (newState.craftingItem) {
              if (newState.craftingItem.id === 'simple_key' && item && item.id === 'simple_lockbox') {
                const keyIndex = newState.boxesInventory.findIndex(i => i && i.id === 'simple_key');
                useKeyOnLockbox(keyIndex, boxIndex);
                if (!isShiftHeld) {
                  newState.craftingItem = null;
                } else {
                  const updatedKey = newState.boxesInventory[keyIndex];
                  newState.craftingItem = updatedKey ? { ...updatedKey } : null;
                }
              } else {
                const result = handleCraftingInteraction(newState, index, isShiftHeld);
                newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
              }
            } else if (newState.heldItem && (newState.heldItem.id === 'box' || newState.heldItem.id === 'simple_lockbox' || newState.heldItem.id === 'simple_key')) {
              newState = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
            }
          } else if (index.startsWith('boxDrops_')) {
            // Handle box drops interactions if needed
          } else {
            // This is for the main inventory or other non-box inventories
            if (newState.craftingItem && newState.craftingItem.usable) {
              const result = handleCraftingInteraction(newState, index, isShiftHeld);
              newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
            } else {
              newState = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
            }
          }
        } else {
          // This is for numeric indices (main inventory)
          if (newState.craftingItem && newState.craftingItem.usable) {
            const result = handleCraftingInteraction(newState, index, isShiftHeld);
            newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
          } else {
            newState = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
          }
        }
      }

      if (newState.upgradedItem) {
        setUpgradedItem({
          ...newState.upgradedItem,
          position: document.querySelector(`[data-index="${newState.upgradedItem.index}"]`)?.getBoundingClientRect()
        });
        delete newState.upgradedItem;
      }

      console.log('Final state after handleItemInteraction:', newState);
      return newState;
    });
  }, [openBox, useKeyOnLockbox, upgradeKey]);

  const getMap = useCallback(() => {
    setGameState(prevState => {
      const emptySlot = prevState.inventory.findIndex(slot => slot === null);
      if (emptySlot !== -1) {
        const newInventory = [...prevState.inventory];
        newInventory[emptySlot] = { ...MAP_ITEM, name: 'Map', count: 1 }; // Changed from MAP_ITEM.name to just 'Map'
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
      inventory: Array(prevState.inventory.length).fill(null),
      pouch: Array(prevState.pouch.length).fill(null),
      boxesInventory: Array(prevState.boxesInventory.length).fill(null), // Clear boxes inventory
      boxDrops: Array(prevState.boxDrops.length).fill(null), // Clear box drops
    }));
  }, [setGameState]);

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

          if ((pouchItem.id === 'box' || pouchItem.id === 'simple_lockbox' || pouchItem.id === 'simple_key') && prevState.boxesUnlocked) {
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

  const spawnItem = useCallback((itemId) => {
    setGameState(prevState => {
      const itemToSpawn = [...ITEMS, MAP_ITEM].find(item => item.id === itemId);
      if (!itemToSpawn) {
        return prevState;
      }

      if ((itemToSpawn.id === 'box' || itemToSpawn.id === 'simple_lockbox' || itemToSpawn.id === 'simple_key') && prevState.boxesUnlocked) {
        const emptyBoxSlot = prevState.boxesInventory.findIndex(slot => slot === null);
        if (emptyBoxSlot !== -1) {
          const newBoxesInventory = [...prevState.boxesInventory];
          let spawnedItem = { ...itemToSpawn, count: 1 };
          
          if (itemToSpawn.id === 'simple_lockbox') {
            const modifier = generateLockboxModifier();
            spawnedItem.modifiers = [modifier];
            spawnedItem.name = modifier.appendToEnd 
              ? `Lockbox ${modifier.name}`
              : `${modifier.name.replace('of ', '')} Lockbox`;
          }
          
          newBoxesInventory[emptyBoxSlot] = spawnedItem;
          return {
            ...prevState,
            boxesInventory: newBoxesInventory,
            discoveredItems: new Set([...prevState.discoveredItems, itemToSpawn.id]),
            tooltipMessage: `Spawned 1 ${spawnedItem.name} into boxes and keys inventory`
          };
        } else {
          return {
            ...prevState,
            tooltipMessage: "No empty slots in boxes and keys inventory to spawn item!"
          };
        }
      } else {
        const newInventory = [...prevState.inventory];
        
        if (itemToSpawn.stackable) {
          const existingStackIndex = newInventory.findIndex(item => item && item.id === itemToSpawn.id && item.count < item.maxStack);
          if (existingStackIndex !== -1) {
            newInventory[existingStackIndex] = {
              ...newInventory[existingStackIndex],
              count: Math.min(newInventory[existingStackIndex].count + 1, itemToSpawn.maxStack)
            };
            return {
              ...prevState,
              inventory: newInventory,
              discoveredItems: new Set([...prevState.discoveredItems, itemToSpawn.id]),
              tooltipMessage: `Added 1 ${itemToSpawn.name} to existing stack`
            };
          }
        }
        
        const emptySlot = newInventory.findIndex(slot => slot === null);
        if (emptySlot === -1) {
          return {
            ...prevState,
            tooltipMessage: "No empty slots in inventory to spawn item!"
          };
        }

        newInventory[emptySlot] = { ...itemToSpawn, count: 1 };

        return {
          ...prevState,
          inventory: newInventory,
          discoveredItems: new Set([...prevState.discoveredItems, itemToSpawn.id]),
          tooltipMessage: `Spawned 1 ${itemToSpawn.name} into inventory`
        };
      }
    });
  }, []);

  const addInventorySlot = useCallback(() => {
    addInventorySlotUpgrade(gameState, setGameState);
  }, [gameState, setGameState]);

  const addPouchSlot = useCallback(() => {
    addPouchSlotUpgrade(gameState, setGameState);
  }, [gameState, setGameState]);

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
    spawnItem,
    openBox,
    takeAllFromBoxDrops,
    clearBoxDrops,
    upgradedItem,
    setUpgradedItem,
    upgradeKey,
  };
};

export default useInventory;