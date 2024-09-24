# Map Explorer Game Structure

## Core Components

1. IncrementalGame (Main Component)
   - Manages overall game state and UI
   - Integrates all other components and hooks
   - Handles mouse interactions and tooltip display
   - Manages crafting mode and item selection
   - Renders the main game layout, including tabs and inventories

2. Inventory Management
   - Storage: Main inventory for long-term item storage
   - Pouch: Temporary inventory filled during exploration
   - ActiveMap: Slot for the currently active map
   - Boxes: Additional inventory unlocked later in the game

3. Exploration System
   - Handles map exploration mechanics
   - Manages exploration progress and loot generation
   - Applies map modifiers to loot generation

4. Upgrade System
   - Allows players to upgrade inventory and pouch sizes
   - Uses shinies as currency for upgrades

5. Item System
   - Defines various items with different rarities and properties
   - Implements item stacking and sorting logic
   - Includes special items like maps, modifying prisms, and enriching juice

6. Save/Load System
   - Handles saving and loading game state
   - Includes import/export functionality for game data

7. Crafting System
   - Allows modification of items using Modifying Prisms
   - Changes cursor appearance during crafting mode

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
- ItemParticles: Displays particle effects for item updates
- ContinuousParticles: Shows ongoing particle effects during exploration

## Custom Hooks

- useGameState: Manages overall game state
- useExploration: Handles exploration mechanics and loot generation
- useInventory: Manages inventory interactions, upgrades, and item movement
- useSaveLoad: Handles saving, loading, and import/export of game state

## Game Mechanics

1. Exploration
   - Players use maps to start exploration
   - Exploration progresses automatically, generating loot
   - Loot is stored in the pouch during exploration
   - Map modifiers affect loot generation and quantity

2. Inventory Management
   - Players can move items between storage, pouch, and active map slot
   - Items can be stacked up to a maximum stack size
   - The pouch is always sorted by item rarity
   - Storage can be manually sorted
   - Boxes inventory provides additional storage space

3. Item Interaction
   - Left-click to pick up or place items
   - Right-click to use items or initiate crafting
   - Ctrl+click for special actions (e.g., move from pouch to storage)

4. Upgrade System
   - Players can upgrade storage and pouch sizes using shinies
   - Upgrade costs increase exponentially

5. Item Discovery
   - New items are added to the glossary when discovered
   - Glossary can filter to show only discovered items

6. Save/Load System
   - Autosave every 10 seconds
   - Manual save option
   - Import/Export game state as JSON file

7. Crafting System
   - Use Modifying Prisms to upgrade map rarity
   - Crafting mode changes cursor appearance
   - Right-click outside inventory slots to cancel crafting

## UI Structure

1. Top Section
   - Exploration progress bar
   - Exploration controls (Get Map, Run It!, Abandon Map)
   - Active Map slot with particle effects during exploration
   - Pouch display with "Take All" button
   - Storage display with sort and clear buttons

2. Bottom Section (Tabs)
   - General: Upgrade options for inventory and pouch
   - Map: (Placeholder for future map-related upgrades)
   - Glossary: Discovered items display with filter option
   - Settings: Save, load, and import/export options

3. Floating Elements
   - Tooltip: Displays item information on hover
   - Held item: Shows item being moved by the player
   - Crafting item: Displays item being used for crafting
   - Tooltip message: Shows temporary game messages

## Data Flow

1. Game state is managed by useGameState hook
2. User interactions trigger functions in useInventory and useExploration hooks
3. These hooks update the game state
4. React components re-render based on the updated state
5. Particle effects are triggered by item updates and exploration

## Key Functions

- handleItemInteraction: Manages all item interactions (click, ctrl+click, right-click)
- startExploration: Initiates the exploration process
- processLootTick: Generates loot during exploration, applying map modifiers
- handleCtrlClick: Manages item movement between inventories
- upgradeMap: Enhances map rarity and adds modifiers
- addInventorySlot/addPouchSlot: Upgrades inventory sizes
- saveGame/loadGame: Manages game state persistence

## Future Expansion Points

1. Implement more uses for Enriching Juice
2. Add more upgrade options and progression paths
3. Create different types of maps with varying rewards and mechanics
4. Expand the crafting system with more item modifications
5. Implement a prestige system for long-term progression
6. Add achievements and statistics tracking
7. Introduce new game mechanics that interact with the existing systems

This structure provides a comprehensive overview of the current game mechanics, components, and systems, while also highlighting areas for potential future development.
