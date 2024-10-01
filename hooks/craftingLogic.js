import { getItem, setItem, removeItems, countItem } from './inventoryHelpers';
import { RARITY, MAP_MODIFIERS, ITEMS } from '../constants';

// Define a list of craftable items and their crafting functions
const CRAFTABLE_ITEMS = {};

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
  
  // Ensure "Map" is always included in the name, but remove any existing modifier prefix
  const baseName = targetItem.name.includes('Map') ? 'Map' : targetItem.name;
  const cleanBaseName = baseName.replace(/^(Shiny|Juicy|Glittering|Enriched)\s/, '');
  
  return {
    ...targetItem,
    rarity: newRarity,
    name: `${newMapName} ${cleanBaseName}`.trim(),
    modifiers: [...(targetItem.modifiers || []), newModifier],
  };
};

// Now that upgradeMap is defined, we can add it to CRAFTABLE_ITEMS
CRAFTABLE_ITEMS['modifying_prism'] = {
  apply: upgradeMap,
  canApply: (targetItem) => targetItem.isMapItem && targetItem.rarity.name === RARITY.COMMON.name
};

export const updateStateAfterCrafting = (state, index, upgradedItem, material) => {
  const newState = setItem(state, index, upgradedItem);
  return {
    ...newState,
    craftingItem: null,
    tooltipMessage: `Successfully used ${material.name} on ${upgradedItem.name}`,
  };
};

export const isCraftingApplicable = (craftingItem, targetItem) => {
  if (craftingItem.id in CRAFTABLE_ITEMS) {
    // Call the specific crafting function for this item
    return CRAFTABLE_ITEMS[craftingItem.id].canApply(targetItem);
  }
  return false;
};

export const handleCraftingInteraction = (state, index, isShiftHeld) => {
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
      
      const craftingItem = CRAFTABLE_ITEMS[material.id];
      if (!craftingItem || typeof craftingItem.apply !== 'function') {
        console.error(`Invalid crafting item for ${material.id}`);
        return state;
      }
      const upgradedItem = craftingItem.apply(targetItem);
      
      return {
        ...updateStateAfterCrafting(
          { ...state, inventory: newInventory, pouch: newPouch },
          index,
          upgradedItem,
          material
        ),
        upgradedItem: { ...upgradedItem, index },
        continueCrafting: isShiftHeld
      };
    } else {
      return { ...state, tooltipMessage: `You need 1 ${material.name}`, continueCrafting: false };
    }
  }
  
  if (material && targetItem && material.id in CRAFTABLE_ITEMS) {
    return { ...state, tooltipMessage: `Cannot use ${material.name} on this item`, continueCrafting: false };
  }
  
  return { ...state, continueCrafting: false };
};

// Function to initialize craftable items
export const initializeCraftableItems = () => {
  ITEMS.forEach(item => {
    if (item.usable && !CRAFTABLE_ITEMS[item.id]) {
      CRAFTABLE_ITEMS[item.id] = {
        apply: (targetItem) => targetItem, // Default behavior: do nothing
        canApply: () => true // Default behavior: can be applied to anything
      };
    }
  });
};