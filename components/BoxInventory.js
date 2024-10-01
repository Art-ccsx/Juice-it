import React from 'react';
import useBoxSystem from '../hooks/useBoxSystem';

const BoxInventory = ({ gameState, setGameState }) => {
  const { openBox } = useBoxSystem(gameState, setGameState);

  const handleBoxClick = (index) => {
    console.log('Box clicked:', index); // Add this log
    openBox(index);
  };

  // ... rest of the component ...
};

export default BoxInventory;