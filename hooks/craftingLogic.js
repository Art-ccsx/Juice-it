import { getItem, setItem, removeItems, countItem } from './inventoryHelpers';
import { RARITY, MAP_MODIFIERS } from '../constants';

export const upgradeMap = (targetItem) => {
  const rarityOrder = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
  const currentRarityIndex = rarityOrder.findIndex(r => r.name === targetItem.rarity.name);
  const newRarity = rarityOrder[Math.min(currentRarityIndex + 1, rarityOrder.length - 1)];
  
  const randomModifier = MAP_MODIFIERS[Math.floor(Math.random() * MAP_MODIFIERS.length)];
  const modifierValue = Math.floor(Math.random() * (randomModifier.maxValue - randomModifier.minValue + 1)) + randomModifier.minValue;
  
  const newModifier = {
    ...randomModifier,
    value: modifierValue,
  };
  
  // Generate the new map name based on the modifier
  let newMapName;
  switch (newModifier.id) {
    case 'shinies_stack_boost':
      newMapName = `Shiny`;
      break;
    case 'juice_stack_boost':
      newMapName = `Juicy`;
      break;
    case 'extra_shinies_drops':
      newMapName = `Glittering`;
      break;
    case 'extra_juice_drops':
      newMapName = `Enriched`;
      break;
    default:
      newMapName = '';
  }
  
  // Ensure "Map" is always included in the name
  const baseName = targetItem.name.includes('Map') ? 'Map' : targetItem.name;
  
  return {
    ...targetItem,
    rarity: newRarity,
    name: `${newRarity.name} ${newMapName} ${baseName}`.trim(),
    modifiers: [...(targetItem.modifiers || []), newModifier],
  };
};

export const updateStateAfterCrafting = (state, index, upgradedMap, material) => {
  const newState = setItem(state, index, upgradedMap);
  return {
    ...newState,
    craftingItem: null,
    tooltipMessage: `Successfully upgraded map to ${upgradedMap.name}`,
  };
};

export const isCraftingApplicable = (craftingItem, targetItem) => {
  return craftingItem.id === 'modifying_prism' && 
         targetItem.isMapItem && 
         targetItem.rarity.name === RARITY.COMMON.name;
};

export const handleCraftingInteraction = (state, index) => {
  const material = state.craftingItem;
  const targetItem = getItem(index, state);
  
  if (material && targetItem && isCraftingApplicable(material, targetItem)) {
    const requiredAmount = 1;
    const materialCountInventory = countItem(state.inventory, material.id);
    const materialCountPouch = countItem(state.pouch, material.id);
    const totalMaterialCount = materialCountInventory + materialCountPouch;
    
    if (totalMaterialCount >= requiredAmount) {
      let newInventory = [...state.inventory];
      let newPouch = [...state.pouch];
      
      if (materialCountInventory > 0) {
        newInventory = removeItems(newInventory, material.id, 1);
      } else {
        newPouch = removeItems(newPouch, material.id, 1);
      }
      
      const upgradedMap = upgradeMap(targetItem);
      
      return updateStateAfterCrafting(
        { ...state, inventory: newInventory, pouch: newPouch, craftingItem: null },
        index,
        upgradedMap,
        material
      );
    } else {
      return { ...state, tooltipMessage: `You need 1 ${material.name}` };
    }
  }
  
  if (material && targetItem && material.id === 'modifying_prism' && targetItem.isMapItem) {
    return { ...state, tooltipMessage: "This map can't be upgraded further" };
  }
  
  return state;
};