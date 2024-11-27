/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';
import itemsList from './components/itemslist';
import ExploreCanvas from './components/exploreCanvas';

function App() {
  // Initialize currentScene based on the presence of playerId cookie
  const [currentScene, setCurrentScene] = useState(() => {
    const savedPlayerId = Cookies.get('playerId');
    return savedPlayerId ? 'lobby' : 'characterCreation';
  });

  // Initialize selectedPng from cookies or default to null
  const [selectedPng, setSelectedPng] = useState(() => Cookies.get('selectedPng') || null);

  // Initialize selectedAtkPng from cookies or default to null
  const [selectedAtkPng, setSelectedAtkPng] = useState(() => Cookies.get('selectedAtkPng') || null);

  // Initialize stats from cookies or set default stats
  const [stats, setStats] = useState(() => {
    try {
      const savedStats = Cookies.get('stats');
      return savedStats
        ? JSON.parse(savedStats)
        : {
            level: 1,
            currentExp: 0,
            expToLevelUp: 100,
            attack: 9,
            defense: 8,
            maxHp: 100,
            currentMana: 50,
            maxMana: 50,
            agility: 9,
            dexterity: 6,
            luck: 8,
            intellect: 13,
            skillPoints: 0, // Added skillPoints for leveling up
          };
    } catch (error) {
      console.error('Failed to parse stats:', error);
      return {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 9,
        defense: 8,
        maxHp: 100,
        currentMana: 50,
        maxMana: 50,
        agility: 9,
        dexterity: 6,
        luck: 8,
        intellect: 13,
        skillPoints: 0,
      };
    }
  });

  // Initialize inventory from cookies or default to empty array
  const [inventory, setInventory] = useState(() => {
    try {
      const savedInventory = Cookies.get('inventory');
      return savedInventory ? JSON.parse(savedInventory) : [];
    } catch (error) {
      console.error('Failed to parse inventory:', error);
      return [];
    }
  });

  // Initialize equipped items from cookies or default to empty array
  const [equipped, setEquipped] = useState(() => {
    try {
      const savedEquipped = Cookies.get('equipped');
      return savedEquipped ? JSON.parse(savedEquipped) : [];
    } catch (error) {
      console.error('Failed to parse equipped items:', error);
      return [];
    }
  });

  // Initialize lastLoot as an empty array
  const [lastLoot, setLastLoot] = useState([]);

  // Initialize cursorPng from cookies or default to '/hand.png'
  const [cursorPng, setCursorPng] = useState(() => Cookies.get('cursorPng') || '/hand.png');

  // Initialize loading state
  const [loading, setLoading] = useState(false);

  // Initialize playerId from cookies or null
  const [playerId, setPlayerId] = useState(() => {
    return Cookies.get('playerId') || null;
  });

  // Synchronize stats with cookies whenever stats change
  useEffect(() => {
    try {
      Cookies.set('stats', JSON.stringify(stats), { expires: 7 });
    } catch (error) {
      console.error('Failed to save stats to cookies:', error);
    }
  }, [stats]);

  // Synchronize inventory with cookies whenever inventory changes
  useEffect(() => {
    try {
      Cookies.set('inventory', JSON.stringify(inventory), { expires: 7 });
    } catch (error) {
      console.error('Failed to save inventory to cookies:', error);
    }
  }, [inventory]);

  // Synchronize equipped items with cookies whenever equipped changes
  useEffect(() => {
    try {
      Cookies.set('equipped', JSON.stringify(equipped), { expires: 7 });
    } catch (error) {
      console.error('Failed to save equipped items to cookies:', error);
    }
  }, [equipped]);

  // Synchronize selectedPng, selectedAtkPng, and cursorPng with cookies whenever they change
  useEffect(() => {
    try {
      if (selectedPng) {
        Cookies.set('selectedPng', selectedPng, { expires: 7 });
      }
      if (selectedAtkPng) {
        Cookies.set('selectedAtkPng', selectedAtkPng, { expires: 7 });
      }
      Cookies.set('cursorPng', cursorPng, { expires: 7 });
    } catch (error) {
      console.error('Failed to save selected images or cursor:', error);
    }
  }, [selectedPng, selectedAtkPng, cursorPng]);

  // Function to add an item to the inventory
  const addItemToInventory = useCallback((itemId) => {
    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory, itemId];
      return updatedInventory;
    });
  }, []);

  // Function to remove an item from the inventory
  const removeItemFromInventory = useCallback((itemId) => {
    let removed = false;
    setInventory((prevInventory) => {
      const index = prevInventory.indexOf(itemId);
      if (index === -1) {
        console.warn(`Attempted to remove itemId ${itemId} which is not in inventory.`);
        return prevInventory;
      }
      const updatedInventory = [...prevInventory];
      updatedInventory.splice(index, 1);
      removed = true;
      return updatedInventory;
    });
    return removed;
  }, []);

  // Function to check if an item is in the inventory
  const hasItemInInventory = useCallback(
    (itemId) => {
      return inventory.includes(itemId);
    },
    [inventory]
  );

  // Function to equip an item


  const equipItem = useCallback(
    (itemId) => {
      const item = itemsList.find((itm) => itm.id === itemId);
  
      if (item && item.equippable) {
        setEquipped((prevEquipped) => {
          // Check if the item is already equipped
          if (prevEquipped.includes(itemId)) {
            console.warn(`Item with ID ${itemId} is already equipped.`);
            return prevEquipped;
          }
  
          // Add the new item to the equipped list
          const updatedEquipped = [...prevEquipped, itemId];
  
          // Update stats based on item properties
          setStats((prevStats) => {
            const newStats = { ...prevStats };
  
            if (item.attack) newStats.attack += item.attack;
            if (item.defense) newStats.defense += item.defense;
            if (item.agility) newStats.agility += item.agility;
            if (item.intellect) newStats.intellect += item.intellect;
            if (item.dexterity) newStats.dexterity += item.dexterity;
  
            return newStats;
          });
  
          return updatedEquipped;
        });
      } else {
        console.warn(`Item with ID ${itemId} is not equippable or does not exist.`);
      }
    },
    [itemsList, setEquipped, setStats] // Add dependencies here
  );
  

  // Function to unequip an item
  const unequipItem = useCallback((itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);

    if (item && item.equippable) {
      setEquipped((prevEquipped) => {
        const updatedEquipped = prevEquipped.filter((id) => id !== itemId);

        // Update stats based on item properties
        setStats((prevStats) => {
          const newStats = { ...prevStats };

          if (item.attack) newStats.attack -= item.attack;
          if (item.defense) newStats.defense -= item.defense;
          if (item.agility) newStats.agility -= item.agility;
          if (item.intellect) newStats.intellect -= item.intellect;
          if (item.dexterity) newStats.dexterity -= item.dexterity;

          return newStats;
        });

        return updatedEquipped;
      });
    }
  }, []);

  // Audio management
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const songs = [
    '/music/mstheme.mp3',
    '/music/westofhene.mp3',
    '/music/henemusic.mp3',
  ];

  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        playRandomTrack();
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }
    };

    window.addEventListener('click', startAudio, { once: true });
    return () => window.removeEventListener('click', startAudio);
  }, []);

  const playRandomTrack = () => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentTrackIndex(randomIndex);
  };

  const handleTrackEnd = () => {
    playRandomTrack();
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play next track:', error);
      });
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrackIndex !== null) {
      audioRef.current.src = songs[currentTrackIndex];
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play selected track:', error);
      });
    }
  }, [currentTrackIndex]);

  // Function to enter the explore scene
  const handleEnterExplore = () => {
    setCurrentScene('explore');
  };

  // Function to handle character creation
  const handleCharacterCreation = (defenseUrl, attackUrl, generatedStats) => {
    const newPlayerId = uuidv4();
    setPlayerId(newPlayerId);
    Cookies.set('playerId', newPlayerId, { expires: 7 });

    setSelectedPng(defenseUrl);
    setSelectedAtkPng(attackUrl);
    setStats(generatedStats);

    setCurrentScene('lobby');
  };

  // Function to start a battle
  const handleStartBattle = () => {
    setCurrentScene('battle');
  };

  // Function to handle returning to the lobby
  const handleBackToLobby = useCallback(() => {
    setCurrentScene('lobby');
  }, []);

  return (
    <div
      style={{
        cursor: `url(${cursorPng}), auto`,
      }}
    >
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        style={{ display: 'none' }}
      /> 
      {currentScene === 'characterCreation' ? (
        <CharacterCreation onCharacterCreate={handleCharacterCreation} />
      ) : currentScene === 'lobby' ? (
        stats ? ( // Only render Lobby if stats is defined
          <Lobby
            stats={stats}
            setStats={setStats} // Pass setStats here
            selectedPng={selectedPng}
            inventory={inventory}
            itemsList={itemsList}
            onEnterBattle={handleStartBattle}
            onEnterExplore={handleEnterExplore}
            lastLoot={lastLoot}
            setLastLoot={setLastLoot}
            equipped={equipped}
            playerId={playerId}
            equipItem={equipItem}
            unequipItem={unequipItem}
            addItemToInventory={addItemToInventory}
          />
        ) : (
          <div>Loading stats...</div> // Show a loading message until stats is ready
        )
      ) : currentScene === 'explore' ? (
        <ExploreCanvas
          atk={stats?.attack || 1}
          def={stats?.defense || 1}
          int={stats?.intellect || 1}
          dex={stats?.dexterity || 1}
          agility={stats?.agility || 1}
          luck={stats?.luck || 1}
          maxHp={stats?.maxHp || 1}
          selectedPng={selectedPng}
          playerId={playerId}
          playerLevel={stats?.level || 1}
          onBackToLobby={() => setCurrentScene('lobby')}
        />
      ) : currentScene === 'battle' ? (
        <BattleScene
          selectedPng={selectedPng}
          selectedAtkPng={selectedAtkPng}
          stats={stats}
          setStats={setStats} // Pass setStats here
          onBackToLobby={handleBackToLobby}
          addItemToInventory={addItemToInventory}
          setLastLoot={setLastLoot}
          inventory={inventory} // Pass inventory
          removeItemFromInventory={removeItemFromInventory} // Pass remove function
          hasItemInInventory={hasItemInInventory} // Pass the check function
        />
      ) : null}
    </div>
  );
}

export default App;
