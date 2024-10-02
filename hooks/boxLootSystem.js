import { ITEMS, RARITY, MODIFIER_ICONS, ITEM_ICONS } from '../constants';

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
  LASTING_KEY: 'lasting_key',
  COMMON_CONVERSION_CHANCE: 'common_conversion_chance',
  GUARANTEED_COMMON_CONVERSION: 'guaranteed_common_conversion',
};

// Define lockbox modifier types
const LOCKBOX_MODIFIER_TYPES = {
  EXTRA_COMMON_DROPS: 'extra_common_drops',
  EXTRA_UNCOMMON_DROPS: 'extra_uncommon_drops',
  EXTRA_SHINIES_YELLOW_NOTCH: 'extra_shinies_yellow_notch',
  EXTRA_PRISMS_GREEN_NOTCH: 'extra_prisms_green_notch',
  EXTRA_RANDOM_DROPS: 'extra_random_drops',
  EXTRA_BOX: 'extra_box',
};

// Define lockbox modifiers
const LOCKBOX_MODIFIERS = [
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_COMMON_DROPS,
    name: 'of Common Bounty',
    description: 'Has {x} extra common drops',
    minValue: 1,
    maxValue: 4,
    chance: 0.45,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.common,
  },
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_UNCOMMON_DROPS,
    name: 'of Uncommon Bounty',
    description: 'Has {x} extra uncommon drops',
    minValue: 1,
    maxValue: 2,
    chance: 0.35,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.uncommon,
  },
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_SHINIES_YELLOW_NOTCH,
    name: 'Shiny Fortune',
    description: 'Drops {x} extra shinies when opened by a key with a yellow notch',
    minValue: 5,
    maxValue: 20,
    chance: 0.05,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.shinies,
    notchIcon: '/assets/yellow_notch.png',
  },
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_PRISMS_GREEN_NOTCH,
    name: 'Prismatic Fortune',
    description: 'Drops {x} extra enhancing prisms when opened by a key with a green notch',
    minValue: 3,
    maxValue: 5,
    chance: 0.05,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.modifying_prism,
    notchIcon: '/assets/green_notch.png',
  },
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_RANDOM_DROPS,
    name: 'of Bounty',
    description: 'Has {x} extra random drops',
    minValue: 1,
    maxValue: 10,
    chance: 0.05,
    icon: MODIFIER_ICONS.extra_drops,
  },
  {
    id: LOCKBOX_MODIFIER_TYPES.EXTRA_BOX,
    name: 'Inception',
    description: 'Drops an extra box',
    minValue: 1,
    maxValue: 1,
    chance: 0.05,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.box,
  },
];

// Loot table for different box/compartment types
const LOOT_TABLES = {
  [BOX_TYPES.SIMPLE]: {
    COMMON: 0.7,
    UNCOMMON: 0.3,
  },
  [BOX_TYPES.LOCKBOX]: {
    COMMON: 0.6,
    UNCOMMON: 0.4,
  },
  [COMPARTMENT_TYPES.STANDARD]: {
    COMMON: 0.7,
    UNCOMMON: 0.3,
  },
  [COMPARTMENT_TYPES.RARE]: {
    COMMON: 0.6,
    UNCOMMON: 0.4,
  },
  [COMPARTMENT_TYPES.LEGENDARY]: {
    COMMON: 0.5,
    UNCOMMON: 0.5,
  },
};

// Define item pools for each box type
const ITEM_POOLS = {
  [BOX_TYPES.SIMPLE]: {
    COMMON: ['shinies', 'enriching_juice'],
    UNCOMMON: ['modifying_prism'],
  },
  [BOX_TYPES.LOCKBOX]: {
    COMMON: ['shinies', 'enriching_juice'],
    UNCOMMON: ['modifying_prism'],
  },
};

// Define key modifiers
const KEY_MODIFIERS = [
  {
    id: KEY_MODIFIER_TYPES.LASTING_KEY,
    name: 'Lasting Key',
    description: 'Has +{x}% chance of not being used',
    minValue: 5,
    maxValue: 10,
    chance: 0.20,
    icon: MODIFIER_ICONS.again,
  },
  {
    id: KEY_MODIFIER_TYPES.COMMON_CONVERSION_CHANCE,
    name: 'of Common Conversion Chance',
    description: 'Each common reward has a +{x}% chance to convert into uncommon',
    minValue: 10,
    maxValue: 60,
    chance: 0.40,
    icon: MODIFIER_ICONS.uncommon_upgrade,
    itemIcon: ITEM_ICONS.common,
  },
  {
    id: KEY_MODIFIER_TYPES.GUARANTEED_COMMON_CONVERSION,
    name: 'of Guaranteed Common Conversion',
    description: 'Converts up to {x} common rewards into uncommon',
    minValue: 1,
    maxValue: 2,
    chance: 0.40,
    icon: MODIFIER_ICONS.uncommon_upgrade,
    itemIcon: ITEM_ICONS.common,
  },
];

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

