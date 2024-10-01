import { useCallback, useState, useEffect } from 'react';
import { ITEMS, MAP_ITEM, RARITY } from '../constants';
import { getItem, setItem, removeItem } from './inventoryHelpers';
import { handleCtrlClick, handleRightClick, handleLeftClick } from './itemInteractions';
import { handleCraftingInteraction, initializeCraftableItems } from './craftingLogic';
import { getInventoryUpgradeCost, addInventorySlot as addInventorySlotUpgrade, addPouchSlot as addPouchSlotUpgrade, unlockBoxes } from './inventoryUpgrades';
import useBoxSystem from './useBoxSystem';
import { generateLockboxModifier } from './boxLootSystem';

const useInventory = (gameState, setGameState) => {
  const { openBox, takeAllFromBoxDrops, clearBoxDrops, useKeyOnLockbox } = useBoxSystem(gameState, setGameState);
  const [upgradedItem, setUpgradedItem] = useState(null);

  useEffect(() => {
    initializeCraftableItems();
  }, []);

  const handleItemInteraction = useCallback((index, isCtrlClick, isRightClick, mouseEvent, isShiftHeld) => {
    setGameState(prevState => {
      if (prevState.craftingItem && prevState.heldItem) return prevState;

      let newState = { ...prevState };

      if (isCtrlClick) {
        newState = handleCtrlClick(newState, index);
      } else if (isRightClick) {
        if (typeof index === 'string' && index.startsWith('boxes_')) {
          const boxIndex = parseInt(index.split('_')[1]);
          const item = newState.boxesInventory[boxIndex];
          if (item && (item.usable || item.id === 'simple_key')) {
            newState.craftingItem = item;
            newState.tooltipMessage = `${item.name} selected. Click on a ${item.id === 'simple_key' ? 'lockbox' : 'item'} to use it.`;
            return newState;
          }
        }
        newState = handleRightClick(newState, index);
      } else if (!isRightClick && mouseEvent === 'click') {
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
                  // If shift is held, keep the crafting item, but update its count
                  const updatedKey = newState.boxesInventory[keyIndex];
                  newState.craftingItem = updatedKey ? { ...updatedKey } : null;
                }
              } else {
                const result = handleCraftingInteraction(newState, index, isShiftHeld);
                newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
              }
            } else if (newState.heldItem && (newState.heldItem.id === 'box' || newState.heldItem.id === 'simple_lockbox' || newState.heldItem.id === 'simple_key')) {
              newState = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
            } else {
              return newState;
            }
          } else if (index.startsWith('boxDrops_')) {
            return newState;
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

      return newState;
    });
  }, [openBox, useKeyOnLockbox]);

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
    console.log('Spawning item:', itemId);
    setGameState(prevState => {
      const itemToSpawn = [...ITEMS, MAP_ITEM].find(item => item.id === itemId);
      console.log('Item to spawn:', itemToSpawn);
      if (!itemToSpawn) {
        console.log('Item not found');
        return prevState;
      }

      if ((itemToSpawn.id === 'box' || itemToSpawn.id === 'simple_lockbox' || itemToSpawn.id === 'simple_key') && prevState.boxesUnlocked) {
        console.log('Spawning box, lockbox, or key');
        const emptyBoxSlot = prevState.boxesInventory.findIndex(slot => slot === null);
        console.log('Empty box slot index:', emptyBoxSlot);
        if (emptyBoxSlot !== -1) {
          const newBoxesInventory = [...prevState.boxesInventory];
          let spawnedItem = { ...itemToSpawn, count: 1 };
          
          // Add a modifier if it's a lockbox
          if (itemToSpawn.id === 'simple_lockbox') {
            console.log('Spawning lockbox, generating modifier');
            const modifier = generateLockboxModifier();
            console.log('Generated modifier:', modifier);
            spawnedItem.modifiers = [modifier];
            spawnedItem.name = modifier.appendToEnd 
              ? `Lockbox ${modifier.name}`
              : `${modifier.name.replace('of ', '')} Lockbox`;
            console.log('Final lockbox name:', spawnedItem.name);
          }
          
          newBoxesInventory[emptyBoxSlot] = spawnedItem;
          console.log('Updated boxes inventory:', newBoxesInventory);
          return {
            ...prevState,
            boxesInventory: newBoxesInventory,
            discoveredItems: new Set([...prevState.discoveredItems, itemToSpawn.id]),
            tooltipMessage: `Spawned 1 ${spawnedItem.name} into boxes and keys inventory`
          };
        } else {
          console.log('No empty slots in boxes inventory');
          return {
            ...prevState,
            tooltipMessage: "No empty slots in boxes and keys inventory to spawn item!"
          };
        }
      } else {
        console.log('Spawning regular item');
        const emptySlot = prevState.inventory.findIndex(slot => slot === null);
        console.log('Empty inventory slot index:', emptySlot);
        if (emptySlot === -1) {
          console.log('No empty slots in inventory');
          return {
            ...prevState,
            tooltipMessage: "No empty slots in inventory to spawn item!"
          };
        }

        const newInventory = [...prevState.inventory];
        newInventory[emptySlot] = { ...itemToSpawn, count: 1 };
        console.log('Updated inventory:', newInventory);

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
  };
};

export default useInventory;