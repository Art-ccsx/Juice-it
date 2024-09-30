import { useState, useCallback } from 'react';
import { ITEMS, MAP_ITEM, ENRICHING_JUICE_DROP_CHANCE, MODIFYING_PRISM_DROP_CHANCE, SHINIES_DROP_CHANCE, BOX_DROP_CHANCE } from '../constants';

const TICKS_PER_EXPLORATION = 100;

const useLootSystem = (activeMap) => {
  const [lootPlan, setLootPlan] = useState({});

  const initializeExploration = useCallback(() => {
    const newLootPlan = {
      'shinies': { natural: [], extra: [] },
      'enriching_juice': { natural: [], extra: [] },
      'modifying_prism': { natural: [], extra: [] },
      'box': { natural: [], extra: [] }
    };

    // Generate loot plan based on drop chances
    for (let tick = 0; tick < TICKS_PER_EXPLORATION; tick++) {
      if (Math.random() < SHINIES_DROP_CHANCE) newLootPlan['shinies'].natural.push(tick);
      if (Math.random() < ENRICHING_JUICE_DROP_CHANCE) newLootPlan['enriching_juice'].natural.push(tick);
      if (Math.random() < MODIFYING_PRISM_DROP_CHANCE) newLootPlan['modifying_prism'].natural.push(tick);
      if (Math.random() < BOX_DROP_CHANCE) newLootPlan['box'].natural.push(tick);
    }

    // Apply extra drops modifiers
    if (activeMap && activeMap.modifiers) {
      activeMap.modifiers.forEach(modifier => {
        if (modifier.id === 'extra_shinies_drops') {
          newLootPlan['shinies'].extra = Array(modifier.value).fill().map(() => Math.floor(Math.random() * TICKS_PER_EXPLORATION));
        } else if (modifier.id === 'extra_juice_drops') {
          newLootPlan['enriching_juice'].extra = Array(modifier.value).fill().map(() => Math.floor(Math.random() * TICKS_PER_EXPLORATION));
        }
      });
    }

    console.log('Initialized Loot Plan:', newLootPlan);
    setLootPlan(newLootPlan);
  }, [activeMap]);

  const processLootTick = useCallback((tick) => {
    let loot = [];

    Object.entries(lootPlan).forEach(([itemId, drops]) => {
      const naturalDrops = drops.natural.filter(dropTick => dropTick === tick).length;
      const extraDrops = drops.extra.filter(dropTick => dropTick === tick).length;
      const totalDrops = naturalDrops + extraDrops;

      if (totalDrops > 0) {
        const item = ITEMS.find(i => i.id === itemId) || MAP_ITEM;
        let amount = totalDrops;

        // Apply stack boost modifiers
        if (activeMap && activeMap.modifiers) {
          activeMap.modifiers.forEach(modifier => {
            switch (modifier.id) {
              case 'shinies_stack_boost':
                if (itemId === 'shinies') amount += modifier.value;
                break;
              case 'juice_stack_boost':
                if (itemId === 'enriching_juice') amount += modifier.value;
                break;
            }
          });
        }

        loot.push({ ...item, count: amount });
        
        if (naturalDrops > 0) {
          console.log(`Tick ${tick}: Dropped ${naturalDrops} ${itemId} (natural drop)`);
        }
        if (extraDrops > 0) {
          console.log(`Tick ${tick}: Dropped ${extraDrops} ${itemId} (extra drop from modifier)`);
        }
        if (amount > totalDrops) {
          console.log(`Tick ${tick}: Added ${amount - totalDrops} ${itemId} from stack boost modifier`);
        }
      }
    });

    return loot;
  }, [lootPlan, activeMap]);

  const modifyLootSystem = useCallback((modifier, currentTick) => {
    setLootPlan(prevLootPlan => {
      const newLootPlan = JSON.parse(JSON.stringify(prevLootPlan)); // Deep clone
      Object.keys(newLootPlan).forEach(itemId => {
        newLootPlan[itemId].natural = newLootPlan[itemId].natural.filter(drop => drop >= currentTick);
        newLootPlan[itemId].extra = newLootPlan[itemId].extra.filter(drop => drop >= currentTick);
        const additionalDrops = Math.floor((TICKS_PER_EXPLORATION - currentTick) * modifier * 0.01);
        newLootPlan[itemId].extra = newLootPlan[itemId].extra.concat(
          Array(additionalDrops).fill().map(() => Math.floor(Math.random() * (TICKS_PER_EXPLORATION - currentTick) + currentTick))
        );
      });
      return newLootPlan;
    });
  }, []);

  const resetLootPlan = useCallback(() => {
    setLootPlan({});
  }, []);

  return {
    initializeExploration,
    processLootTick,
    modifyLootSystem,
    resetLootPlan
  };
};

export default useLootSystem;