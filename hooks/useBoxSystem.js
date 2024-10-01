import { useCallback, useState, useRef } from 'react';
import { ITEMS, RARITY } from '../constants';
import { openBox as openBoxLoot } from './boxLootSystem';

const useBoxSystem = (gameState, setGameState) => {
  const [updatedBoxDrops, setUpdatedBoxDrops] = useState({});
  const processingRef = useRef(false);

  const processBoxOpen = useCallback((boxIndex, keys = []) => {
    if (processingRef.current) return;
    processingRef.current = true;

    setGameState(prevState => {
      const newBoxesInventory = [...prevState.boxesInventory];
      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};
      
      const box = newBoxesInventory[boxIndex];
      if (!box) {
        processingRef.current = false;
        return prevState;
      }
      newBoxesInventory[boxIndex] = null;

      const loot = openBoxLoot(box, keys) || [];

      if (loot.length === 0) {
        processingRef.current = false;
        return {
          ...prevState,
          boxesInventory: newBoxesInventory,
          tooltipMessage: "The box was empty!"
        };
      }

      loot.forEach(item => {
        if (item.id !== 'box') {
          const existingItemIndex = newBoxDrops.findIndex(slot => slot && slot.id === item.id);
          if (existingItemIndex !== -1) {
            const existingItem = newBoxDrops[existingItemIndex];
            const newCount = Math.min(existingItem.count + item.count, existingItem.maxStack);
            newBoxDrops[existingItemIndex] = { ...existingItem, count: newCount };
            newUpdatedBoxDrops[existingItemIndex] = newBoxDrops[existingItemIndex];
          } else {
            const emptySlot = newBoxDrops.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
              newBoxDrops[emptySlot] = item;
              newUpdatedBoxDrops[emptySlot] = item;
            }
          }
        }
      });

      const sortedBoxDrops = newBoxDrops
        .filter(item => item !== null)
        .sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      while (sortedBoxDrops.length < newBoxDrops.length) {
        sortedBoxDrops.push(null);
      }

      setUpdatedBoxDrops(newUpdatedBoxDrops);
      processingRef.current = false;

      return {
        ...prevState,
        boxesInventory: newBoxesInventory,
        boxDrops: sortedBoxDrops,
        tooltipMessage: `Opened a box and received ${loot.length} items!`
      };
    });
  }, [setGameState]);

  const openBox = useCallback((index) => {
    if (!processingRef.current) {
      const box = gameState.boxesInventory[index];
      if (!box) {
        setGameState(prevState => ({
          ...prevState,
          tooltipMessage: "Invalid box"
        }));
        return;
      }
      if (box.id === 'simple_lockbox') {
        const keyIndex = gameState.boxesInventory.findIndex(item => item && item.id === 'simple_key');
        if (keyIndex === -1) {
          setGameState(prevState => ({
            ...prevState,
            tooltipMessage: "You need a simple key to open this lockbox!"
          }));
          return;
        }
        const key = gameState.boxesInventory[keyIndex];
        processBoxOpen(index, [key]);
      } else {
        processBoxOpen(index);
      }
    }
  }, [gameState.boxesInventory, processBoxOpen]);

  const useKeyOnLockbox = useCallback((keyIndex, lockboxIndex) => {
    console.log('useKeyOnLockbox called with:', { keyIndex, lockboxIndex });
    setGameState(prevState => {
      const key = prevState.boxesInventory[keyIndex];
      const lockbox = prevState.boxesInventory[lockboxIndex];

      console.log('Key:', key);
      console.log('Lockbox:', lockbox);

      if (!key || !lockbox || key.id !== 'simple_key' || lockbox.id !== 'simple_lockbox') {
        console.log('Invalid key or lockbox:', { key, lockbox });
        return {
          ...prevState,
          tooltipMessage: "Invalid key or lockbox"
        };
      }

      console.log('Valid key and lockbox, proceeding to open');

      // Process the box opening with the key
      const loot = openBoxLoot(lockbox, [key]) || [];
      console.log('Loot generated:', loot);

      // Remove one key from the stack or remove the key if it's the last one
      const newBoxesInventory = [...prevState.boxesInventory];
      if (key.count > 1) {
        newBoxesInventory[keyIndex] = { ...key, count: key.count - 1 };
      } else {
        newBoxesInventory[keyIndex] = null;
      }
      newBoxesInventory[lockboxIndex] = null; // Remove the lockbox

      console.log('Updated boxes inventory:', newBoxesInventory);

      // Add loot to box drops
      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};

      loot.forEach(item => {
        if (item.id !== 'box') {
          const existingItemIndex = newBoxDrops.findIndex(slot => slot && slot.id === item.id);
          if (existingItemIndex !== -1) {
            const existingItem = newBoxDrops[existingItemIndex];
            const newCount = Math.min(existingItem.count + item.count, existingItem.maxStack);
            newBoxDrops[existingItemIndex] = { ...existingItem, count: newCount };
            newUpdatedBoxDrops[existingItemIndex] = newBoxDrops[existingItemIndex];
          } else {
            const emptySlot = newBoxDrops.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
              newBoxDrops[emptySlot] = item;
              newUpdatedBoxDrops[emptySlot] = item;
            }
          }
        }
      });

      console.log('Updated box drops:', newBoxDrops);

      // Sort box drops
      const sortedBoxDrops = newBoxDrops
        .filter(item => item !== null)
        .sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      while (sortedBoxDrops.length < newBoxDrops.length) {
        sortedBoxDrops.push(null);
      }

      setUpdatedBoxDrops(newUpdatedBoxDrops);

      console.log('Final state update:', {
        boxesInventory: newBoxesInventory,
        boxDrops: sortedBoxDrops,
        tooltipMessage: `Opened a lockbox and received ${loot.length} items!`
      });

      return {
        ...prevState,
        boxesInventory: newBoxesInventory,
        boxDrops: sortedBoxDrops,
        tooltipMessage: `Opened a lockbox and received ${loot.length} items!`
      };
    });
  }, [openBoxLoot, setUpdatedBoxDrops]);

  const takeAllFromBoxDrops = useCallback(() => {
    setGameState(prevState => {
      let newInventory = [...prevState.inventory];
      let newBoxDrops = [...prevState.boxDrops];
      let itemsMoved = false;

      newBoxDrops.forEach((boxDropItem, boxDropIndex) => {
        if (boxDropItem) {
          let remainingCount = boxDropItem.count;

          // Try to add to existing stacks first
          for (let i = 0; i < newInventory.length && remainingCount > 0; i++) {
            if (newInventory[i] && newInventory[i].id === boxDropItem.id && newInventory[i].stackable) {
              const spaceInStack = newInventory[i].maxStack - newInventory[i].count;
              const amountToAdd = Math.min(spaceInStack, remainingCount);
              newInventory[i] = {
                ...newInventory[i],
                count: newInventory[i].count + amountToAdd
              };
              remainingCount -= amountToAdd;
            }
          }

          // If there are still items remaining, find empty slots
          while (remainingCount > 0) {
            const emptySlotIndex = newInventory.findIndex(slot => slot === null);
            if (emptySlotIndex !== -1) {
              const amountToAdd = Math.min(boxDropItem.maxStack, remainingCount);
              newInventory[emptySlotIndex] = {...boxDropItem, count: amountToAdd};
              remainingCount -= amountToAdd;
            } else {
              break;
            }
          }

          // If all items were moved, set the box drop slot to null
          if (remainingCount === 0) {
            newBoxDrops[boxDropIndex] = null;
            itemsMoved = true;
          } else if (remainingCount < boxDropItem.count) {
            // If some items were moved, update the count
            newBoxDrops[boxDropIndex] = {...boxDropItem, count: remainingCount};
            itemsMoved = true;
          }
        }
      });

      if (itemsMoved) {
        // Remove all null entries and sort the remaining items
        newBoxDrops = newBoxDrops.filter(item => item !== null);
        newBoxDrops.sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

        // Fill the rest with null
        while (newBoxDrops.length < prevState.boxDrops.length) {
          newBoxDrops.push(null);
        }

        return {
          ...prevState,
          inventory: newInventory,
          boxDrops: newBoxDrops
        };
      }

      return prevState;
    });
  }, []);

  const clearBoxDrops = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      boxDrops: Array(prevState.boxDrops.length).fill(null)
    }));
  }, []);

  return {
    openBox,
    takeAllFromBoxDrops,
    clearBoxDrops,
    updatedBoxDrops,
    setUpdatedBoxDrops,
    useKeyOnLockbox
  };
};

export default useBoxSystem;