// Function to generate a random modifier for a lockbox
const generateLockboxModifier = () => {
  const roll = Math.random();
  let cumulativeProbability = 0;
  
  for (const modifier of LOCKBOX_MODIFIERS) {
    cumulativeProbability += modifier.chance;
    if (roll < cumulativeProbability) {
      const value = Math.floor(Math.random() * (modifier.maxValue - modifier.minValue + 1)) + modifier.minValue;
      return {
        ...modifier,
        value,
        appendToEnd: modifier.name.startsWith('of')
      };
    }
  }
  
  // Fallback to extra common drops if somehow no modifier was selected
  const fallbackModifier = LOCKBOX_MODIFIERS[0];
  return {
    ...fallbackModifier,
    value: Math.floor(Math.random() * (fallbackModifier.maxValue - fallbackModifier.minValue + 1)) + fallbackModifier.minValue,
    appendToEnd: fallbackModifier.name.startsWith('of')
  };
};

// Function to generate a random modifier for a key
const generateKeyModifier = () => {
  const roll = Math.random();
  let cumulativeProbability = 0;
  
  for (const modifier of KEY_MODIFIERS) {
    cumulativeProbability += modifier.chance;
    if (roll < cumulativeProbability) {
      const value = Math.floor(Math.random() * (modifier.maxValue - modifier.minValue + 1)) + modifier.minValue;
      return {
        ...modifier,
        value,
        appendToEnd: modifier.name.startsWith('of')
      };
    }
  }
  
  // Fallback to lasting key if somehow no modifier was selected
  const fallbackModifier = KEY_MODIFIERS[0];
  return {
    ...fallbackModifier,
    value: Math.floor(Math.random() * (fallbackModifier.maxValue - fallbackModifier.minValue + 1)) + fallbackModifier.minValue,
    appendToEnd: fallbackModifier.name.startsWith('of')
  };
};

