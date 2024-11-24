// CharacterCreation.js
import React from 'react';

function CharacterCreation({ onCharacterCreate }) {
  const pngUrls = [
    '/sprites3/4.png',
    '/sprites3/5.png',
    '/sprites3/6.png',
    '/sprites3/7.png',
    '/sprites3/8.png',
    '/sprites3/9.png',
    '/sprites3/0.png',
    '/sprites3/1.png',
    '/sprites3/2.png',
    '/sprites3/3.png',
  ];

  const handlePngSelect = (url) => {
    const startingStats = {
      attack: 10,
      dexterity: 6,
      agility: 7,
      luck: 6,
      defense: 8,
      level: 1,
      hp: 100,
      maxHp: 100,
      currentExp: 0,
      expToLevelUp: 100, // Starting experience required to level up
    };
    onCharacterCreate(url, startingStats);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black text-white">
      <div className="text-center space-y-8 p-8 bg-black bg-opacity-50 rounded-lg border-2 border-blue-500 shadow-2xl">
        <h2 className="text-4xl font-extrabold tracking-wider uppercase mb-8 text-blue-300 shadow-text">
          Select Your Character
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {pngUrls.map((url, index) => (
            <div key={index} className="group relative">
              <img
                src={url}
                alt={`Option ${index}`}
                className="w-32 h-32 object-cover border-4 border-blue-500 rounded-lg shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-110 hover:rotate-6 hover:border-yellow-400"
                onClick={() => handlePngSelect(url)}
              />
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-25 transition-opacity duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterCreation;
