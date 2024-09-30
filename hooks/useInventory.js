import { useCallback } from 'react';
import { ITEMS, MAP_ITEM } from '../constants';
import { getItem, setItem, removeItem } from './inventoryHelpers';
import { handleCtrlClick, handleRightClick, handleLeftClick } from './itemInteractions';
import { handleCraftingInteraction } from './craftingLogic';
import { getInventoryUpgradeCost, addInventorySlot, addPouchSlot, unlockBoxes } from './inventoryUpgrades';

const useInventory = (gameState, setGameState) => {
  const handleItemInteraction = useCallback((index, isCtrlClick, isRightClick, mouseEvent) => {
    setGameState(prevState => {
      if (prevState.craftingItem && prevState.heldItem) return prevState;

      let newState = { ...prevState };

      if (isCtrlClick) {
        newState = handleCtrlClick(newState, index);
      } else if (isRightClick) {
        newState = handleRightClick(newState, index);
      } else if (!isRightClick && mouseEvent === 'click') {
        newState = handleLeftClick(newState, index, handleCraftingInteraction);
      }

      return newState;
    });
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

  const spawnItem = useCallback((itemId) => {
    setGameState(prevState => {
      const itemToSpawn = [...ITEMS, MAP_ITEM].find(item => item.id === itemId);
      if (!itemToSpawn) return prevState;

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
    spawnItem,
  };
};

export default useInventory;
