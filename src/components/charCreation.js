// src/components/charCreation.js

import React from 'react';

function CharacterCreation({ onCharacterCreate }) {
  const characters = [
    {
      id: 1,
      name: 'Warrior',
      pngurl: '/mobs/pigidle.png', // Defense Image
      pngatk: '/mobs/pigmad.png',  // Attack Image
      stats: {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 11,
        defense: 10,
        maxHp: 120,
        currentMana: 20, // Initial Mana for Warrior
        maxMana: 20,     // Maximum Mana for Warrior
        agility: 7,
        dexterity: 7,
        intellect: 4,
        luck: 6,
      },
    },
    {
      id: 2,
      name: 'Mage',
      pngurl: '/chars/skeleidle.png',
      pngatk: '/chars/skeleatk.png',
      stats: {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 5,
        defense: 8,
        maxHp: 85,
        currentMana: 100, // Initial Mana for Mage
        maxMana: 100,     // Maximum Mana for Mage
        agility: 9,
        dexterity: 8,
        intellect: 13,
        luck: 8,
      },
    },
    {
      id: 3,
      name: 'Berserker',
      pngurl: '/chars/wolfidle.png',
      pngatk: '/chars/wolfatk.png',
      stats: {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 13,
        defense: 4,
        maxHp: 105,
        currentMana: 10, // Initial Mana for Berserker
        maxMana: 10,     // Maximum Mana for Berserker
        agility: 5,
        dexterity: 7,
        intellect: 2,
        luck: 9,
      },
    },
    {
      id: 4,
      name: 'Spectral',
      pngurl: '/chars/blobidle.png',
      pngatk: '/chars/blobatk.png',
      stats: {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 10,
        defense: 8,
        maxHp: 95,
        currentMana: 70, // Initial Mana for Spectral
        maxMana: 70,     // Maximum Mana for Spectral
        agility: 9,
        intellect: 10,
        dexterity: 8,
        luck: 8,
      },
    },
    // Add more characters as needed
  ];

  const handleSelectCharacter = (character) => {
    const { pngurl, pngatk, stats } = character;
    onCharacterCreate(pngurl, pngatk, stats);
  };

  return (
    <div className="character-creation-container">
      <h1>Select Your Character</h1>
      <div className="characters-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className="character-card"
            onClick={() => handleSelectCharacter(character)}
            style={{
              cursor: 'pointer',
              border: '2px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              margin: '10px',
              textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#FF6347';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = '#ccc';
            }}
          >
            <img
              src={character.pngurl}
              alt={`${character.name} Defense`}
              style={{ width: '100px', height: '100px' }}
            />
            <h2>{character.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterCreation;
