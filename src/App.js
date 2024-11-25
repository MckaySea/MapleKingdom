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
  // eslint-disable-next-line no-unused-vars
  const [selectedAtkPng, setSelectedAtkPng] = useState(null);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState([]);
  const [lastLoot, setLastLoot] = useState([]);
  const [cursorPng, setCursorPng] = useState('/hand.png');
  const [loading, setLoading] = useState(false);

  // Initialize cookies
  useEffect(() => {
    // Initialize Equipped
    const savedEquipped = Cookies.get('equipped');
    if (savedEquipped) {
      setEquipped(JSON.parse(savedEquipped));
    } else {
      Cookies.set('equipped', JSON.stringify([]), { expires: 7 });
    }

    // Initialize Stats
    const savedStats = Cookies.get('stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      const initialStats = {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 9,
        defense: 8,
        maxHp: 100,
        agility: 9,
        dexterity: 6,
        luck: 8,
        intellect: 13,
      };
      setStats(initialStats);
      Cookies.set('stats', JSON.stringify(initialStats), { expires: 7 });
    }

    // Initialize Inventory
    const savedInventory = Cookies.get('inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      Cookies.set('inventory', JSON.stringify([]), { expires: 7 });
    }

    // Initialize Selected PNGs
    const savedPng = Cookies.get('selectedPng');
    if (savedPng) {
      setSelectedPng(savedPng);
    }

    const savedAtkPng = Cookies.get('selectedAtkPng');
    if (savedAtkPng) {
      setSelectedAtkPng(savedAtkPng);
    }

    // Initialize Cursor PNG
    const savedCursor = Cookies.get('cursorPng');
    if (savedCursor) {
      setCursorPng(savedCursor);
    }
  }, []);

  // Function to handle character creation
  const handleCharacterCreation = (defenseUrl, attackUrl, generatedStats) => {
    setSelectedPng(defenseUrl);
    setSelectedAtkPng(attackUrl);
    setStats(generatedStats);
    Cookies.set('selectedPng', defenseUrl, { expires: 7 });
    Cookies.set('selectedAtkPng', attackUrl, { expires: 7 });
    Cookies.set('stats', JSON.stringify(generatedStats), { expires: 7 });
    setCurrentScene('lobby');
  };

  // Navigate to battle
  const handleStartBattle = () => {
    setCurrentScene('battle');
  };

  // Return to lobby
  const handleBackToLobby = () => {
    setLoading(true);
    const savedStats = Cookies.get('stats');
    const savedPng = Cookies.get('selectedPng');
    const savedAtkPng = Cookies.get('selectedAtkPng');
    const savedCursor = Cookies.get('cursorPng');
    const savedInventory = Cookies.get('inventory');
    const savedEquipped = Cookies.get('equipped');

    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    if (savedPng) {
      setSelectedPng(savedPng);
    }

    if (savedAtkPng) {
      setSelectedAtkPng(savedAtkPng);
    }

    if (savedCursor) {
      setCursorPng(savedCursor);
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    }

    if (savedEquipped) {
      setEquipped(JSON.parse(savedEquipped));
    }

    setLoading(false);
    setCurrentScene('lobby');
  };

  // Add an item to inventory
  const addItemToInventory = (itemId) => {
    const item = itemsList.find(itm => itm.id === itemId);
    if (item) {
      const updatedInventory = [...inventory, item.id];
      setInventory(updatedInventory);
      Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
    }
  };

  // Equip item function
  const equipItem = (itemId) => {
    const item = itemsList.find(itm => itm.id === itemId && itm.equippable);
    if (item) {
      // Check if an item of the same type is already equipped
      const currentlyEquippedSameType = equipped.find(eqId => {
        const eqItem = itemsList.find(itm => itm.id === eqId);
        return eqItem && eqItem.type === item.type;
      });

      if (currentlyEquippedSameType) {
        // Unequip the currently equipped item of the same type
        unequipItem(currentlyEquippedSameType);
      }

      if (!equipped.includes(itemId)) {
        const newEquipped = [...equipped, itemId];
        setEquipped(newEquipped);
        Cookies.set('equipped', JSON.stringify(newEquipped), { expires: 7 });

        // Update stats
        updateStats(item, 'equip');
      }
    }
  };

  // Unequip item function
  const unequipItem = (itemId) => {
    const item = itemsList.find(itm => itm.id === itemId && itm.equippable);
    if (item && equipped.includes(itemId)) {
      const newEquipped = equipped.filter(id => id !== itemId);
      setEquipped(newEquipped);
      Cookies.set('equipped', JSON.stringify(newEquipped), { expires: 7 });

      // Update stats
      updateStats(item, 'unequip');
    }
  };

  // Update stats
  const updateStats = (item, action) => {
    const multiplier = action === 'equip' ? 1 : -1;
    const currentStats = JSON.parse(Cookies.get('stats') || '{}');

    const updatedStats = {
      ...currentStats,
      attack: (currentStats.attack || 0) + (item.attack || 0) * multiplier,
      defense: (currentStats.defense || 0) + (item.defense || 0) * multiplier,
      maxHp: (currentStats.maxHp || 0) + (item.maxHp || 0) * multiplier,
      agility: (currentStats.agility || 0) + (item.agility || 0) * multiplier,
      intellect: (currentStats.intellect || 0) + (item.intellect || 0) * multiplier,
      dexterity: (currentStats.dexterity || 0) + (item.dexterity || 0) * multiplier,
      luck: (currentStats.luck || 0) + (item.luck || 0) * multiplier,
      // Add other stats as needed
    };

    setStats(updatedStats);
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 text-white"
      style={{
        cursor: cursorPng ? `url(${cursorPng}), auto` : 'default',
      }}
    >
      <audio src="/music/mstheme.mp3" autoPlay loop />
      {loading ? (
        <div>Loading...</div>
      ) : currentScene === 'characterCreation' ? (
        <CharacterCreation onCharacterCreate={handleCharacterCreation} />
      ) : currentScene === 'lobby' ? (
        <Lobby
          stats={stats}
          selectedPng={selectedPng}
          inventory={inventory}
          itemsList={itemsList}
          onEnterBattle={handleStartBattle}
          addItemToInventory={addItemToInventory}
          lastLoot={lastLoot}
          setLastLoot={setLastLoot}
          equipped={equipped}
          equipItem={equipItem}
          unequipItem={unequipItem}
        />
      ) : currentScene === 'battle' ? (
        <BattleScene
          selectedPng={selectedPng}
          stats={stats}
          onBackToLobby={handleBackToLobby}
          
          addItemToInventory={addItemToInventory}
          setLastLoot={setLastLoot}
        />
      ) : null}
    </div>
  );
}

export default App;
