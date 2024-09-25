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
  
  return {
    ...targetItem,
    rarity: newRarity,
    name: `${newRarity.name} ${targetItem.name.split(' ').slice(1).join(' ')}`,
    modifiers: [...(targetItem.modifiers || []), newModifier],
  };
};

export const updateStateAfterCrafting = (state, index, upgradedMap, material) => {
  const newState = setItem(state, index, upgradedMap);
  return {
    ...newState,
    craftingItem: null,
    tooltipMessage: `Successfully upgraded map using ${material.name}`,
  };
};

export const isCraftingApplicable = (craftingItem, targetItem) => {
  return craftingItem.id === 'modifying_prism' && targetItem.isMapItem;
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
  
  return state;
};