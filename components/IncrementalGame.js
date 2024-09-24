import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import InventorySlot from './InventorySlot';
import Image from 'next/image';
import { ITEMS, MAP_ITEM, INITIAL_INVENTORY_SIZE, INITIAL_POUCH_SIZE, INITIAL_BOXES_INVENTORY_SIZE } from '../constants';
import useGameState from '../hooks/useGameState';
import useExploration from '../hooks/useExploration';
import useInventory from '../hooks/useInventory';
import useSaveLoad from '../hooks/useSaveLoad';

const IncrementalGame = () => {
  const { gameState, setGameState, activeTab, setActiveTab, leftActiveTab, setLeftActiveTab } = useGameState();
  const { startExploration, completeExploration, abandonExploration, processLootTick } = useExploration(gameState, setGameState);
  const { handleItemInteraction, addInventorySlot, addPouchSlot, getMap, getInventoryUpgradeCost, clearStorage, sortStorage, takeAllFromPouch, craftingItem, unlockBoxes } = useInventory(gameState, setGameState);
  const { saveGame, loadGame, exportGame, importGame, lastSaveTime, showSaveMessage } = useSaveLoad(gameState, setGameState, activeTab, setActiveTab);

  const [tooltipItem, setTooltipItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedItem, setSelectedItem] = useState(null);

  const handleMouseEnter = useCallback((e, item) => {
    if (item) {
      const rect = e.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - rect.right;
      const spaceOnLeft = rect.left;
      
      let x, y;
      if (spaceOnRight >= 200) {  // Assuming 200px as minimum width for tooltip
        x = rect.right + 10;
      } else if (spaceOnLeft >= 200) {
        x = rect.left - 210;  // 200px width + 10px offset
      } else {
        x = Math.max(10, rect.left - 100);  // Centered, with minimum 10px from left
      }
      
      y = rect.top;
      
      setTooltipPosition({ x, y });
      setTooltipItem(item);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipItem(null);
  }, []);

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
      autorun: true,
      boxesUnlocked: false,
      boxesInventory: Array(INITIAL_BOXES_INVENTORY_SIZE).fill(null),
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

  const shiniesCount = useMemo(() => gameState.inventory.reduce((sum, item) => {
    return sum + (item && item.id === 'shinies' ? item.count : 0);
  }, 0), [gameState.inventory]);

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
            unlockBoxes={unlockBoxes}
            boxesUnlocked={gameState.boxesUnlocked}
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

  const renderLeftTabContent = () => {
    if (!gameState.boxesUnlocked) {
      return (
        <div>
          <h3 className="text-xl font-bold mb-2">???</h3>
          <p>Unlock this feature to reveal its contents.</p>
        </div>
      );
    }

    switch (leftActiveTab) {
      case 'boxes':
        return (
          <div>
            <h3 className="text-xl font-bold mb-2">Boxes</h3>
            <div className="flex flex-wrap">
              {gameState.boxesInventory.map((item, index) => (
                <InventorySlot
                  key={index}
                  item={item}
                  index={`boxes_${index}`}
                  handleItemInteraction={handleItemInteraction}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  className="inventory-slot"
                />
              ))}
            </div>
          </div>
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
      const isInventorySlot = event.target.closest('.inventory-slot');
      
      if (gameState.craftingItem && !isInventorySlot) {
        event.preventDefault();
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

  useEffect(() => {
    if (gameState.tooltipMessage) {
      const timeoutId = setTimeout(() => {
        setGameState(prevState => ({
          ...prevState,
          tooltipMessage: null
        }));
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.tooltipMessage, setGameState]);

  useEffect(() => {
    if (gameState.boxesUnlocked && leftActiveTab === '???') {
      setLeftActiveTab('boxes');
    }
  }, [gameState.boxesUnlocked, leftActiveTab, setLeftActiveTab]);

  const cursorStyle = useMemo(() => {
    if (gameState.craftingItem) {
      return { cursor: 'none' };
    }
    return {};
  }, [gameState.craftingItem]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="flex flex-col h-screen bg-game-bg text-game-text p-[3vh]"
        style={cursorStyle}
      >
        {/* Top half */}
        <div className="flex-1 overflow-y-auto p-3">
          <h1 className="text-3xl font-bold mb-6">Map Explorer</h1>
          <ProgressBar progress={gameState.exploreProgress} />
          <div className="text-base mb-3">
            {gameState.exploring 
              ? `Exploring: ${gameState.countdown.toFixed(1)}s remaining` 
              : 'Ready to run'}
          </div>
          <div className="flex space-x-3 mb-3">
            <button
              className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded"
              onClick={getMap}
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
                  className={`bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded ${!gameState.activeMap ? 'opacity-50' : ''}`}
                  onClick={startExploration}
                  disabled={!gameState.activeMap}
                  style={{ cursor: gameState.activeMap ? 'pointer' : 'default' }}
                >
                  Run it!
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-3 mb-3">
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
        <div className="flex-1 flex">
          {/* Left side */}
          <div className="w-1/2 flex flex-col mr-2">
            <div className="flex">
              <button
                className={`px-4 py-2 font-semibold rounded-t-lg ${
                  leftActiveTab === (gameState.boxesUnlocked ? 'boxes' : '???') ? 'bg-gray-800 text-white' : 'bg-gray-600 text-gray-300'
                }`}
                onClick={() => setLeftActiveTab(gameState.boxesUnlocked ? 'boxes' : '???')}
              >
                {gameState.boxesUnlocked ? 'Boxes' : '???'}
              </button>
            </div>
            <div className="flex-1 p-3 bg-gray-800 rounded-b-lg overflow-y-auto">
              {renderLeftTabContent()}
            </div>
          </div>

          {/* Right side */}
          <div className="w-1/2 flex flex-col ml-2">
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
            <div className="flex-1 p-3 bg-gray-800 rounded-b-lg overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
        {tooltipItem && (
          <Tooltip item={tooltipItem} position={tooltipPosition} />
        )}
        {gameState.heldItem && (
          <div 
            className="fixed pointer-events-none"
            style={{ 
              left: mousePosition.x - 24,
              top: mousePosition.y - 24,
              zIndex: 1000,
              width: '48px',
              height: '48px',
            }}
          >
            <div className="w-full h-full relative">
              <Image
                src={`/assets/${gameState.heldItem.id}.png`}
                alt={gameState.heldItem.name}
                layout="fill"
                objectFit="contain"
                draggable="false"
              />
              {gameState.heldItem.stackable && gameState.heldItem.count > 1 && (
                <div 
                  className="absolute bottom-0 right-0 text-white text-[10px] font-bold pr-[2px] pb-[1px] select-none pointer-events-none"
                  style={{
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                  }}
                >
                  {gameState.heldItem.count}
                </div>
              )}
            </div>
          </div>
        )}
        {gameState.craftingItem && (
          <div 
            className="fixed pointer-events-none crafting-item"
            style={{ 
              left: mousePosition.x - 18,
              top: mousePosition.y - 18,
              zIndex: 1000
            }}
          >
            <Image
              src={`/assets/${gameState.craftingItem.id}.png`}
              alt={gameState.craftingItem.name}
              width={36}
              height={36}
            />
          </div>
        )}
        {gameState.tooltipMessage && (
          <div 
            className="fixed bg-black bg-opacity-75 text-white p-2 rounded"
            style={{ 
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
              zIndex: 1001
            }}
          >
            {gameState.tooltipMessage}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default IncrementalGame;