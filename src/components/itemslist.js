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
    attack: 5,
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
  // Add more items as needed
];

export default itemsList;
