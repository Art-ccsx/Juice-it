import { useState, useCallback, useEffect, useRef } from 'react';
import useLootSystem from './useLootSystem';

const TICKS_PER_EXPLORATION = 100;
const TICK_INTERVAL = 100; // milliseconds

const useExploration = (gameState, setGameState) => {
  const { initializeExploration, processLootTick, resetLootPlan } = useLootSystem(gameState.activeMap);
  const [currentTick, setCurrentTick] = useState(0);
  const explorationTimerRef = useRef(null);

  const startExploration = useCallback(() => {
    if (!gameState.exploring && gameState.activeMap) {
      console.log("Starting exploration");
      setGameState(prevState => ({
        ...prevState,
        exploring: true,
        exploreProgress: 0,
        countdown: prevState.exploreTime,
      }));
      initializeExploration();
      setCurrentTick(0);
    }
  }, [gameState.exploring, gameState.activeMap, gameState.exploreTime, setGameState, initializeExploration]);

  const stopExploration = useCallback((isCompleted = false) => {
    console.log(isCompleted ? "Completing exploration" : "Abandoning exploration");
    if (explorationTimerRef.current) {
      clearInterval(explorationTimerRef.current);
      explorationTimerRef.current = null;
    }
    setGameState(prevState => ({
      ...prevState,
      exploring: false,
      exploreProgress: 0,
      countdown: 0,
      activeMap: null, // Always remove the active map when stopping exploration
    }));
    resetLootPlan();
    setCurrentTick(0);
  }, [setGameState, resetLootPlan]);

  const completeExploration = useCallback(() => stopExploration(true), [stopExploration]);
  const abandonExploration = useCallback(() => stopExploration(false), [stopExploration]);

  useEffect(() => {
    if (gameState.exploring && !explorationTimerRef.current) {
      console.log("Setting up exploration timer");
      explorationTimerRef.current = setInterval(() => {
        setCurrentTick(prevTick => {
          const newTick = prevTick + 1;
          if (newTick >= TICKS_PER_EXPLORATION) {
            completeExploration();
            return 0;
          }
          return newTick;
        });
      }, TICK_INTERVAL);
    }

    return () => {
      if (explorationTimerRef.current) {
        console.log("Cleaning up exploration timer");
        clearInterval(explorationTimerRef.current);
        explorationTimerRef.current = null;
      }
    };
  }, [gameState.exploring, completeExploration]);

  useEffect(() => {
    if (gameState.exploring) {
      const loot = processLootTick(currentTick);
      setGameState(prevState => {
        const newPouch = [...prevState.pouch];
        loot.forEach(lootItem => {
          let remainingCount = lootItem.count;
          
          // Try to add to existing stacks first
          for (let i = 0; i < newPouch.length && remainingCount > 0; i++) {
            if (newPouch[i] && newPouch[i].id === lootItem.id && newPouch[i].count < newPouch[i].maxStack) {
              const spaceInStack = newPouch[i].maxStack - newPouch[i].count;
              const amountToAdd = Math.min(spaceInStack, remainingCount);
              newPouch[i] = {
                ...newPouch[i],
                count: newPouch[i].count + amountToAdd
              };
              remainingCount -= amountToAdd;
            }
          }
          
          // If there's still some left, find empty slots
          while (remainingCount > 0) {
            const emptySlot = newPouch.findIndex(slot => slot === null);
            if (emptySlot !== -1) {
              const amountToAdd = Math.min(lootItem.maxStack, remainingCount);
              newPouch[emptySlot] = { ...lootItem, count: amountToAdd };
              remainingCount -= amountToAdd;
            } else {
              // No more space in pouch
              console.log(`Pouch is full. Dropped ${remainingCount} ${lootItem.name}`);
              break;
            }
          }
        });

        return {
          ...prevState,
          exploreProgress: (currentTick / TICKS_PER_EXPLORATION) * 100,
          countdown: Math.max(0, prevState.countdown - (TICK_INTERVAL / 1000)),
          pouch: newPouch,
        };
      });
    }
  }, [gameState.exploring, currentTick, processLootTick, setGameState]);

  return {
    startExploration,
    completeExploration,
    abandonExploration,
  };
};

export default useExploration;