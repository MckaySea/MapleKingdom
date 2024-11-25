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
    description: 'Increases attack by 5.',
    png: '/items/maplestaff.png',
    equippable: true,
    attack: 7,
    type: 'weapon', // Define type
  },
  {
    id: 4,
    name: 'Maple Shield',
    description: 'Increases defense by 5.',
    png: '/items/mapleshield.png',
    equippable: true,
    defense: 5,
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
    description: 'Increases attack by 10.',
    png: '/items/zard.png',
    equippable: true,
    attack: 10,
    type: 'weapon', // Define type
  },
  {
    id: 7,
    name: 'Maple Axe',
    description: 'Increases attack by 7.',
    png: '/items/mapleaxe.png',
    equippable: true,
    attack: 7,
    type: 'weapon', // Define type
  },
  {
    id: 8,
    name: 'Katana',
    description: 'Increases attack by 6.',
    png: '/items/katana.png',
    equippable: true,
    attack: 6,
    type: 'weapon', // Define type
  },
  // Add more items as needed
];

export default itemsList;
