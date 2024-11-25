// src/App.js

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';
import itemsList from './components/itemslist';


function App() {
  const [currentScene, setCurrentScene] = useState('characterCreation');
  const [selectedPng, setSelectedPng] = useState(null);        // Defense Image
  const [selectedAtkPng, setSelectedAtkPng] = useState(null);  // Attack Image
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]); // Initialize inventory
  const [lastLoot, setLastLoot] = useState([]); // State to track last loot
  const [cursorPng, setCursorPng] = useState('/hand.png'); // Default cursor
  const [loading, setLoading] = useState(false); // Loading state

  // Load saved data from cookies on mount
  useEffect(() => {
    const savedPng = Cookies.get('selectedPng');
    const savedAtkPng = Cookies.get('selectedAtkPng'); // Retrieve attack PNG
    const savedStats = Cookies.get('stats');
    const savedCursor = Cookies.get('cursorPng');
    const savedInventory = Cookies.get('inventory');

    if (savedPng && savedAtkPng && savedStats) { // Ensure all are present
      setSelectedPng(savedPng);
      setSelectedAtkPng(savedAtkPng);
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
  const handleCharacterCreation = (defenseUrl, attackUrl, generatedStats) => {
    setSelectedPng(defenseUrl);
    setSelectedAtkPng(attackUrl);
    setStats(generatedStats);
    Cookies.set('selectedPng', defenseUrl, { expires: 7 });
    Cookies.set('selectedAtkPng', attackUrl, { expires: 7 });
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
    const savedAtkPng = Cookies.get('selectedAtkPng'); // Retrieve attack PNG
    const savedCursor = Cookies.get('cursorPng');
    const savedInventory = Cookies.get('inventory');

    if (savedStats) {
      setStats(JSON.parse(savedStats)); // Update stats from cookies
    }

    if (savedPng) {
      setSelectedPng(savedPng); // Update selected PNG from cookies
    }

    if (savedAtkPng) {
      setSelectedAtkPng(savedAtkPng); // Update attack PNG from cookies
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


  // Add an item to the inventory
  const addItemToInventory = (item) => { // Accept entire item object
    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory, item];
      Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
      return updatedInventory;
    });
  };

  // Remove an item from the inventory (Optional)
  // const removeItemFromInventory = (itemId) => {
  //   setInventory((prevInventory) => {
  //     const index = prevInventory.findIndex(item => item.id === itemId);
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
          selectedAtkPng={selectedAtkPng} // Pass attack PNG to Lobby
          inventory={inventory}
          itemsList={itemsList} // Pass items list to Lobby
          onEnterBattle={handleStartBattle}
          addItemToInventory={addItemToInventory} // Pass add item function
          lastLoot={lastLoot} // Pass lastLoot to Lobby
          setLastLoot={setLastLoot} // Pass setLastLoot to Lobby
        />
      ) : currentScene === 'battle' ? (
        <BattleScene
          selectedPng={selectedPng}
          selectedAtkPng={selectedAtkPng} // Pass attack PNG to BattleScene
          stats={stats}
          onBackToLobby={handleBackToLobby}
          addItemToInventory={addItemToInventory} // Pass addItemToInventory to BattleScene
          setLastLoot={setLastLoot} // Pass setLastLoot to BattleScene
        />
      ) : null}
    </div>
  );
}

export default App;
