import { useCallback, useState } from 'react';
import { ITEMS, MAP_ITEM, RARITY } from '../constants';
import { getItem, setItem, removeItem } from './inventoryHelpers';
import { handleCtrlClick, handleRightClick, handleLeftClick } from './itemInteractions';
import { handleCraftingInteraction } from './craftingLogic';
import { getInventoryUpgradeCost, addInventorySlot as addInventorySlotUpgrade, addPouchSlot as addPouchSlotUpgrade, unlockBoxes } from './inventoryUpgrades';
import useBoxSystem from './useBoxSystem';

const useInventory = (gameState, setGameState) => {
  const { openBox, takeAllFromBoxDrops, clearBoxDrops, useKeyOnLockbox } = useBoxSystem(gameState, setGameState);
  const [upgradedItem, setUpgradedItem] = useState(null);

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
          if (item && item.id === 'simple_key') {
            newState.craftingItem = item;
            newState.tooltipMessage = "Key selected. Click on a lockbox to open it.";
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
            } else if (newState.craftingItem && newState.craftingItem.id === 'simple_key' && item && item.id === 'simple_lockbox') {
              const keyIndex = newState.boxesInventory.findIndex(i => i && i.id === 'simple_key');
              useKeyOnLockbox(keyIndex, boxIndex);
              newState.craftingItem = null;
            } else if (newState.heldItem && (newState.heldItem.id === 'box' || newState.heldItem.id === 'simple_lockbox' || newState.heldItem.id === 'simple_key')) {
              newState = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
            } else {
              return newState;
            }
          } else if (index.startsWith('boxDrops_')) {
            return newState;
          } else {
            const result = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
            newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
          }
        } else {
          const result = handleLeftClick(newState, index, (state, idx) => handleCraftingInteraction(state, idx, isShiftHeld));
          newState = result.continueCrafting ? { ...result, craftingItem: newState.craftingItem } : result;
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
      if (!itemToSpawn) return prevState;

      if ((itemToSpawn.id === 'box' || itemToSpawn.id === 'simple_lockbox' || itemToSpawn.id === 'simple_key') && prevState.boxesUnlocked) {
        const emptyBoxSlot = prevState.boxesInventory.findIndex(slot => slot === null);
        if (emptyBoxSlot !== -1) {
          const newBoxesInventory = [...prevState.boxesInventory];
          newBoxesInventory[emptyBoxSlot] = { ...itemToSpawn, count: 1 };
          return {
            ...prevState,
            boxesInventory: newBoxesInventory,
            discoveredItems: new Set([...prevState.discoveredItems, itemToSpawn.id]),
            tooltipMessage: `Spawned 1 ${itemToSpawn.name} into boxes and keys inventory`
          };
        } else {
          return {
            ...prevState,
            tooltipMessage: "No empty slots in boxes and keys inventory to spawn item!"
          };
        }
      } else {
        const emptySlot = prevState.inventory.findIndex(slot => slot === null);
        if (emptySlot === -1) {
          return {
            ...prevState,
            tooltipMessage: "No empty slots in inventory to spawn item!"
          };
        }

        const newInventory = [...prevState.inventory];
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
  };
};

export default useInventory;