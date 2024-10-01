import { ITEMS, RARITY } from '../constants';

// Define box types and their properties
const BOX_TYPES = {
  SIMPLE: 'simple',
  COMPARTMENT: 'compartment',
  SEQUENTIAL: 'sequential',
  LOCKBOX: 'lockbox',
};

// Define compartment types
const COMPARTMENT_TYPES = {
  STANDARD: 'standard',
  RARE: 'rare',
  LEGENDARY: 'legendary',
};

// Define modifier types
const MODIFIER_TYPES = {
  QUANTITY_BOOST: 'quantity_boost',
  RARITY_BOOST: 'rarity_boost',
  SPECIFIC_ITEM_BOOST: 'specific_item_boost',
};

// Define key modifier types
const KEY_MODIFIER_TYPES = {
  RARITY_BOOST: 'key_rarity_boost',
  QUANTITY_BOOST: 'key_quantity_boost',
  SPECIFIC_ITEM_BOOST: 'key_specific_item_boost',
};

// Loot table for different box/compartment types
const LOOT_TABLES = {
  [BOX_TYPES.SIMPLE]: {
    COMMON: 0.6,
    UNCOMMON: 0.3,
    RARE: 0.08,
    EPIC: 0.018,
    LEGENDARY: 0.002,
  },
  [BOX_TYPES.LOCKBOX]: {
    COMMON: 0.4,
    UNCOMMON: 0.35,
    RARE: 0.18,
    EPIC: 0.058,
    LEGENDARY: 0.012,
  },
  [COMPARTMENT_TYPES.STANDARD]: {
    COMMON: 0.5,
    UNCOMMON: 0.35,
    RARE: 0.12,
    EPIC: 0.025,
    LEGENDARY: 0.005,
  },
  [COMPARTMENT_TYPES.RARE]: {
    COMMON: 0.3,
    UNCOMMON: 0.4,
    RARE: 0.2,
    EPIC: 0.08,
    LEGENDARY: 0.02,
  },
  [COMPARTMENT_TYPES.LEGENDARY]: {
    COMMON: 0.1,
    UNCOMMON: 0.2,
    RARE: 0.3,
    EPIC: 0.3,
    LEGENDARY: 0.1,
  },
};

// Define item pools for each box type
const ITEM_POOLS = {
  [BOX_TYPES.SIMPLE]: {
    COMMON: ['shinies', 'enriching_juice'],
    UNCOMMON: ['modifying_prism'],
    RARE: ['modifying_prism'],
    EPIC: ['modifying_prism'],
    LEGENDARY: ['modifying_prism'],
  },
  [BOX_TYPES.LOCKBOX]: {
    COMMON: ['shinies', 'enriching_juice'],
    UNCOMMON: ['modifying_prism'],
    RARE: ['modifying_prism'],
    EPIC: ['modifying_prism'],
    LEGENDARY: ['modifying_prism'],
  },
};

// Function to apply key modifiers
const applyKeyModifiers = (loot, keyModifiers) => {
  keyModifiers.forEach(modifier => {
    switch (modifier.type) {
      case KEY_MODIFIER_TYPES.RARITY_BOOST:
        // Increase rarity of items
        loot = loot.map(item => {
          const rarityOrder = [RARITY.COMMON, RARITY.UNCOMMON, RARITY.RARE, RARITY.EPIC, RARITY.LEGENDARY];
          const currentIndex = rarityOrder.findIndex(r => r.name === item.rarity.name);
          const newIndex = Math.min(currentIndex + modifier.value, rarityOrder.length - 1);
          return { ...item, rarity: rarityOrder[newIndex] };
        });
        break;
      case KEY_MODIFIER_TYPES.QUANTITY_BOOST:
        // Increase quantity of items
        loot = loot.map(item => ({ ...item, count: Math.ceil(item.count * modifier.value) }));
        break;
      case KEY_MODIFIER_TYPES.SPECIFIC_ITEM_BOOST:
        // Increase quantity of specific items
        loot = loot.map(item => {
          if (item.id === modifier.itemId) {
            return { ...item, count: Math.ceil(item.count * modifier.value) };
          }
          return item;
        });
        break;
    }
  });
  return loot;
};

