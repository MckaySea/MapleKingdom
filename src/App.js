/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';
import itemsList from './components/itemslist';
import ExploreCanvas from './components/exploreCanvas';

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

  const [playerId, setPlayerId] = useState(() => {
    const savedPlayerId = Cookies.get('playerId');
    if (savedPlayerId) return savedPlayerId;

    const newPlayerId = uuidv4();
    Cookies.set('playerId', newPlayerId, { expires: 7 });
    return newPlayerId;
  });

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
    const savedEquipped = Cookies.get('equipped');
    if (savedEquipped) {
      setEquipped(JSON.parse(savedEquipped));
    } else {
      Cookies.set('equipped', JSON.stringify([]), { expires: 7 });
    }

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

    const savedInventory = Cookies.get('inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      Cookies.set('inventory', JSON.stringify([]), { expires: 7 });
    }

    const savedPng = Cookies.get('selectedPng');
    if (savedPng) {
      setSelectedPng(savedPng);
    }

    const savedAtkPng = Cookies.get('selectedAtkPng');
    if (savedAtkPng) {
      setSelectedAtkPng(savedAtkPng);
    }

    const savedCursor = Cookies.get('cursorPng');
    if (savedCursor) {
      setCursorPng(savedCursor);
    }
  }, []);

  const handleEnterExplore = () => {
    setCurrentScene('explore');
  };

  const handleCharacterCreation = (defenseUrl, attackUrl, generatedStats) => {
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
        />
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
        />
      ) : null}
    </div>
  );
}

export default App;
