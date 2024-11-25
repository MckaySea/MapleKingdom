// src/components/charCreation.js

import React from 'react';

function CharacterCreation({ onCharacterCreate }) {
  const characters = [
    {
      id: 1,
      name: 'Warrior',
      pngurl: '/sprtes3/5.png', // Defense Image
      pngatk: '/sprtes3/7.png',  // Attack Image
      stats: {
        level: 1,
        currentExp: 0,
        expToLevelUp: 100,
        attack: 13,
        defense: 9,
        maxHp: 100,
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
        attack: 9,
        defense: 8,
        maxHp: 100,
        agility: 9,
        intellect: 13,
        dexterity: 6,
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
          >
            <img src={character.pngurl} alt={`${character.name} Defense`} />
            <h2>{character.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterCreation;
