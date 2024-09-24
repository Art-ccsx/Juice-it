export const INITIAL_INVENTORY_SIZE = 4;
export const INITIAL_POUCH_SIZE = 5;

export const RARITY = {
  LEGENDARY: { name: 'Legendary', color: '#FBBF24' },
  EPIC: { name: 'Epic', color: '#A78BFA' },
  RARE: { name: 'Rare', color: '#60A5FA' },
  UNCOMMON: { name: 'Uncommon', color: '#4ADE80' },
  COMMON: { name: 'Common', color: '#FFFFFF' },
};

export const ENRICHING_JUICE_DROP_CHANCE = 0.05;
export const MODIFYING_PRISM_DROP_CHANCE = 0.01;
export const SHINIES_DROP_CHANCE = 0.1;
export const BOX_DROP_CHANCE = 0.01; // Changed from previous value to 1%

export const ITEMS = [
  { 
    id: 'enriching_juice', 
    name: 'Enriching Juice', 
    rarity: RARITY.COMMON,
    isMapItem: false, 
    description: 'A mysterious liquid that can enhance the quality of maps.',
    image: '/assets/enriching_juice.png',
    stackable: true,
    maxStack: 999,
    dropChance: ENRICHING_JUICE_DROP_CHANCE,
    usable: true,
  },
  {
    id: 'modifying_prism',
    name: 'Modifying Prism',
    description: 'Used to upgrade map rarity',
    rarity: RARITY.UNCOMMON,  // This is correct
    isMapItem: false,
    image: '/assets/modifying_prism.png',
    stackable: true,
    maxStack: 999,
    dropChance: MODIFYING_PRISM_DROP_CHANCE,
    usable: true,  // This should already be set to true
  },
  {
    id: 'shinies',
    name: 'Shinies',
    rarity: RARITY.COMMON,
    isMapItem: false,
    description: 'Shiny objects that serve as currency.',
    image: '/assets/shinies.png',
    stackable: true,
    maxStack: 999,
    dropChance: SHINIES_DROP_CHANCE,
  },
  {
    id: 'box',
    name: 'Box',
    rarity: RARITY.COMMON,
    isMapItem: false,
    description: 'A mysterious box. Its contents are unknown.',
    image: '/assets/box.png',
    stackable: false,
    maxStack: 1,
    dropChance: BOX_DROP_CHANCE,
    usable: false,
  },
];

export const MAP_ITEM = { 
  id: 'map', 
  name: 'Map', 
  rarity: RARITY.COMMON,
  isMapItem: true, 
  description: 'A map that allows you to explore new areas and discover resources.',
  image: '/assets/map.png',
  stackable: false,
  maxStack: 1,
  dropChance: 0, // Maps are not dropped, they are obtained through other means
  usable: false,
};

export const INITIAL_BOXES_INVENTORY_SIZE = 10;

export const MAP_MODIFIERS = [
  {
    id: 'shinies_stack_boost',
    name: 'Shinies Stack Boost',
    description: 'Adds {x} to shinies stacks found over the course of the entire exploration',
    minValue: 1,
    maxValue: 2,
  },
  {
    id: 'juice_stack_boost',
    name: 'Enriching Juice Stack Boost',
    description: 'Adds {x} to enriching juice stacks found over the course of the entire exploration',
    minValue: 1,
    maxValue: 1,
  },
  {
    id: 'total_shinies_boost',
    name: 'Total Shinies Boost',
    description: 'Adds {x} total additional shinies found over the course of the entire exploration',
    minValue: 2,
    maxValue: 4,
  },
  {
    id: 'total_juice_boost',
    name: 'Total Enriching Juice Boost',
    description: 'Adds {x} total additional juice found over the course of the entire exploration',
    minValue: 1,
    maxValue: 3,
  },
];