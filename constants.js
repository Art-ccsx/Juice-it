export const INITIAL_INVENTORY_SIZE = 4;
export const INITIAL_POUCH_SIZE = 5;

export const RARITY = {
  LEGENDARY: { name: 'Legendary', color: '#FBBF24' },
  EPIC: { name: 'Epic', color: '#A78BFA' },
  RARE: { name: 'Rare', color: '#60A5FA' },
  UNCOMMON: { name: 'Uncommon', color: '#4ADE80' },
  COMMON: { name: 'Common', color: '#FFFFFF' },
};

const TetrahedronSVG = (color) => `
  <path d="M50 10 L90 80 L50 65 L10 80 Z" fill="${color}" stroke="#000" stroke-width="2" />
`;

export const ENRICHING_JUICE_DROP_CHANCE = 0.1;
export const MODIFYING_PRISM_DROP_CHANCE = 0.1;
export const SHINIES_DROP_CHANCE = 0.5;

export const ITEMS = [
  { 
    id: 'enriching_juice', 
    name: 'Enriching Juice', 
    rarity: RARITY.COMMON,
    isMapItem: false, 
    description: 'A mysterious liquid that can enhance the quality of maps.',
    shape: `<path d="M50 10 Q80 40 80 70 Q80 90 50 90 Q20 90 20 70 Q20 40 50 10Z" fill="${RARITY.COMMON.color}" stroke="#000" stroke-width="2" />`,
    stackable: true,
    maxStack: 999,
    dropChance: ENRICHING_JUICE_DROP_CHANCE,
    usable: true,
  },
  {
    id: 'modifying_prism',
    name: 'Modifying Prism',
    description: 'Used to upgrade map rarity',
    rarity: RARITY.UNCOMMON,
    isMapItem: false,
    shape: `
      <path d="M50 10 L90 80 L50 65 L10 80 Z" fill="${RARITY.UNCOMMON.color}" stroke="#000" stroke-width="2" />
    `,
    stackable: true,
    maxStack: 10,
    dropChance: MODIFYING_PRISM_DROP_CHANCE,
    usable: true,
  },
  {
    id: 'shinies',
    name: 'Shinies',
    rarity: RARITY.COMMON,
    isMapItem: false,
    description: 'Shiny objects that serve as currency.',
    shape: `
      <g>
        <circle cx="50" cy="50" r="40" fill="#FFD700" stroke="#000" stroke-width="2" />
        <path d="M30 50 L70 50 M50 30 L50 70" stroke="#FFA500" stroke-width="5" />
      </g>
    `,
    stackable: true,
    maxStack: 999,
    dropChance: SHINIES_DROP_CHANCE,
  },
];

export const MAP_ITEM = { 
  id: 'map', 
  name: 'Map', 
  rarity: RARITY.COMMON,
  isMapItem: true, 
  description: 'A map that allows you to explore new areas and discover resources.',
  shape: `
    <g>
      <rect x="10" y="10" width="80" height="80" fill="#1E40AF" stroke="#000" stroke-width="2" />
      <path d="M20 20 L80 20 L80 80 L20 80 Z" fill="none" stroke="#60A5FA" stroke-width="3" />
      <path d="M35 70 L45 50 L55 70" fill="#60A5FA" stroke="#60A5FA" stroke-width="2" />
      <path d="M55 60 L65 40 L75 60" fill="#60A5FA" stroke="#60A5FA" stroke-width="2" />
      <path d="M25 55 L35 35 L45 55" fill="#60A5FA" stroke="#60A5FA" stroke-width="2" />
    </g>
  `,
  stackable: false,
  dropChance: 0, // Maps are not dropped, they are obtained through other means
  usable: false,
};