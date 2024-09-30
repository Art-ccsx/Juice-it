import { useCallback, useState } from 'react';
import { ITEMS, RARITY } from '../constants';

const useBoxSystem = (gameState, setGameState) => {
  const [updatedBoxDrops, setUpdatedBoxDrops] = useState({});

  const openBox = useCallback((index) => {
    setGameState(prevState => {
      const newBoxesInventory = [...prevState.boxesInventory];
      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};
      
      // Remove the box from the boxes inventory
      const box = newBoxesInventory[index];
      newBoxesInventory[index] = null;

      // Generate loot (this is a placeholder, you should implement your own loot generation logic)
      const loot = generateBoxLoot();

      // Add loot to box drops inventory (stacked and sorted)
      loot.forEach(item => {
        if (item.id !== 'box') { // Prevent boxes from dropping boxes
          const existingItemIndex = newBoxDrops.findIndex(slot => slot && slot.id === item.id);
          if (existingItemIndex !== -1) {
            // Stack with existing item
            const existingItem = newBoxDrops[existingItemIndex];
            const newCount = Math.min(existingItem.count + item.count, existingItem.maxStack);
            newBoxDrops[existingItemIndex] = { ...existingItem, count: newCount };
            newUpdatedBoxDrops[existingItemIndex] = newBoxDrops[existingItemIndex];
          } else {
            // Add new item
            const emptySlot = newBoxDrops.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
              newBoxDrops[emptySlot] = item;
              newUpdatedBoxDrops[emptySlot] = item;
            }
          }
        }
      });

      // Sort box drops inventory
      const sortedBoxDrops = newBoxDrops
        .filter(item => item !== null)
        .sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      // Fill the rest with null
      while (sortedBoxDrops.length < newBoxDrops.length) {
        sortedBoxDrops.push(null);
      }

      setUpdatedBoxDrops(newUpdatedBoxDrops);

      return {
        ...prevState,
        boxesInventory: newBoxesInventory,
        boxDrops: sortedBoxDrops,
        tooltipMessage: `Opened a box and received ${loot.length} items!`
      };
    });
  }, []);

  const useKeyOnLockbox = useCallback((keyIndex, lockboxIndex) => {
    setGameState(prevState => {
      const newBoxesInventory = [...prevState.boxesInventory];
      const newBoxDrops = [...prevState.boxDrops];
      const newUpdatedBoxDrops = {};
      
      const key = newBoxesInventory[keyIndex];
      const lockbox = newBoxesInventory[lockboxIndex];

      if (key.id !== 'simple_key' || lockbox.id !== 'simple_lockbox') {
        return {
          ...prevState,
          tooltipMessage: "Invalid key or lockbox"
        };
      }

      // Remove the key and lockbox
      newBoxesInventory[keyIndex] = null;
      newBoxesInventory[lockboxIndex] = null;

      // Generate loot (you can modify this to have different loot for lockboxes)
      const loot = generateBoxLoot();

      // Add loot to box drops inventory (similar to openBox logic)
      loot.forEach(item => {
        if (item.id !== 'box') { // Prevent boxes from dropping boxes
          const existingItemIndex = newBoxDrops.findIndex(slot => slot && slot.id === item.id);
          if (existingItemIndex !== -1) {
            // Stack with existing item
            const existingItem = newBoxDrops[existingItemIndex];
            const newCount = Math.min(existingItem.count + item.count, existingItem.maxStack);
            newBoxDrops[existingItemIndex] = { ...existingItem, count: newCount };
            newUpdatedBoxDrops[existingItemIndex] = newBoxDrops[existingItemIndex];
          } else {
            // Add new item
            const emptySlot = newBoxDrops.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
              newBoxDrops[emptySlot] = item;
              newUpdatedBoxDrops[emptySlot] = item;
            }
          }
        }
      });

      // Sort box drops inventory
      const sortedBoxDrops = newBoxDrops
        .filter(item => item !== null)
        .sort((a, b) => {
          const rarityOrder = [RARITY.LEGENDARY, RARITY.EPIC, RARITY.RARE, RARITY.UNCOMMON, RARITY.COMMON];
          const rarityDiffA = rarityOrder.findIndex(r => r.name === a.rarity.name);
          const rarityDiffB = rarityOrder.findIndex(r => r.name === b.rarity.name);
          if (rarityDiffA !== rarityDiffB) return rarityDiffA - rarityDiffB;
          return a.name.localeCompare(b.name);
        });

      // Fill the rest with null
      while (sortedBoxDrops.length < newBoxDrops.length) {
        sortedBoxDrops.push(null);
      }

      setUpdatedBoxDrops(newUpdatedBoxDrops);

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

// Placeholder function for generating box loot
const generateBoxLoot = () => {
  // This is a simple placeholder. You should implement your own loot generation logic.
  const lootCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
  return Array(lootCount).fill().map(() => {
    const item = {...ITEMS[Math.floor(Math.random() * (ITEMS.length - 1))]}; // Exclude the last item (box) to prevent boxes from dropping boxes
    item.count = Math.floor(Math.random() * 5) + 1;
    return item;
  });
};

export default useBoxSystem;