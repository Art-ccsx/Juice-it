import React, { useState, useEffect } from 'react';

const Settings = ({ saveGame, exportGame, importGame, lastSaveTime, showSaveMessage }) => {
  const [timeSinceLastSave, setTimeSinceLastSave] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = lastSaveTime ? (now - lastSaveTime) / 1000 : 0; // Convert to seconds
      setTimeSinceLastSave(diff);
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(timer);
  }, [lastSaveTime]);

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importGame(file);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Settings</h3>
      <div className="flex items-center mb-4">
        <span className="mr-2">Last save: {timeSinceLastSave.toFixed(1)}s ago</span>
        {timeSinceLastSave < 10 && (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        )}
        {showSaveMessage && showSaveMessage.show && (
          <span className="ml-2 text-green-500 font-bold">
            {showSaveMessage.isAuto ? 'Autosaved!' : 'Saved!'}
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded"
          onClick={() => saveGame(false)}
        >
          Save Game
        </button>
        <button
          className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded"
          onClick={exportGame}
        >
          Export Game File
        </button>
        <label className="bg-game-button hover:bg-game-button-hover text-white font-bold py-2 px-4 rounded cursor-pointer text-center">
          Import Game File
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
};

export default Settings;