// Update the generateLoot function to handle lockbox modifiers
const generateLoot = (boxType, modifiers = [], keyModifiers = []) => {
  console.log(`Generating loot for box type: ${boxType}`);
  console.log('Modifiers:', modifiers);
  console.log('Key modifiers:', keyModifiers);

  const lootTable = LOOT_TABLES[boxType] || LOOT_TABLES[BOX_TYPES.SIMPLE];
  const itemPool = ITEM_POOLS[boxType] || ITEM_POOLS[BOX_TYPES.SIMPLE];
  let loot = [];
  let baseItemCount = Math.floor(Math.random() * 3) + 1;

  console.log(`Initial base item count: ${baseItemCount}`);

  // Generate base loot
  console.log(`Generating ${baseItemCount} base loot items`);
  for (let i = 0; i < baseItemCount; i++) {
    const rarity = rollRarity(lootTable);
    const item = generateItem(rarity, itemPool);
    if (item) {
      loot.push(item);
      console.log(`Generated base loot item: ${item.name} (${rarity})`);
    }
  }

  // Apply modifiers
  modifiers.forEach(modifier => {
    console.log(`Applying modifier: ${modifier.id}`);
    switch (modifier.id) {
      case LOCKBOX_MODIFIER_TYPES.EXTRA_COMMON_DROPS:
        console.log(`Adding ${modifier.value} extra common drops`);
        for (let i = 0; i < modifier.value; i++) {
          const item = generateItem('COMMON', itemPool);
          if (item) {
            loot.push(item);
            console.log(`Added extra common item: ${item.name}`);
          }
        }
        break;
      case LOCKBOX_MODIFIER_TYPES.EXTRA_UNCOMMON_DROPS:
        for (let i = 0; i < modifier.value; i++) {
          const item = generateItem('UNCOMMON', itemPool);
          if (item) {
            loot.push(item);
            console.log(`Added extra uncommon item: ${item.name}`);
          }
        }
        break;
      case LOCKBOX_MODIFIER_TYPES.EXTRA_SHINIES_YELLOW_NOTCH:
        if (keyModifiers.some(km => km.id === 'yellow_notch')) {
          const shinies = ITEMS.find(item => item.id === 'shinies');
          if (shinies) {
            loot.push({ ...shinies, count: modifier.value });
            console.log(`Added ${modifier.value} extra shinies due to yellow notch`);
          }
        }
        break;
      case LOCKBOX_MODIFIER_TYPES.EXTRA_PRISMS_GREEN_NOTCH:
        if (keyModifiers.some(km => km.id === 'green_notch')) {
          const prism = ITEMS.find(item => item.id === 'modifying_prism');
          if (prism) {
            loot.push({ ...prism, count: modifier.value });
            console.log(`Added ${modifier.value} extra modifying prisms due to green notch`);
          }
        }
        break;
      case LOCKBOX_MODIFIER_TYPES.EXTRA_RANDOM_DROPS:
        for (let i = 0; i < modifier.value; i++) {
          const randomRarity = Object.keys(RARITY)[Math.floor(Math.random() * Object.keys(RARITY).length)];
          const item = generateItem(randomRarity, itemPool);
          if (item) {
            loot.push(item);
            console.log(`Added extra random item: ${item.name} (${randomRarity})`);
          }
        }
        break;
      case LOCKBOX_MODIFIER_TYPES.EXTRA_BOX:
        console.log(`Extra box modifier detected. Value: ${modifier.value}`);
        const boxItem = ITEMS.find(item => item.id === 'box');
        if (boxItem) {
          console.log(`Adding ${modifier.value} extra box(es) to loot`);
          for (let i = 0; i < modifier.value; i++) {
            loot.push({ ...boxItem, count: 1 });
          }
        } else {
          console.log('Error: Box item not found in ITEMS');
        }
        break;
    }
  });

  loot = applyKeyModifiers(loot, keyModifiers);

  console.log('Final loot:', loot);
  return loot;
};

// Helper function to roll for rarity
const rollRarity = (lootTable) => {
  const roll = Math.random();
  let cumulativeProbability = 0;
  
  for (const [rarity, probability] of Object.entries(lootTable)) {
    cumulativeProbability += probability;
    if (roll < cumulativeProbability) {
      return rarity;
    }
  }
  
  return 'COMMON'; // Fallback to common if somehow no rarity was selected
};

// Helper function to generate a single item
const generateItem = (rarity, itemPool) => {
  const itemsOfRarity = itemPool[rarity];
  if (!itemsOfRarity || itemsOfRarity.length === 0) return null;

  const selectedItemId = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  const selectedItem = ITEMS.find(item => item.id === selectedItemId);

  if (!selectedItem) return null;

  return { ...selectedItem, count: Math.ceil(Math.random() * 3) };
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
  console.log('Opening box:', box);
  console.log('Keys:', keys);

  if (!box || typeof box !== 'object') {
    console.log('Invalid box object');
    return [];
  }

  const keyModifiers = keys.flatMap(key => key.modifiers || []);
  
  let loot;
  switch (box.id) {
    case 'box':
      console.log('Opening simple box');
      loot = generateLoot(BOX_TYPES.SIMPLE, box.modifiers || [], keyModifiers);
      break;
    case 'simple_lockbox':
      console.log('Opening simple lockbox');
      if (keys.length === 0 || keys[0].id !== 'simple_key') {
        console.log('No valid key for lockbox');
        return [];
      }
      // Use the existing modifiers on the lockbox
      console.log('Lockbox modifiers:', box.modifiers);
      loot = generateLoot(BOX_TYPES.LOCKBOX, box.modifiers || [], keyModifiers);
      break;
    case 'compartment_box':
      console.log('Opening compartment box');
      loot = openCompartmentBox(box.compartments || [], box.modifiers || [], keyModifiers);
      break;
    case 'sequential_box':
      console.log('Opening sequential box');
      loot = openSequentialBox(box.stages || [], keys);
      break;
    default:
      console.log('Unknown box type');
      return [];
  }

  console.log('Loot generated:', loot);
  return loot;
};

export { openBox, BOX_TYPES, COMPARTMENT_TYPES, MODIFIER_TYPES, KEY_MODIFIER_TYPES, LOCKBOX_MODIFIER_TYPES, generateLockboxModifier, generateLoot, KEY_MODIFIERS, generateKeyModifier };