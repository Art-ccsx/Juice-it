import { useCallback, useState, useRef, useEffect } from 'react';
import { ITEMS, RARITY } from '../constants';
import { openBox as openBoxLoot } from './boxLootSystem';

const useBoxSystem = (gameState, setGameState) => {
  const [updatedBoxDrops, setUpdatedBoxDrops] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (pendingAction && !processingRef.current) {
      processingRef.current = true;
      
      setGameState(prevState => {
        let newState = { ...prevState };
        let loot = [];

        if (pendingAction.type === 'openBox') {
          const box = newState.boxesInventory[pendingAction.boxIndex];
          if (!box || box.id !== 'box') {
            console.log('Not a valid box, ignoring open request');
            processingRef.current = false;
            return prevState;
          }
          loot = openBoxLoot(box);
          newState.boxesInventory[pendingAction.boxIndex] = null;
        } else if (pendingAction.type === 'openLockbox') {
          const { keyIndex, lockboxIndex } = pendingAction;
          const key = newState.boxesInventory[keyIndex];
          const lockbox = newState.boxesInventory[lockboxIndex];
          if (!key || !lockbox || key.id !== 'simple_key' || lockbox.id !== 'simple_lockbox') {
            processingRef.current = false;
            return { ...prevState, tooltipMessage: "Invalid key or lockbox" };
          }
          loot = openBoxLoot(lockbox, [key]) || [];
          newState.boxesInventory[keyIndex] = key.count > 1 ? { ...key, count: key.count - 1 } : null;
          newState.boxesInventory[lockboxIndex] = null;
        }

        if (loot.length === 0) {
          processingRef.current = false;
          return { ...newState, tooltipMessage: "The box was empty!" };
        }

        const newBoxDrops = [...newState.boxDrops];
        const newUpdatedBoxDrops = {};

        loot.forEach(item => {
          const emptySlot = newBoxDrops.findIndex(slot => slot === null);
          if (emptySlot !== -1) {
            newBoxDrops[emptySlot] = item;
            newUpdatedBoxDrops[emptySlot] = item;
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
          ...newState,
          boxDrops: sortedBoxDrops,
          tooltipMessage: `Opened a ${pendingAction.type === 'openBox' ? 'box' : 'lockbox'} and received ${loot.length} items!`
        };
      });

      setPendingAction(null);
    }
  }, [pendingAction, setGameState]);

  const processBoxOpen = useCallback((boxIndex) => {
    setPendingAction({ type: 'openBox', boxIndex });
  }, []);

  const useKeyOnLockbox = useCallback((keyIndex, lockboxIndex) => {
    setPendingAction({ type: 'openLockbox', keyIndex, lockboxIndex });
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