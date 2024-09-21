# Inventory Logic

This document outlines the implemented inventory logic for the Map Explorer game.

## Item Interaction

The main function handling item interactions is `handleItemInteraction(index, isCtrlClick, isRightClick)`.

### Left-click Behavior (isCtrlClick = false, isRightClick = false)

1. If no item is held and no crafting item is active:
   - Pick up the clicked item
   - Remove the item from its current slot

2. If an item is held and no crafting item is active:
   - If the clicked slot is empty:
     - Place the held item in the empty slot if it's allowed:
       - Only map items can be placed in the active map slot
       - Items cannot be placed directly into the pouch
       - Items can be placed in any empty storage slot
   - If the clicked slot contains an item:
     - If it's the same item type and stackable:
       - Add as many items as possible to the existing stack
       - Keep any excess in hand
     - If it's a different item or not stackable:
       - Swap the held item with the item in the slot (except for pouch slots)

3. If a crafting item is active:
   - If the clicked item is applicable for the crafting action:
     - Apply the crafting item to the clicked item (crafting logic to be implemented)
     - Reduce the count of the original crafting item stack by 1
     - If the original stack is depleted, remove it
     - Remove the active crafting item indicator
   - If the clicked item is not applicable:
     - No action

### Ctrl-click Behavior (isCtrlClick = true, isRightClick = false)

Ctrl-click only works when the hand is empty and no crafting item is active:
- In pouch: 
  - First, try to stack the item with existing stacks of the same item type in storage
  - If there are remaining items, place them in the first available empty slot in storage
  - Update the pouch by either removing the item or reducing its count
- In storage (if it's a map): Move the item to the active map slot if it's empty
- In active map slot: Move the item to the first available slot in storage

### Right-click Behavior (isRightClick = true)

Right-clicking on an inventory slot prevents the default context menu from appearing and instead:

1. If no crafting item is active:
   - If the clicked item is usable:
     - Create a 100% opacity copy of the item as the active crafting item indicator
     - This indicator follows the cursor
   - If the clicked item is not usable:
     - No action

2. If a crafting item is active:
   - Cancel the crafting action and remove the active crafting item indicator

## Crafting Item Indicator

- The crafting item indicator is not an actual item in the inventory
- It cannot be placed back into the inventory or interacted with directly
- It serves only as a visual indicator of what item is being used for crafting
- Left-clicking while the indicator is active will attempt to use the item on the clicked inventory slot
- Right-clicking while the indicator is active will cancel the crafting action

All movements respect stacking and inventory space rules.

## Item Stacking

- All items except maps can be stacked up to 999
- Maps cannot be stacked
- When adding to a stack, if the total exceeds the max stack size, the excess remains in hand or in the original slot

## Pouch Behavior

- Items in the pouch cannot be directly interacted with during exploration
- The pouch is always sorted by item rarity
- Items cannot be placed directly from storage into the pouch
- Ctrl-clicking items in the pouch will attempt to move them to storage, stacking with existing items when possible
- The "Take All" function moves items from the pouch to the main inventory, respecting stacking rules
- When the pouch is sorted, items maintain their original indices for interaction purposes

## Active Map Slot

- The active map is treated as a special slot with the index 'activeSlot'
- It can hold only map items

## Held Item

- The held item is stored in the game state as `heldItem`
- It follows the cursor and can be placed in empty slots or swapped with other items, following the rules above

## Crafting Item

- The crafting item is stored in the game state as `craftingItem`
- It is created by right-clicking on a usable item
- It follows the cursor with 50% opacity
- It blocks all other inventory actions until used or cancelled

## Sorting Logic

- The pouch is always sorted by rarity (highest to lowest)
  - Each item in the pouch maintains its original index to ensure correct interaction after sorting
- When sorting storage:
  - Items are sorted by rarity (highest to lowest)
  - Within the same rarity, items are sorted alphabetically by name
  - Map items are always placed at the end of the sorted inventory

## Upgrade System

- Inventory and pouch upgrades cost shinies
- The cost increases exponentially with each upgrade

This document reflects the current implementation and may need to be updated as new features are added or existing ones are modified.