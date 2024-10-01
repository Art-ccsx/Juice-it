import { useCallback, useState, useRef } from 'react';
import { ITEMS, RARITY } from '../constants';
import { openBox as openBoxLoot } from './boxLootSystem';

const useBoxSystem = (gameState, setGameState) => {
  const [updatedBoxDrops, setUpdatedBoxDrops] = useState({});
  const processingRef = useRef(false);

  const processBoxOpen = useCallback((boxIndex) => {
    if (processingRef.current) return;
    processingRef.current = true;

    setGameState(prevState => {
      const newBoxesInventory = [...prevState.boxesInventory];
      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};
      
      const box = newBoxesInventory[boxIndex];
      console.log('Opening box:', box);
      if (!box) {
        console.log('No box found at index:', boxIndex);
        processingRef.current = false;
        return prevState;
      }
      newBoxesInventory[boxIndex] = null;

      const loot = openBoxLoot(box);
      console.log('Loot generated:', loot);

      if (loot.length === 0) {
        console.log('Box was empty');
        processingRef.current = false;
        return {
          ...prevState,
          boxesInventory: newBoxesInventory,
          tooltipMessage: "The box was empty!"
        };
      }

      loot.forEach((item, index) => {
        console.log(`Processing loot item ${index}:`, item);
        const emptyDropSlot = newBoxDrops.findIndex(slot => slot === null);
        if (emptyDropSlot !== -1) {
          console.log(`Adding ${item.id} to box drops at index:`, emptyDropSlot);
          newBoxDrops[emptyDropSlot] = item;
          newUpdatedBoxDrops[emptyDropSlot] = item;
        } else {
          console.log(`No empty slot in box drops, ${item.id} is lost`);
        }
      });

      console.log('New box drops before sorting:', newBoxDrops);

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

      console.log('Sorted box drops:', sortedBoxDrops);
      console.log('Updated boxes inventory:', newBoxesInventory);
      console.log('Updated box drops:', sortedBoxDrops);
      console.log('New updated box drops:', newUpdatedBoxDrops);

      setUpdatedBoxDrops(newUpdatedBoxDrops);
      processingRef.current = false;

      const finalState = {
        ...prevState,
        boxesInventory: newBoxesInventory,
        boxDrops: sortedBoxDrops,
        tooltipMessage: `Opened a box and received ${loot.length} items!`
      };

      console.log('Final state update:', finalState);

      return finalState;
    });
  }, [setGameState]);

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

      const loot = openBoxLoot(lockbox, [key]) || [];
      console.log('Loot generated:', loot);

      const newBoxesInventory = [...prevState.boxesInventory];
      if (key.count > 1) {
        newBoxesInventory[keyIndex] = { ...key, count: key.count - 1 };
      } else {
        newBoxesInventory[keyIndex] = null;
      }
      newBoxesInventory[lockboxIndex] = null;

      console.log('Updated boxes inventory:', newBoxesInventory);

      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};

      loot.forEach(item => {
        const emptySlot = newBoxDrops.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
          newBoxDrops[emptySlot] = item;
          newUpdatedBoxDrops[emptySlot] = item;
        } else {
          console.log(`No empty slot in box drops, ${item.id} is lost`);
        }
      });

      console.log('Updated box drops:', newBoxDrops);

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
  }, []);

  const takeAllFromBoxDrops = useCallback(() => {
    setGameState(prevState => {
      let newInventory = [...prevState.inventory];
      let newBoxDrops = [...prevState.boxDrops];
      let newBoxesInventory = [...prevState.boxesInventory];
      let itemsMoved = false;

      newBoxDrops.forEach((boxDropItem, boxDropIndex) => {
        if (boxDropItem) {
          let remainingCount = boxDropItem.count;

          if (boxDropItem.id === 'box' || boxDropItem.id === 'simple_lockbox' || boxDropItem.id === 'simple_key') {
            // Move boxes and keys to boxesInventory
            while (remainingCount > 0) {
              const emptySlotIndex = newBoxesInventory.findIndex(slot => slot === null);
              if (emptySlotIndex !== -1) {
                const amountToAdd = Math.min(boxDropItem.maxStack || 1, remainingCount);
                newBoxesInventory[emptySlotIndex] = {...boxDropItem, count: amountToAdd};
                remainingCount -= amountToAdd;
                itemsMoved = true;
              } else {
                break; // No more space in boxesInventory
              }
            }
          } else {
            // Handle other items as before
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
                itemsMoved = true;
              }
            }

            // If there are still items remaining, find empty slots
            while (remainingCount > 0) {
              const emptySlotIndex = newInventory.findIndex(slot => slot === null);
              if (emptySlotIndex !== -1) {
                const amountToAdd = Math.min(boxDropItem.maxStack, remainingCount);
                newInventory[emptySlotIndex] = {...boxDropItem, count: amountToAdd};
                remainingCount -= amountToAdd;
                itemsMoved = true;
              } else {
                break;
              }
            }
          }

          if (remainingCount === 0) {
            newBoxDrops[boxDropIndex] = null;
          } else if (remainingCount < boxDropItem.count) {
            newBoxDrops[boxDropIndex] = {...boxDropItem, count: remainingCount};
          }
        }
      });

      if (itemsMoved) {
        newBoxDrops = newBoxDrops.filter(item => item !== null);
        newBoxDrops.sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

        while (newBoxDrops.length < prevState.boxDrops.length) {
          newBoxDrops.push(null);
        }

        return {
          ...prevState,
          inventory: newInventory,
          boxesInventory: newBoxesInventory,
          boxDrops: newBoxDrops,
          tooltipMessage: "Items moved from box drops"
        };
      }

      return {
        ...prevState,
        tooltipMessage: "No items to move from box drops"
      };
    });
  }, []);

  const clearBoxDrops = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      boxDrops: Array(prevState.boxDrops.length).fill(null)
    }));
  }, []);

  return {
    openBox: processBoxOpen,
    takeAllFromBoxDrops,
    clearBoxDrops,
    updatedBoxDrops,
    setUpdatedBoxDrops,
    useKeyOnLockbox
  };
};

export default useBoxSystem;