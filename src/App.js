/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';
import itemsList from './components/itemslist';
import ExploreCanvas from './components/exploreCanvas';

function App() {
  const [currentScene, setCurrentScene] = useState(() => {
    const savedPlayerId = Cookies.get('playerId');
    return savedPlayerId ? 'lobby' : 'characterCreation';
  });
  const [selectedPng, setSelectedPng] = useState(null);
  const [selectedAtkPng, setSelectedAtkPng] = useState(null);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState([]);
  const [lastLoot, setLastLoot] = useState([]);
  const [cursorPng, setCursorPng] = useState('/hand.png');
  const [loading, setLoading] = useState(false);

  const [playerId, setPlayerId] = useState(() => {
    return Cookies.get('playerId') || null;
  });

  const addItemToInventory = (itemId) => {
    setInventory((prevInventory) => {
      const updatedInventory = [...prevInventory, itemId];
      try {
        Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
      } catch (error) {
        console.error('Failed to save inventory to cookies:', error);
      }
      return updatedInventory;
    });
  };

  const equipItem = (itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);

    if (item && item.equippable) {
      setEquipped((prevEquipped) => {
        if (prevEquipped.includes(itemId)) return prevEquipped; // Already equipped

        const updatedEquipped = [...prevEquipped, itemId];

        // Update stats based on item properties
        setStats((prevStats) => {
          const newStats = { ...prevStats };

          if (item.attack) newStats.attack += item.attack;
          if (item.defense) newStats.defense += item.defense;

          try {
            Cookies.set('stats', JSON.stringify(newStats), { expires: 7 });
          } catch (error) {
            console.error('Failed to save stats to cookies:', error);
          }
          return newStats;
        });

        try {
          Cookies.set('equipped', JSON.stringify(updatedEquipped), { expires: 7 });
        } catch (error) {
          console.error('Failed to save equipped items to cookies:', error);
        }
        return updatedEquipped;
      });
    }
  };

  const unequipItem = (itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);

    if (item && item.equippable) {
      setEquipped((prevEquipped) => {
        const updatedEquipped = prevEquipped.filter((id) => id !== itemId);

        // Update stats based on item properties
        setStats((prevStats) => {
          const newStats = { ...prevStats };

          if (item.attack) newStats.attack -= item.attack;
          if (item.defense) newStats.defense -= item.defense;

          try {
            Cookies.set('stats', JSON.stringify(newStats), { expires: 7 });
          } catch (error) {
            console.error('Failed to save stats to cookies:', error);
          }
          return newStats;
        });

        try {
          Cookies.set('equipped', JSON.stringify(updatedEquipped), { expires: 7 });
        } catch (error) {
          console.error('Failed to save equipped items to cookies:', error);
        }
        return updatedEquipped;
      });
    }
  };

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

  useEffect(() => {
    try {
      const savedEquipped = Cookies.get('equipped');
      setEquipped(savedEquipped ? JSON.parse(savedEquipped) : []);
    } catch (error) {
      console.error('Failed to parse equipped items:', error);
      setEquipped([]); // Fallback to default value
    }

    try {
      const savedStats = Cookies.get('stats');
      setStats(savedStats ? JSON.parse(savedStats) : {
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
      });
    } catch (error) {
      console.error('Failed to parse stats:', error);
      setStats({
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
      });
    }

    try {
      const savedInventory = Cookies.get('inventory');
      setInventory(savedInventory ? JSON.parse(savedInventory) : []);
    } catch (error) {
      console.error('Failed to parse inventory:', error);
      setInventory([]); // Fallback to empty inventory
    }

    try {
      const savedPng = Cookies.get('selectedPng');
      setSelectedPng(savedPng || null);

      const savedAtkPng = Cookies.get('selectedAtkPng');
      setSelectedAtkPng(savedAtkPng || null);

      const savedCursor = Cookies.get('cursorPng');
      setCursorPng(savedCursor || '/hand.png');
    } catch (error) {
      console.error('Failed to load additional settings:', error);
      setSelectedPng(null);
      setSelectedAtkPng(null);
      setCursorPng('/hand.png');
    }
  }, []);

  const handleEnterExplore = () => {
    setCurrentScene('explore');
  };

  const handleCharacterCreation = (defenseUrl, attackUrl, generatedStats) => {
    const newPlayerId = uuidv4();
    setPlayerId(newPlayerId);
    Cookies.set('playerId', newPlayerId, { expires: 7 });

    setSelectedPng(defenseUrl);
    setSelectedAtkPng(attackUrl);
    setStats(generatedStats);
    Cookies.set('selectedPng', defenseUrl, { expires: 7 });
    Cookies.set('selectedAtkPng', attackUrl, { expires: 7 });
    Cookies.set('stats', JSON.stringify(generatedStats), { expires: 7 });

    setCurrentScene('lobby');
  };

  const handleStartBattle = () => {
    setCurrentScene('battle');
  };

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
            selectedPng={selectedPng}
            inventory={inventory}
            itemsList={itemsList}
            onEnterBattle={handleStartBattle}
            onEnterExplore={handleEnterExplore}
            lastLoot={lastLoot}
            setLastLoot={setLastLoot}
            equipped={equipped}
            equipItem={equipItem}
            unequipItem={unequipItem}
            addItemToInventory={addItemToInventory}
          />
        ) : (
          <div>Loading stats...</div> // Show a loading message until stats is ready
        )
      ) : currentScene === 'explore' ? (
        <ExploreCanvas
          selectedPng={selectedPng}
          playerId={playerId}
          playerLevel={stats?.level || 1}
          onBackToLobby={() => setCurrentScene('lobby')}
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
