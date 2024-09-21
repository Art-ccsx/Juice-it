import { useState, useCallback, useEffect } from 'react';

const useSaveLoad = (gameState, setGameState, activeTab, setActiveTab) => {
  const [lastSaveTime, setLastSaveTime] = useState(new Date());
  const [showSaveMessage, setShowSaveMessage] = useState({ show: false, isAuto: false });

  const saveGame = useCallback((isAuto = false) => {
    const saveState = {
      gameState: {
        ...gameState,
        discoveredItems: Array.from(gameState.discoveredItems),
        autorun: gameState.autorun, // Include autorun in the save
      },
      activeTab,
    };
    localStorage.setItem('mapExplorerSave', JSON.stringify(saveState));
    setLastSaveTime(new Date());
    setShowSaveMessage({ show: true, isAuto });
    setTimeout(() => setShowSaveMessage({ show: false, isAuto }), 2000);
    return saveState;
  }, [gameState, activeTab]);

  const loadGame = useCallback((loadedState) => {
    if (typeof loadedState === 'string') {
      try {
        loadedState = JSON.parse(loadedState);
      } catch (error) {
        console.error('Error parsing save:', error);
        return;
      }
    }
    setGameState(prevState => {
      const discoveredItems = loadedState.gameState.discoveredItems;
      return {
        ...prevState,
        ...loadedState.gameState,
        discoveredItems: new Set(
          Array.isArray(discoveredItems) ? discoveredItems :
          typeof discoveredItems === 'object' ? Object.keys(discoveredItems) :
          []
        ),
        autorun: loadedState.gameState.autorun ?? true, // Load autorun, default to true if not present
      };
    });
    setActiveTab(loadedState.activeTab);
  }, [setGameState, setActiveTab]);

  const exportGame = useCallback(() => {
    const saveState = saveGame();
    const blob = new Blob([JSON.stringify(saveState)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map_explorer_save.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [saveGame]);

  const importGame = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameState = JSON.parse(e.target.result);
        loadGame(gameState);
      } catch (error) {
        console.error('Error parsing import file:', error);
        alert('Invalid import file');
      }
    };
    reader.readAsText(file);
  }, [loadGame]);

  // Autosave every 10 seconds
  useEffect(() => {
    const autosaveInterval = setInterval(() => saveGame(true), 10000);
    return () => clearInterval(autosaveInterval);
  }, [saveGame]);

  return { saveGame, loadGame, exportGame, importGame, lastSaveTime, showSaveMessage };
};

export default useSaveLoad;