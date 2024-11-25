// src/components/characters.js

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
  
  export default characters;
  