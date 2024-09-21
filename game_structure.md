# Map Explorer Game Structure

## Core Components

1. IncrementalGame (Main Component)

   - Manages overall game state and UI
   - Integrates all other components and hooks
2. Inventory Management

   - Storage: Main inventory for long-term item storage
   - Pouch: Temporary inventory filled during exploration
   - ActiveMap: Slot for the currently active map
3. Exploration System

   - Handles map exploration mechanics
   - Manages exploration progress and loot generation
4. Upgrade System

   - Allows players to upgrade inventory and pouch sizes
5. Item System

   - Defines various items with different rarities and properties
   - Implements item stacking and sorting logic
6. Save/Load System

   - Handles saving and loading game state
   - Includes import/export functionality

## Key Components

- IncrementalGame: Main game component
- Storage: Displays main inventory
- Pouch: Displays temporary inventory during exploration
- ActiveMap: Shows the currently active map
- InventorySlot: Individual slot for items in inventories
- ProgressBar: Displays exploration progress
- UpgradeTab: Shows available upgrades
- Tooltip: Provides item information on hover
- Glossary: Displays all discovered items
- Settings: Manages game saving, loading, and import/export

## Custom Hooks

- useGameState: Manages overall game state
- useExploration: Handles exploration mechanics
- useInventory: Manages inventory interactions and upgrades
- useSaveLoad: Handles saving, loading, and import/export of game state

## Game Mechanics

1. Exploration

   - Players use maps to start exploration
   - Exploration progresses automatically, generating loot
   - Loot is stored in the pouch during exploration
2. Inventory Management

   - Players can move items between storage, pouch, and active map slot
   - Items can be stacked up to a maximum stack size
   - The pouch is always sorted by item rarity
   - Storage can be manually sorted
3. Item Interaction

   - Left-click to pick up or place items
   - Ctrl+click for special actions (e.g., move from pouch to storage)
4. Upgrade System

   - Players can upgrade storage and pouch sizes using shinies
5. Item Discovery

   - New items are added to the glossary when discovered
6. Save/Load System

   - Autosave every 10 seconds
   - Manual save option
   - Import/Export game state as JSON file

## UI Structure

1. Top Section

   - Exploration progress bar
   - Exploration controls (Get Map, Run It!, Abandon Map)
   - Active Map slot
   - Pouch display
   - Storage display
2. Bottom Section (Tabs)

   - General: Upgrade options
   - Map: (Placeholder for future map-related upgrades)
   - Glossary: Discovered items display
   - Settings: Save, load, and import/export options

## Data Flow

1. Game state is managed by useGameState hook
2. User interactions trigger functions in useInventory and useExploration hooks
3. These hooks update the game state
4. React components re-render based on the updated state

## Future Expansion Points

1. Implement map enhancement using Enriching Juice
2. Add more upgrade options
3. Create different types of maps with varying rewards
4. Implement uses for Modifying Prism
5. Add a prestige system
6. Implement achievements and statistics tracking

This structure provides a solid foundation for the current game mechanics and allows for future expansions and improvements.
