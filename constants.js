export const INITIAL_INVENTORY_SIZE = 4;
export const INITIAL_POUCH_SIZE = 5;

export const RARITY = {
  LEGENDARY: { name: 'Legendary', color: '#FBBF24' },
  EPIC: { name: 'Epic', color: '#A78BFA' },
  RARE: { name: 'Rare', color: '#60A5FA' },
  UNCOMMON: { name: 'Uncommon', color: '#4ADE80' },
  COMMON: { name: 'Common', color: '#FFFFFF' },
};

export const ENRICHING_JUICE_DROP_CHANCE = 0.005; // Changed from 0.05
export const MODIFYING_PRISM_DROP_CHANCE = 0.001; // Changed from 0.01
export const SHINIES_DROP_CHANCE = 0.01; // Changed from 0.1
export const BOX_DROP_CHANCE = 0.001; // Changed from 0.01
export const SIMPLE_LOCKBOX_DROP_CHANCE = 0.0005; // Half as rare as a box
export const SIMPLE_KEY_DROP_CHANCE = 0.0005; // Half as rare as a box

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
  {
    id: 'simple_lockbox',
    name: 'Simple Lockbox',
    rarity: RARITY.UNCOMMON,
    isMapItem: false,
    description: 'A locked box that requires a simple key to open.',
    image: '/assets/simple_lockbox.png',
    stackable: false,
    maxStack: 1,
    dropChance: SIMPLE_LOCKBOX_DROP_CHANCE,
    usable: false,
  },
  {
    id: 'simple_key',
    name: 'Simple Key',
    rarity: RARITY.COMMON, // Changed from UNCOMMON to COMMON
    isMapItem: false,
    description: 'A simple key that can open simple lockboxes.',
    image: '/assets/simple_key.png',
    stackable: true,
    maxStack: 99,
    dropChance: SIMPLE_KEY_DROP_CHANCE,
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

export const BOX_DROPS_INVENTORY_SIZE = 50;

export const MODIFIER_ICONS = {
  stack_boost: '/assets/stack_symbol.png',
  extra_drops: '/assets/extra_drop_symbol.png',
  green_notch: '/assets/green_notch.png',
  yellow_notch: '/assets/yellow_notch.png',
  percentage: '/assets/percentage.png',
  percentage_each: '/assets/percentage_each.png',
  again: '/assets/again.png',
  uncommon_upgrade: '/assets/uncommon_upgrade.png',
};

export const ITEM_ICONS = {
  shinies: '/assets/shinies.png',
  enriching_juice: '/assets/enriching_juice.png',
  modifying_prism: '/assets/modifying_prism.png',
  box: '/assets/box.png',
  common: '/assets/common_icon.png',
  uncommon: '/assets/uncommon_icon.png',
  simple_key: '/assets/simple_key.png',
  simple_lockbox: '/assets/simple_lockbox.png',
};

export const MAP_MODIFIERS = [
  {
    id: 'shinies_stack_boost',
    name: 'Shinies Stack Boost',
    description: 'Adds {x} to shinies stacks found over the course of the entire exploration',
    minValue: 1,
    maxValue: 2,
    icon: MODIFIER_ICONS.stack_boost,
    itemIcon: ITEM_ICONS.shinies,
  },
  {
    id: 'juice_stack_boost',
    name: 'Enriching Juice Stack Boost',
    description: 'Adds {x} to enriching juice stacks found over the course of the entire exploration',
    minValue: 1,
    maxValue: 1,
    icon: MODIFIER_ICONS.stack_boost,
    itemIcon: ITEM_ICONS.enriching_juice,
  },
  {
    id: 'extra_shinies_drops',
    name: 'Extra Shinies Drops',
    description: 'Adds {x} additional shinies drops over the course of the entire exploration',
    minValue: 2,
    maxValue: 4,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.shinies,
  },
  {
    id: 'extra_juice_drops',
    name: 'Extra Enriching Juice Drops',
    description: 'Adds {x} additional enriching juice drops over the course of the entire exploration',
    minValue: 1,
    maxValue: 3,
    icon: MODIFIER_ICONS.extra_drops,
    itemIcon: ITEM_ICONS.enriching_juice,
  },
];