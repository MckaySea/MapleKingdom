// App.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import CharacterCreation from './components/charCreation';
import BattleScene from './components/battleComponents/battleScene';
import Lobby from './components/lobby';

function App() {
  const [currentScene, setCurrentScene] = useState('characterCreation');
  const [selectedPng, setSelectedPng] = useState(null);
  const [stats, setStats] = useState(null);
  const [cursorPng, setCursorPng] = useState('/hand.png'); // Default cursor
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const savedPng = Cookies.get('selectedPng');
    const savedStats = Cookies.get('stats');
    const savedCursor = Cookies.get('cursorPng');

    if (savedPng && savedStats) {
      setSelectedPng(savedPng);
      setStats(JSON.parse(savedStats));
      setCurrentScene('lobby'); // If there's already a character, go straight to the lobby
    }

    if (savedCursor) {
      setCursorPng(savedCursor);
    }
  }, []);

  const handleCharacterCreation = (url, generatedStats) => {
    setSelectedPng(url);
    setStats(generatedStats);
    Cookies.set('selectedPng', url, { expires: 7 });
    Cookies.set('selectedStats', JSON.stringify(generatedStats), { expires: 7 });
    setCurrentScene('lobby');
  };

  const handleStartBattle = () => {
    setCurrentScene('battle');
  };

  const handleBackToLobby = () => {
    setLoading(true); // Start loading
    const savedStats = Cookies.get('stats');
    const savedPng = Cookies.get('selectedPng');
    const savedCursor = Cookies.get('cursorPng');

    if (savedStats) {
      setStats(JSON.parse(savedStats)); // Update stats from cookies
    }

    if (savedPng) {
      setSelectedPng(savedPng); // Update selected PNG from cookies
    }

    if (savedCursor) {
      setCursorPng(savedCursor); // Update cursor PNG from cookies
    }

    setLoading(false); // Stop loading
    setCurrentScene('lobby'); // Switch to the lobby
  };

  const updateStats = (newStats) => {
    setStats(newStats);
    Cookies.set('stats', JSON.stringify(newStats), { expires: 7 });
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 text-white"
      style={{
        cursor: cursorPng ? `url(${cursorPng}), auto` : 'default', // Automatically set the cursor
      }}
    >
      <audio src="/music/mstheme.mp3" autoPlay loop />
      {loading ? (
        <div>Loading...</div> // Display a loading indicator while data updates
      ) : currentScene === 'characterCreation' ? (
        <CharacterCreation onCharacterCreate={handleCharacterCreation} />
      ) : currentScene === 'lobby' ? (
        <Lobby
          stats={stats}
          selectedPng={selectedPng}
          onEnterBattle={handleStartBattle}
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
