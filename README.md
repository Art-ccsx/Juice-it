# Map Explorer Game

## Overview
Map Explorer is an incremental game where players explore maps to discover resources and upgrade their capabilities. The game features an engaging loop of acquiring maps, exploring them, and managing inventory.

## Game Components
1. IncrementalGame: Main game component
2. Inventory: Displays player's inventory (Storage)
3. Pouch: Displays temporary inventory during exploration
4. InventorySlot: Individual slot in the inventory
5. ActiveMap: Displays the currently active map
6. ProgressBar: Shows exploration progress
7. UpgradeTab: Displays available upgrades
8. Tooltip: Shows item information on hover
9. Glossary: Displays all items, with an option to show only discovered items
10. Settings: Manages game saving, loading, and import/export

## Game Mechanics
1. Exploration: Players explore maps to discover items
2. Inventory Management: Players move items between inventory slots, pouch, and active map slot
3. Upgrades: Players can upgrade their inventory and pouch size
4. Item Discovery: Different items have various drop chances
5. Save/Load: Players can save and load their game progress, with autosave functionality
6. Import/Export: Players can export their game state and import it later

## Items
1. Map (Common): Used to start exploration
2. Enriching Juice (Common): A mysterious liquid that can enhance the quality of maps (10% drop chance)
3. Modifying Prism (Uncommon): A prism that can alter the properties of other items (10% drop chance)
4. Shinies (Common): Shiny objects that serve as currency (50% drop chance)

## User Interface
1. Storage grid: Expandable inventory for long-term item storage
2. Pouch: Temporary inventory filled during exploration
3. Active Map slot
4. Progress bar for exploration
5. Upgrade tabs for different categories of upgrades
6. Glossary with toggle for showing only discovered items
7. Settings panel for save/load and import/export functionality

## Technologies Used
1. React for the frontend
2. react-dnd for drag and drop functionality
3. Tailwind CSS for styling

## File Structure
1. components/: Contains all React components
2. hooks/: Custom React hooks for game logic
3. constants.js: Defines game constants and item data
4. styles/globals.css: Global styles

## Current Development State
- Basic game loop implemented (get map, explore, discover items)
- Inventory management with drag and drop
- Pouch system for temporary item storage during exploration
- Upgrade system for adding inventory and pouch slots
- Tooltip system for displaying item information
- Glossary system with discovered items tracking
- Save/Load functionality with autosave every 10 seconds
- Manual save functionality
- Import/Export game state
- Refactored code structure with custom hooks for better organization
- Keyboard shortcuts: 'R' to reload page, 'P' to reset game
- Stackable items (up to 20 for certain items)

## Next Steps
1. Implement map enhancement using Enriching Juice
2. Add more upgrade options
3. Create different types of maps with varying rewards
4. Balance item drop rates and add more items
5. Implement uses for Modifying Prism and Shinies
6. Add more game mechanics to increase depth and engagement
7. Implement a prestige system
8. Add achievements and statistics tracking
9. Further refactor components for better maintainability

## How to Run
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in your browser

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

This README provides a snapshot of the game's current state and will be updated as new features are added or changes are made.