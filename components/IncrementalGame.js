import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Inventory from './Inventory';
import ActiveMap from './ActiveMap';
import ProgressBar from './ProgressBar';
import UpgradeTab from './UpgradeTab';
import Tooltip from './Tooltip';
import Pouch from './Pouch';
import Storage from './Storage';
import Glossary from './Glossary';
import Settings from './Settings';
import { ITEMS, MAP_ITEM, INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE } from '../constants';
import useGameState from '../hooks/useGameState';
import useExploration from '../hooks/useExploration';
import useInventory from '../hooks/useInventory';
import useSaveLoad from '../hooks/useSaveLoad';

const IncrementalGame = () => {
  const { gameState, setGameState, activeTab, setActiveTab } = useGameState();
  const { startExploration, completeExploration, abandonExploration, processLootTick } = useExploration(gameState, setGameState);
  const { handleItemInteraction, addInventorySlot, addPouchSlot, getMap, getInventoryUpgradeCost, clearStorage, sortStorage, takeAllFromPouch, craftingItem } = useInventory(gameState, setGameState);
  const { saveGame, loadGame, exportGame, importGame, lastSaveTime, showSaveMessage } = useSaveLoad(gameState, setGameState, activeTab, setActiveTab);

  const [tooltipItem, setTooltipItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState(null);

  const handleMouseEnter = (e, item) => {
    if (item) {
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
      setTooltipItem(item);
    }
  };

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (tooltipItem) {
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
    }
  }, [tooltipItem]);

  const handleMouseLeave = () => {
    setTooltipItem(null);
  };

  const resetGame = useCallback(() => {
    localStorage.removeItem('mapExplorerSave');
    setGameState({
      exploreTime: 10,
      exploring: false,
      exploreProgress: 0,
      countdown: 0,
      inventory: Array(INITIAL_INVENTORY_SIZE).fill(null),
      pouch: Array(INITIAL_POUCH_SIZE).fill(null),
      activeMap: null,
      inventoryUpgrades: 0,
      pouchUpgrades: 0,
      discoveredItems: new Set(),
      autorun: true, // Set autorun to true by default
    });
    setActiveTab('general');
  }, [setGameState, setActiveTab]);

  const handleRightClick = useCallback((item, index) => {
    if (selectedItem && selectedItem.index === index) {
      setSelectedItem(null);
    } else if (item && item.usable) {
      setSelectedItem({ ...item, index });
    }
  }, [selectedItem]);

  const cancelCrafting = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      craftingItem: null
    }));
  }, [setGameState]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        window.location.reload();
      } else if (event.key === 'p' || event.key === 'P') {
        resetGame();
      } else if (event.key === 'Escape') {
        cancelCrafting();
      }
    };

    const handleGlobalContextMenu = (event) => {
      if (gameState.craftingItem) {
        event.preventDefault();
        cancelCrafting();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('contextmenu', handleGlobalContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [resetGame, cancelCrafting, gameState.craftingItem]);

  useEffect(() => {
    const savedGame = localStorage.getItem('mapExplorerSave');
    if (savedGame) {
      loadGame(savedGame);
    }
  }, [loadGame]);

  const shiniesCount = gameState.inventory.reduce((sum, item) => sum + (item && item.id === 'shinies' ? item.count : 0), 0);

  const findEmptyStorageSlot = useCallback(() => {
    return gameState.inventory.findIndex(item => item === null);
  }, [gameState.inventory]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <UpgradeTab
            inventorySlots={gameState.inventory.length}
            pouchSlots={gameState.pouch.length}
            addInventorySlot={addInventorySlot}
            addPouchSlot={addPouchSlot}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            getInventoryUpgradeCost={getInventoryUpgradeCost}
            shiniesCount={shiniesCount}
          />
        );
      case 'map':
        return (
          <div>
            <h3 className="text-xl font-bold mb-2">Map Upgrades</h3>
            <p>Map upgrades will be displayed here.</p>
          </div>
        );
      case 'glossary':
        return (
          <Glossary
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            discoveredItems={gameState.discoveredItems}
          />
        );
      case 'settings':
        return (
          <Settings
            saveGame={saveGame}
            loadGame={loadGame}
            exportGame={exportGame}
            importGame={importGame}
            lastSaveTime={lastSaveTime}
            showSaveMessage={showSaveMessage}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (gameState.autorun && !gameState.exploring && gameState.activeMap) {
      startExploration();
    }
  }, [gameState.autorun, gameState.exploring, gameState.activeMap, startExploration]);

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    const handleGlobalRightClick = (event) => {
      // Check if the click is on an inventory slot
      const isInventorySlot = event.target.closest('.inventory-slot');
      
      if (gameState.craftingItem && !isInventorySlot) {
        event.preventDefault();
        console.log('Global right-click: Cancelling crafting mode');
        setGameState(prevState => ({
          ...prevState,
          craftingItem: null,
        }));
      }
    };

    document.addEventListener('contextmenu', handleGlobalRightClick);

    return () => {
      document.removeEventListener('contextmenu', handleGlobalRightClick);
    };
  }, [gameState.craftingItem, setGameState]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="flex flex-col h-screen bg-game-bg text-game-text p-[5vh]"
      >
        {/* Top half */}
        <div className="flex-1 overflow-y-auto p-4">
          <h1 className="text-4xl font-bold mb-8">Map Explorer</h1>
          <ProgressBar progress={gameState.exploreProgress} />
          <div className="text-lg mb-4">
            {gameState.exploring 
              ? `Exploring: ${gameState.countdown.toFixed(1)}s remaining` 
              : 'Ready to run'}
          </div>
          <div className="flex space-x-4 mb-4">
            <button
              className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded"
              onClick={getMap}
              disabled={gameState.exploring}
            >
              Get a Map
            </button>
            {gameState.exploring ? (
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={abandonExploration}
              >
                Abandon Map
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameState.autorun}
                    onChange={() => setGameState(prevState => ({ ...prevState, autorun: !prevState.autorun }))}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-white">Autorun</span>
                </label>
                <button
                  className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded"
                  onClick={startExploration}
                  disabled={!gameState.activeMap}
                >
                  Run it!
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-4 mb-4">
            <ActiveMap
              activeMap={gameState.activeMap}
              handleItemInteraction={handleItemInteraction}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              isExploring={gameState.exploring}
              craftingItem={craftingItem}
            />
            <Pouch
              inventory={gameState.pouch}
              handleItemInteraction={handleItemInteraction}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              isExploring={gameState.exploring}
              takeAllFromPouch={takeAllFromPouch}
              craftingItem={craftingItem}
            />
          </div>
          <Storage
            inventory={gameState.inventory}
            handleItemInteraction={handleItemInteraction}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            clearStorage={clearStorage}
            sortStorage={sortStorage}
            craftingItem={craftingItem}
          />
        </div>

        {/* Bottom half */}
        <div className="flex-1 flex flex-col">
          <div className="flex">
            <button
              className={`px-4 py-2 font-semibold rounded-t-lg ${
                activeTab === 'general' ? 'bg-gray-800 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-4 py-2 font-semibold rounded-t-lg ml-2 ${
                activeTab === 'map' ? 'bg-gray-800 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
            <button
              className={`px-4 py-2 font-semibold rounded-t-lg ml-2 ${
                activeTab === 'glossary' ? 'bg-gray-800 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              onClick={() => setActiveTab('glossary')}
            >
              Glossary
            </button>
            <button
              className={`px-4 py-2 font-semibold rounded-t-lg ml-2 ${
                activeTab === 'settings' ? 'bg-gray-800 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
          <div className="flex-1 p-4 bg-gray-800 rounded-b-lg overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
        {tooltipItem && (
          <Tooltip item={tooltipItem} position={tooltipPosition} />
        )}
        {gameState.heldItem && (
          <div 
            className="fixed pointer-events-none"
            style={{ 
              left: mousePosition.x - 32, // Center the item on the cursor
              top: mousePosition.y - 32,  // Center the item on the cursor
              width: '64px',  // Match the size of inventory slots
              height: '64px',  // Match the size of inventory slots
              zIndex: 1000
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: gameState.heldItem.shape }} />
            {gameState.heldItem.stackable && gameState.heldItem.count > 1 && (
              <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {gameState.heldItem.count}
              </div>
            )}
          </div>
        )}
        {gameState.craftingItem && (
          <div 
            className="fixed pointer-events-none"
            style={{ 
              left: mousePosition.x - 16, // Adjust to make the icon smaller
              top: mousePosition.y - 16,  // Adjust to make the icon smaller
              width: '32px',  // Make the icon smaller (half the original size)
              height: '32px', // Make the icon smaller (half the original size)
              zIndex: 1000
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: gameState.craftingItem.shape }} />
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default IncrementalGame;