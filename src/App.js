// src/App.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';
import itemsList from './components/itemslist';

function App() {
  const [currentScene, setCurrentScene] = useState('characterCreation');
  const [selectedPng, setSelectedPng] = useState(null);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]); // Initialize inventory
  const [cursorPng, setCursorPng] = useState('/hand.png'); // Default cursor
  const [loading, setLoading] = useState(false); // Loading state

  // Load saved data from cookies on mount
  useEffect(() => {
    const savedPng = Cookies.get('selectedPng');
    const savedStats = Cookies.get('stats');
    const savedCursor = Cookies.get('cursorPng');
    const savedInventory = Cookies.get('inventory');

    if (savedPng && savedStats) {
      setSelectedPng(savedPng);
      setStats(JSON.parse(savedStats));
      setCurrentScene('lobby'); // Navigate to lobby if character exists
    }

    if (savedCursor) {
      setCursorPng(savedCursor);
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }
  }, []);

  // Handle character creation
  const handleCharacterCreation = (url, generatedStats) => {
    setSelectedPng(url);
    setStats(generatedStats);
    Cookies.set('selectedPng', url, { expires: 7 });
    Cookies.set('stats', JSON.stringify(generatedStats), { expires: 7 });
    setCurrentScene('lobby');
  };

  // Navigate to battle scene
  const handleStartBattle = () => {
    setCurrentScene('battle');
  };

  // Return to lobby from battle
  const handleBackToLobby = () => {
    setLoading(true); // Start loading
    const savedStats = Cookies.get('stats');
    const savedPng = Cookies.get('selectedPng');
    const savedCursor = Cookies.get('cursorPng');
    const savedInventory = Cookies.get('inventory');

    if (savedStats) {
      setStats(JSON.parse(savedStats)); // Update stats from cookies
    }

    if (savedPng) {
      setSelectedPng(savedPng); // Update selected PNG from cookies
    }

    if (savedCursor) {
      setCursorPng(savedCursor); // Update cursor PNG from cookies
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }

    setLoading(false); // Stop loading
    setCurrentScene('lobby'); // Switch to the lobby
  };

  // Update player stats
  const updateStats = (newStats) => {
    setStats(newStats);
    Cookies.set('stats', JSON.stringify(newStats), { expires: 7 });
  };

  // Add an item to the inventory
  const addItemToInventory = (itemId) => {
    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory, itemId];
      Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
      return updatedInventory;
    });
  };

  // Remove an item from the inventory
  // const removeItemFromInventory = (itemId) => {
  //   setInventory((prevInventory) => {
  //     const index = prevInventory.indexOf(itemId);
  //     if (index > -1) {
  //       const updatedInventory = [...prevInventory];
  //       updatedInventory.splice(index, 1);
  //       Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
  //       return updatedInventory;
  //     }
  //     return prevInventory;
  //   });
  // };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 text-white"
      style={{
        cursor: cursorPng ? `url(${cursorPng}), auto` : 'default', // Set custom cursor
      }}
    >
      <audio src="/music/mstheme.mp3" autoPlay loop />
      {loading ? (
        <div>Loading...</div> // Display loading indicator
      ) : currentScene === 'characterCreation' ? (
        <CharacterCreation onCharacterCreate={handleCharacterCreation} />
      ) : currentScene === 'lobby' ? (
        <Lobby
          stats={stats}
          selectedPng={selectedPng}
          inventory={inventory}
          itemsList={itemsList} // Pass items list to Lobby
          onEnterBattle={handleStartBattle}
          addItemToInventory={addItemToInventory} // Pass add item function
        />
      ) : currentScene === 'battle' ? (
        <BattleScene
          selectedPng={selectedPng}
          stats={stats}
          onBackToLobby={handleBackToLobby}
          updateStats={updateStats}
        />
      ) : null}
    </div>
  );
}

export default App;
