// src/components/itemslist.js

const itemsList = [
  {
    id: 1,
    name: 'Health Potion',
    description: 'Restores 50 HP.',
    png: '/items/hppot.png',
    equippable: false,
    // No type needed
  },
  {
    id: 2,
    name: 'Mana Potion',
    description: 'Restores 30 MP.',
    png: '/items/manapot.png',
    equippable: false,
    // No type needed
  },
  {
    id: 3,
    name: 'Maple Staff',
    description: 'Increases intellect by 6.',
    png: '/items/maplestaff.png',
    equippable: true,
    intellect: 6,
    type: 'weapon', // Define type
  },
  {
    id: 4,
    name: 'Maple Shield',
    description: 'Increases defense by 6.',
    png: '/items/mapleshield.png',
    equippable: true,
    defense: 6,
    type: 'shield', // Define type
  },
  {
    id: 5,
    name: 'Gold Coin',
    description: 'Currency for purchasing items.',
    png: '/items/goldcoin.png',
    equippable: false,
    // No type needed
  },
  {
    id: 6,
    name: 'Zard',
    description: 'Increases attack by 6.',
    png: '/items/zard.png',
    equippable: true,
    attack: 6,
    type: 'weapon', // Define type
  },
  {
    id: 7,
    name: 'Maple Axe',
    description: 'Increases attack by 5.',
    png: '/items/mapleaxe.png',
    equippable: true,
    attack: 5,
    type: 'weapon', // Define type
  },
  {
    id: 8,
    name: 'Katana',
    description: 'Increases attack by 1.',
    png: '/items/katana.png',
    equippable: true,
    attack: 1,
    type: 'weapon', // Define type
  },
  {
    id: 9,
    name: 'Round Mace',
    description: 'Increases attack by 3.',
    png: '/items/roundmace.png',
    equippable: true,
    attack: 3,
    type: 'weapon', // Define type
  },
  {
    id: 10,
    name: 'Pitch Fork',
    description: 'Increases attack by 2.',
    png: '/items/pitchfork.png',
    equippable: true,
    attack: 2,
    type: 'weapon', // Define type
  },
  {
    id: 11,
    name: 'Steel club',
    description: 'Increases attack by 4.',
    png: '/items/steelclub.png',
    equippable: true,
    attack: 4,
    type: 'weapon', // Define type
  },
  {
    id: 12,
    name: 'Zard Cleaver',
    description: 'Increases attack by 7.',
    png: '/items/zardcleaver.png',
    equippable: true,
    attack: 7,
    type: 'weapon', // Define type
  },
  {
    id: 13,
    name: 'Bath Robe',
    description: 'Increases defense by 6.',
    png: '/items/bathrobe.png',
    equippable: true,
    defense: 6,
    type: 'Overall', // Define type
  },
  {
    id: 14,
    name: 'White Gloves',
    description: 'Increases defense by 3.',
    png: '/items/gloves.png',
    equippable: true,
    defense: 3,
    type: 'Hands', // Define type
  },
  {
    id: 15,
    name: 'Earring',
    description: 'Increases agility by 5.',
    png: '/items/earring.png',
    equippable: true,
    agility: 5,
    type: 'earring', // Define type
  },
  {
    id: 16,
    name: 'Bear Trinket',
    description: 'Increases agility by 6.',
    png: '/items/earring.png',
    equippable: true,
    agility: 6,
    type: 'trinket', // Define type
  },
  {
    id: 17,
    name: 'Wood Wand',
    description: 'Increases Intellect by 1.',
    png: '/items/woodwand.png',
    equippable: true,
    intellect: 1,
    type: 'weapon', // Define type
  },
  {
    id: 18,
    name: 'Wood Staff',
    description: 'Increases Intellect by 2.',
    png: '/items/woodstaff.png',
    equippable: true,
    intellect: 2,
    type: 'weapon', // Define type
  },
  {
    id: 19,
    name: 'Attack Earring',
    description: 'Increases attack by 5.',
    png: '/items/atkearring.png',
    equippable: true,
    attack: 5,
    type: 'earring', // Define type
  },
  {
    id: 20,
    name: 'Intellect Earring',
    description: 'Increases Intellect by 5.',
    png: '/items/earring.png',
    equippable: true,
    intellect: 5,
    type: 'earring', // Define type
  },
  {
    id: 21,
    name: 'Skull Staff',
    description: 'Increases Intellect by 5.',
    png: '/items/skullstaff.png',
    equippable: true,
    intellect: 5,
    type: 'weapon', // Define type
  },
  {
    id: 22,
    name: 'Black Cape',
    description: 'Increases defense and attack by 5.',
    png: '/items/skullstaff.png',
    equippable: true,
    attack: 5,
    defense: 5,
    type: 'cape', // Define type
  },
  // Add more items as needed
];

export default itemsList;
