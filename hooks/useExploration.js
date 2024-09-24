import { useCallback, useEffect } from 'react';
import { ITEMS, ENRICHING_JUICE_DROP_CHANCE, MODIFYING_PRISM_DROP_CHANCE, SHINIES_DROP_CHANCE, BOX_DROP_CHANCE } from '../constants';

const useExploration = (gameState, setGameState) => {
  const startExploration = useCallback(() => {
    if (!gameState.exploring && gameState.activeMap) {
      setGameState((prevState) => ({
        ...prevState,
        exploring: true,
        exploreProgress: 0,
        countdown: prevState.exploreTime,
        lootTicks: 0,
        // Don't set activeMap to null here
      }));
    }
  }, [gameState.exploring, gameState.activeMap, setGameState]);

  const processLootTick = useCallback(() => {
    const rand = Math.random();
    let discoveredItem = null;
    let additionalShinies = 0;
    let additionalJuice = 0;

    // Apply modifiers if there's an active map
    if (gameState.activeMap && gameState.activeMap.modifiers) {
      gameState.activeMap.modifiers.forEach(modifier => {
        switch (modifier.id) {
          case 'shinies_stack_boost':
            if (rand < SHINIES_DROP_CHANCE) {
              additionalShinies += modifier.value;
            }
            break;
          case 'juice_stack_boost':
            if (rand < ENRICHING_JUICE_DROP_CHANCE) {
              additionalJuice += modifier.value;
            }
            break;
          case 'total_shinies_boost':
            additionalShinies += modifier.value;
            break;
          case 'total_juice_boost':
            additionalJuice += modifier.value;
            break;
        }
      });
    }

    if (rand < ENRICHING_JUICE_DROP_CHANCE) {
      discoveredItem = { ...ITEMS.find(item => item.id === 'enriching_juice'), count: 1 + additionalJuice };
    } else if (rand < ENRICHING_JUICE_DROP_CHANCE + MODIFYING_PRISM_DROP_CHANCE) {
      discoveredItem = ITEMS.find(item => item.id === 'modifying_prism');
    } else if (rand < ENRICHING_JUICE_DROP_CHANCE + MODIFYING_PRISM_DROP_CHANCE + SHINIES_DROP_CHANCE) {
      discoveredItem = { ...ITEMS.find(item => item.id === 'shinies'), count: 1 + additionalShinies };
    } else if (gameState.boxesUnlocked && rand < ENRICHING_JUICE_DROP_CHANCE + MODIFYING_PRISM_DROP_CHANCE + SHINIES_DROP_CHANCE + BOX_DROP_CHANCE) {
      discoveredItem = ITEMS.find(item => item.id === 'box');
    }

    if (discoveredItem) {
      setGameState((prevState) => {
        const newPouch = [...prevState.pouch];
        let itemAdded = false;

        // Try to add to existing stack
        for (let i = 0; i < newPouch.length; i++) {
          if (newPouch[i] && newPouch[i].id === discoveredItem.id && newPouch[i].stackable) {
            if (newPouch[i].count < discoveredItem.maxStack) {
              newPouch[i] = {
                ...newPouch[i],
                count: Math.min(newPouch[i].count + discoveredItem.count, discoveredItem.maxStack)
              };
              itemAdded = true;
              break;
            }
          }
        }

        // If not added to existing stack, try to add to empty slot
        if (!itemAdded) {
          const emptySlot = newPouch.findIndex(slot => slot === null);
          if (emptySlot !== -1) {
            newPouch[emptySlot] = discoveredItem;
            itemAdded = true;
          }
        }

        if (itemAdded) {
          return {
            ...prevState,
            pouch: newPouch,
            discoveredItems: new Set([...prevState.discoveredItems, discoveredItem.id])
          };
        }
        return prevState;
      });
    }
  }, [gameState.activeMap, gameState.boxesUnlocked, setGameState]);

  const completeExploration = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      exploring: false,
      exploreProgress: 0,
      countdown: 0,
      lootTicks: 0,
      activeMap: null, // Remove the map when exploration is complete
    }));
  }, [setGameState]);

  const abandonExploration = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      exploring: false,
      exploreProgress: 0,
      countdown: 0,
      lootTicks: 0,
      activeMap: null, // Remove the map when exploration is abandoned
    }));
  }, [setGameState]);

  useEffect(() => {
    let timer;
    let lootTimer;
    if (gameState.exploring) {
      const startTime = Date.now();
      const duration = gameState.exploreTime * 1000; // Convert to milliseconds

      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min((elapsedTime / duration) * 100, 100);
        const remainingTime = Math.max((duration - elapsedTime) / 1000, 0);

        setGameState((prevState) => ({
          ...prevState,
          exploreProgress: progress,
          countdown: remainingTime,
        }));

        if (progress >= 100) {
          clearInterval(timer);
          clearInterval(lootTimer);
          completeExploration();
        }
      }, 100); // Update every 100ms for smooth progress

      lootTimer = setInterval(() => {
        processLootTick();
      }, 1000); // Process loot every 1 second
    }

    return () => {
      clearInterval(timer);
      clearInterval(lootTimer);
    };
  }, [gameState.exploring, gameState.exploreTime, setGameState, completeExploration, processLootTick]);

  return { startExploration, completeExploration, abandonExploration, processLootTick };
};

export default useExploration;