// Function to generate loot based on box type and modifiers
const generateLoot = (boxType, modifiers = [], keyModifiers = []) => {
  const lootTable = LOOT_TABLES[boxType] || LOOT_TABLES[BOX_TYPES.SIMPLE];
  const itemPool = ITEM_POOLS[boxType] || ITEM_POOLS[BOX_TYPES.SIMPLE];
  let loot = [];
  let itemCount = Math.floor(Math.random() * 3) + 1;

  modifiers.forEach(modifier => {
    switch (modifier.type) {
      case MODIFIER_TYPES.QUANTITY_BOOST:
        itemCount += modifier.value;
        break;
      case MODIFIER_TYPES.RARITY_BOOST:
        // Adjust loot table probabilities
        Object.keys(lootTable).forEach(rarity => {
          if (rarity !== 'LEGENDARY') {
            const nextRarity = Object.keys(RARITY)[Object.keys(RARITY).indexOf(rarity) + 1];
            lootTable[nextRarity] += lootTable[rarity] * 0.1 * modifier.value;
            lootTable[rarity] -= lootTable[rarity] * 0.1 * modifier.value;
          }
        });
        break;
    }
  });

  for (let i = 0; i < itemCount; i++) {
    const roll = Math.random();
    let cumulativeProbability = 0;
    let selectedRarity;

    for (const [rarity, probability] of Object.entries(lootTable)) {
      cumulativeProbability += probability;
      if (roll < cumulativeProbability) {
        selectedRarity = rarity;
        break;
      }
    }

    if (!selectedRarity) continue;

    const itemsOfSelectedRarity = itemPool[selectedRarity];
    if (!itemsOfSelectedRarity || itemsOfSelectedRarity.length === 0) continue;

    const selectedItemId = itemsOfSelectedRarity[Math.floor(Math.random() * itemsOfSelectedRarity.length)];
    const selectedItem = ITEMS.find(item => item.id === selectedItemId);

    if (!selectedItem) continue;

    const specificBoost = modifiers.find(m => m.type === MODIFIER_TYPES.SPECIFIC_ITEM_BOOST && m.itemId === selectedItem.id);
    const count = specificBoost ? Math.ceil(Math.random() * 3 * specificBoost.value) : Math.ceil(Math.random() * 3);

    loot.push({ ...selectedItem, count });
  }

  loot = applyKeyModifiers(loot, keyModifiers);

  return loot;
};

// Function to open a simple box
const openSimpleBox = (modifiers = [], keyModifiers = []) => {
  return generateLoot(BOX_TYPES.SIMPLE, modifiers, keyModifiers);
};

// Function to open a compartment box
const openCompartmentBox = (compartments, modifiers = [], keyModifiers = []) => {
  let totalLoot = [];
  compartments.forEach(compartment => {
    const compartmentLoot = generateLoot(compartment.type, [...modifiers, ...compartment.modifiers], keyModifiers);
    totalLoot = [...totalLoot, ...compartmentLoot];
  });
  return totalLoot;
};

// Function to open a sequential box
const openSequentialBox = (stages, keys) => {
  let totalLoot = [];
  let currentStage = 0;

  while (currentStage < stages.length && keys.length > 0) {
    if (stages[currentStage].requiredKey === keys[0].id) {
      const stageLoot = generateLoot(stages[currentStage].type, stages[currentStage].modifiers, keys[0].modifiers);
      totalLoot = [...totalLoot, ...stageLoot];
      keys.shift(); // Remove used key
      currentStage++;
    } else {
      break; // Stop if we don't have the right key
    }
  }

  return totalLoot;
};

// Main function to open a box
const openBox = (box, keys = []) => {
  if (!box || typeof box !== 'object') {
    return [];
  }

  const keyModifiers = keys.flatMap(key => key.modifiers || []);
  
  let loot;
  switch (box.id) {
    case 'box':
      loot = generateLoot(BOX_TYPES.SIMPLE, box.modifiers || [], keyModifiers);
      break;
    case 'simple_lockbox':
      if (keys.length === 0 || keys[0].id !== 'simple_key') {
        return [];
      }
      loot = generateLoot(BOX_TYPES.LOCKBOX, box.modifiers || [], keyModifiers);
      break;
    case 'compartment_box':
      loot = openCompartmentBox(box.compartments || [], box.modifiers || [], keyModifiers);
      break;
    case 'sequential_box':
      loot = openSequentialBox(box.stages || [], keys);
      break;
    default:
      return [];
  }

  return loot;
};

export { openBox, BOX_TYPES, COMPARTMENT_TYPES, MODIFIER_TYPES, KEY_MODIFIER_TYPES };