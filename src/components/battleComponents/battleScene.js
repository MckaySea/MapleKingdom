/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/battleComponents/battleScene.js

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import CanvasRenderer from './canvasRenderer';
import SkillButton from './skillButton';
import HPBar from './hpBar';
import ManaBar from './manaBar'; // Import ManaBar
import Portrait from './portrait';
import useAudio from './useAudio';
import Cookies from 'js-cookie';
import itemsList from '../itemslist';

function BattleScene({
  selectedPng,
  stats,
  onBackToLobby,
  addItemToInventory,
  setLastLoot,
  inventory,
  removeItemFromInventory,
  hasItemInInventory, // Receive the function
}) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Destructure player stats
  const {
    level: playerLevel,
    currentExp,
    expToLevelUp,
    attack: playerAttack,
    defense: playerDefense,
    maxHp: playerMaxHp,
    currentMana, // Current Mana
    maxMana,     // Maximum Mana
    agility: playerAgility,
    dexterity: playerDex,
    intellect: playerInt,
    luck: playerLuck,
  } = stats;

  // Player HP and Mana states
  const [playerHP, setPlayerHP] = useState(stats.currentHP || playerMaxHp);
  const [playerMana, setPlayerMana] = useState(stats.currentMana || maxMana);

  // Update HP and Mana when stats change (e.g., leveling up)
  useEffect(() => {
    setPlayerHP(stats.currentHP || playerMaxHp);
    setPlayerMana(stats.currentMana || maxMana);
  }, [stats.currentHP, playerMaxHp, stats.currentMana, maxMana]);

  // Define minimum and maximum sizes for the player's image
  const playerMinSize = 70; // Smaller size at level 1
  const playerMaxSize = 200; // Maximum size at higher levels
  const playerMaxLevel = 50; // Level at which the size caps

  // Calculate player image size based on level
  const playerImageSize = useMemo(() => {
    const sizeIncrement = (playerMaxSize - playerMinSize) / (playerMaxLevel - 1);
    const size = playerMinSize + sizeIncrement * (playerLevel - 1);
    return Math.min(size, playerMaxSize); // Ensure size doesn't exceed maxSize
  }, [playerLevel]);

  // Game state variables
  const [currentTurn, setCurrentTurn] = useState('Player');
  const [enemyHP, setEnemyHP] = useState(100); // Will be updated based on enemy stats
  const [playerState, setPlayerState] = useState('normal');
  const [enemyState, setEnemyState] = useState('normal');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [showMagicMenu, setShowMagicMenu] = useState(false); // New state for magic menu
  const anglePlayerRef = useRef(0);
  const angleEnemyRef = useRef(0);
  const hoveredButtonRef = useRef(null);
  const isClicked = useRef(0); // Ref to track if a button has been clicked
  const enemyDefeatHandled = useRef(false); // Ref to track if enemy defeat has been handled

  // Define an array of enemy types with their stats and loot tables
  const enemies = useMemo(
    () => [
      {
        name: 'Mushroom',
        image: '/sprites2/mush.png',
        attackImage: '/sprites2/mushatk.png',
        attack: 22,
        defense: 10,
        maxHp: 90,
        agility: 11,
        level: 3,
        lootTable: [
          { item: 'Health Potion', dropRate: 0.2 }, // 40% chance
          { item: 'Katana', dropRate: 0.1 },
          { item: 'Pitch Fork', dropRate: 0.2 },   // 10% chance   // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.2 },
          { item: 'Wood Staff', dropRate: 0.1 },
        ],
      },
      {
        name: 'Baby Dragon',
        image: '/sprites3/8.png',
        attackImage: '/sprites2/2.png',
        attack: 18,
        defense: 5,
        maxHp: 60,
        agility: 10,
        level: 1,
        lootTable: [
          { item: 'Health Potion', dropRate: 0.2 }, // 40% chance
          { item: 'Katana', dropRate: 0.2 },    // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 },  
          { item: 'White Gloves', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.1 },
          { item: 'Wood Wand', dropRate: 0.2 },
        ],
      },
      {
        name: 'Baby Bunny',
        image: '/mobs/bunnyidle.png',
        attackImage: '/mobs/bunnyatk.png',
        attack: 20,
        defense: 7,
        maxHp: 70,
        agility: 10,
        level: 2,
        lootTable: [
          { item: 'Health Potion', dropRate: 0.2 }, // 40% chance
          { item: 'Katana', dropRate: 0.3 },    // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 }, 
          { item: 'Pitch Fork', dropRate: 0.1 }, 
          { item: 'White Gloves', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.1 },
          { item: 'Wood Wand', dropRate: 0.1 },
          { item: 'Wood Staff', dropRate: 0.1 },
        ],
      },
      {
        name: 'Alien',
        image: '/mobs/alienidle.png',
        attackImage: '/mobs/alienatk.png',
        attack: 23,
        defense: 12,
        maxHp: 105,
        agility: 15,
        level: 5,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.4 },
          { item: 'Health Potion', dropRate: 0.2 }, 
          { item: 'Round Mace', dropRate: 0.2 },  
          { item: 'Steel Club', dropRate: 0.1 },
          { item: 'White Gloves', dropRate: 0.1 }, 
          { item: 'Skull Staff', dropRate: 0.1 }, 
            // 60% chance // 30% chance
                  // 10% chance
        ],
      },
      {
        name: 'Golem',
        image: '/pigs/1.png',
        attackImage: '/pigs/0.png',
        attack: 32,
        defense: 23,
        maxHp: 130,
        agility: 15,
        level: 7,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.5 },
          { item: 'Health Potion', dropRate: 0.2 }, 
          { item: 'Steel Club', dropRate: 0.2 },  // 60% chance
          { item: 'Maple Axe', dropRate: 0.1 },
          { item: 'Skull Staff', dropRate: 0.1 }, 
          { item: 'Intellect Earring', dropRate: 0.1 }, 
          { item: 'Bear Trinket', dropRate: 0.1 },    // 30% chance
          // 10% chancefde
        ],
      },
      {
        name: 'Yeti',
        image: '/sprites4/2.png',
        attackImage: '/sprites4/0.png',
        attack: 36,
        defense: 28,
        maxHp: 150,
        agility: 18,
        level: 10,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.5 },
          { item: 'Health Potion', dropRate: 0.3 }, 
          { item: 'Bear Trinket', dropRate: 0.1 },    
          { item: 'Attack Earring', dropRate: 0.1 }, 
          { item: 'Intellect Earring', dropRate: 0.1 }, // 60% chance
          { item: 'Zard', dropRate: 0.1 },   // 30% chance
            // 10% chance
        ],
      },
      {
        name: 'Yak',
        image: '/mobs/yakidle.png',
        attackImage: '/mobs/yakatk.png',
        attack: 41,
        defense: 32,
        maxHp: 170,
        agility: 18,
        level: 11,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.5 }, // 60% chance
          { item: 'Zard Cleaver', dropRate: 0.1 },
          { item: 'Black Cape', dropRate: 0.1 },
          { item: 'Health Potion', dropRate: 0.4 }, 
          { item: 'Maple Staff', dropRate: 0.1 }, 
          { item: 'Bath Robe', dropRate: 0.1 },     // 30% chance
            // 10% chance
        ],
      },
      {
        name: 'Stumpy',
        image: '/mobs/stumpidle.png',
        attackImage: '/mobs/stumpatk.png',
        attack: 49,
        defense: 33,
        maxHp: 200,
        agility: 20,
        level: 13,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.8 }, // 60% chance
          { item: 'Zard Cleaver', dropRate: 0.2 },
          { item: 'Health Potion', dropRate: 0.4 }, 
          { item: 'Black Cape', dropRate: 0.1 },
          { item: 'Maple Staff', dropRate: 0.1 }, 
          { item: 'Bath Robe', dropRate: 0.2 },     // 30% chance
            // 10% chance
        ],
      },
      // Add more enemies as needed
    ],
    []
  );
  // Randomly select an enemy at the beginning and store in state
  const [selectedEnemy] = useState(() => {
    const randomEnemyIndex = Math.floor(Math.random() * enemies.length);
    return enemies[randomEnemyIndex];
  });

  // Enemy images
  const enemyImage = useRef(new Image());
  const enemyAttackImage = useRef(new Image());

  // Load enemy images when selectedEnemy changes
  useEffect(() => {
    enemyImage.current.src = selectedEnemy.image;
    enemyAttackImage.current.src = selectedEnemy.attackImage;
  }, [selectedEnemy]);

  // Handle enemy image load errors
  useEffect(() => {
    enemyImage.current.onerror = () => {
      enemyImage.current.src = '/defaultEnemy.png'; // Fallback image
    };
    enemyAttackImage.current.onerror = () => {
      enemyAttackImage.current.src = '/defaultEnemyAttack.png'; // Fallback image
    };
  }, [selectedEnemy]);

  // Enemy stats as state
  const [enemyStats] = useState({
    attack: selectedEnemy.attack,
    defense: selectedEnemy.defense,
    maxHp: selectedEnemy.maxHp,
    agility: selectedEnemy.agility,
    level: selectedEnemy.level,
  });

  // Initialize enemy HP based on enemy stats
  useEffect(() => {
    setEnemyHP(enemyStats.maxHp);
  }, [enemyStats.maxHp]);

  // Define minimum and maximum sizes for the enemy's image
  const enemyMinSize = 75; // Smaller size at low levels
  const enemyMaxSize = 500; // Maximum size at higher levels
  const enemyMaxLevel = 50; // Level at which the size caps

  // Calculate enemy image size based on level
  const enemyImageSize = useMemo(() => {
    const sizeIncrement =
      (enemyMaxSize - enemyMinSize) / (enemyMaxLevel - 1);
    const size = enemyMinSize + sizeIncrement * (enemyStats.level - 1);
    return Math.min(size, enemyMaxSize); // Ensure size doesn't exceed maxSize
  }, [enemyStats.level]);

  // Defense boost state
  const [defenseBoost, setDefenseBoost] = useState(false);

  // Modify playerDefense if defenseBoost is active
  const effectivePlayerDefense = useMemo(() => {
    return defenseBoost ? playerDefense + 10 : playerDefense;
  }, [defenseBoost, playerDefense]);

  // Audio hooks
  const playHoverSound = useAudio('/sounds/hover.mp3');
  const playClickSound = useAudio('/sounds/clicker.mp3');
  const playAttackSound = useAudio('/sounds/attack.mp3');
  const playHealSound = useAudio('/sounds/heal.mp3');
  const playDamageSound = useAudio('/sounds/damage.mp3');
  const playCriticalSound = useAudio('/sounds/crit.mp3');
  const playVictorySound = useAudio('/sounds/quest.mp3');
  const playDefeatSound = useAudio('/sounds/defeat.mp3'); // Added defeat sound
  const playMissSound = useAudio('/sounds/miss.mp3');
  // New audio hooks for magic skills
  const playFireballSound = useAudio('/sounds/magic.mp3');
  const playLightningSound = useAudio('/sounds/magic.mp3');
  const playIceShieldSound = useAudio('/sounds/iceshield.mp3');

  // Load background image
  const background = useRef(new Image());
  background.current.src = '/maplebattle.jpg';

  // Load player images
  const playerImage = useRef(new Image());
  playerImage.current.src = selectedPng;
  const selectedAtkPng = Cookies.get('selectedAtkPng');
  const playerAttackImage = useRef(new Image());
  playerAttackImage.current.src = selectedAtkPng; // Use selectedAtkPng instead of hardcoded path

  // Handle image load errors
  useEffect(() => {
    playerImage.current.onerror = () => {
      playerImage.current.src = '/defaultCharacter.png'; // Fallback image
    };
    playerAttackImage.current.onerror = () => {
      playerAttackImage.current.src = '/defaultAttack.png'; // Fallback image
    };
    background.current.onerror = () => {
      background.current.src = '/defaultBackground.png'; // Fallback background
    };
  }, []);

  // Define base speed and size
  const BASE_PROJECTILE_SPEED = 4; // Base speed for projectiles
  const BASE_PROJECTILE_SIZE = 20; // Base size for projectiles

  // Function to calculate projectile speed based on playerInt
  const calculateProjectileSpeed = (playerInt) => {
    // Higher intellect results in slower projectiles
    // Adjust the divisor to control sensitivity
    return Math.max(BASE_PROJECTILE_SPEED - playerInt * 0.05, 3); // Minimum speed of 3
  };

  // Function to calculate projectile size based on playerInt
  const calculateProjectileSize = (playerInt) => {
    // Higher intellect results in larger projectiles
    // Adjust the multiplier to control sensitivity
    return BASE_PROJECTILE_SIZE + playerInt * 0.5; // Size increases by 0.5 per int
  };

  // Load projectile images
  const fireballImage = useRef(new Image());
  const lightningImage = useRef(new Image());
  const iceShieldImage = useRef(new Image()); // Optional for Ice Shield

  useEffect(() => {
    // Load Fireball Image
    fireballImage.current.src = '/projectiles/fireball.png';
    fireballImage.current.onerror = () => {
      fireballImage.current.src = '/projectiles/fireball.png'; // Fallback image
    };

    // Load Lightning Image
    lightningImage.current.src = '/projectiles/lightning.png';
    lightningImage.current.onerror = () => {
      lightningImage.current.src = '/projectiles/lightning.png'; // Fallback image
    };

    // Load Ice Shield Image (if used)
    iceShieldImage.current.src = '/projectiles/iceshield.png';
    iceShieldImage.current.onerror = () => {
      iceShieldImage.current.src = '/projectiles/defaultProjectile.png'; // Fallback image
    };
  }, []);

  // Load impact sprite image
  const impactSpriteImage = useRef(new Image());

  useEffect(() => {
    impactSpriteImage.current.src = '/projectiles/magicland.png'; // Replace with your impact sprite path
    impactSpriteImage.current.onerror = () => {
      impactSpriteImage.current.src = '/projectiles/magicland.png'; // Fallback image
    };
  }, []);

  // Refs for projectiles and positions
  const projectilesRef = useRef([]);
  const impactSpritesRef = useRef([]);
  const playerPositionRef = useRef({ x: 0, y: 0 });
  const enemyPositionRef = useRef({ x: 0, y: 0 });

  // Define magic skills with projectile launch
  const magicSkills = useMemo(
    () => [
      {
        name: 'Fireball',
        icon: '/projectiles/fireball.png',
        description: 'Deals fire damage to the enemy. Costs 10 mana.',
        manaCost: 15, // Mana cost for Fireball
        projectileImageSrc: '/projectiles/fireball.png', // Unique image for Fireball
        effect: () => {
          const cost = 10;
          if (playerMana < cost) {
            alert('Not enough mana to cast Fireball!');
            return;
          }

          // Deduct mana
          setPlayerMana((prevMana) => {
            const newMana = prevMana - cost;
            // Update the stats and cookies
            const updatedStats = { ...stats, currentMana: newMana };
            Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
            return newMana;
          });

          const damage = Math.round(Math.max(0, playerInt * 1.4 - enemyStats.defense));
          playFireballSound();

          // Calculate dynamic speed and size
          const speed = calculateProjectileSpeed(playerInt);
          const size = calculateProjectileSize(playerInt);

          // Launch Fireball Projectile
          const projectile = {
            x: playerPositionRef.current.x,
            y: playerPositionRef.current.y,
            targetX: enemyPositionRef.current.x,
            targetY: enemyPositionRef.current.y,
            speed: speed, // Dynamic speed
            size: size, // Dynamic size
            image: fireballImage.current, // Use Fireball image
            damage: damage, // Store damage to apply upon hit
          };
          projectilesRef.current.push(projectile);
        },
      },
      {
        name: 'Lightning Strike',
        icon: '/projectiles/lightning.png',
        description: 'Deals lightning damage with a chance to stun. Costs 15 mana.',
        manaCost: 15, // Mana cost for Lightning Strike
        projectileImageSrc: '/projectiles/lightning.png', // Unique image for Lightning Strike
        effect: () => {
          const cost = 15;
          if (playerMana < cost) {
            alert('Not enough mana to cast Lightning Strike!');
            return;
          }

          // Deduct mana
          setPlayerMana((prevMana) => {
            const newMana = prevMana - cost;
            // Update the stats and cookies
            const updatedStats = { ...stats, currentMana: newMana };
            Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
            return newMana;
          });

          const damage = Math.round(Math.max(0, (playerInt * 1.3) + (playerDex / 2) - enemyStats.defense));
          const stunChance = 0.2; // 20% chance to stun
          playLightningSound();

          // Calculate dynamic speed and size
          const speed = calculateProjectileSpeed(playerInt);
          const size = calculateProjectileSize(playerInt);

          // Launch Lightning Projectile
          const projectile = {
            x: playerPositionRef.current.x,
            y: playerPositionRef.current.y,
            targetX: enemyPositionRef.current.x,
            targetY: enemyPositionRef.current.y,
            speed: speed, // Dynamic speed
            size: size, // Dynamic size
            image: lightningImage.current, // Use Lightning image
            damage: damage, // Store damage to apply upon hit
            stunChance: stunChance, // Store stun chance
          };
          projectilesRef.current.push(projectile);
        },
      },
      {
        name: 'Ice Shield',
        icon: '/3.png',
        description: 'Increases your defense for the next turn. Costs 20 mana.',
        manaCost: 20, // Mana cost for Ice Shield
        projectileImageSrc: '/projectiles/iceshield.png', // Optional
        effect: () => {
          const cost = 20;
          if (playerMana < cost) {
            alert('Not enough mana to cast Ice Shield!');
            return;
          }

          // Deduct mana
          setPlayerMana((prevMana) => {
            const newMana = prevMana - cost;
            // Update the stats and cookies
            const updatedStats = { ...stats, currentMana: newMana };
            Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
            return newMana;
          });

          setPlayerState('defending');
          setDefenseBoost(true);
          playIceShieldSound();

          // Create Ice Shield Visual Effect
          const projectile = {
            x: playerPositionRef.current.x,
            y: playerPositionRef.current.y,
            targetX: playerPositionRef.current.x,
            targetY: playerPositionRef.current.y,
            speed: 0, // Static effect
            size: 80, // Fixed size for shield
            image: iceShieldImage.current, // Specific to Ice Shield
            isShield: true, // Identify as shield
          };
          projectilesRef.current.push(projectile);

          setTimeout(() => {
            setPlayerState('normal');
            setDefenseBoost(false);
            setCurrentTurn('Enemy');
            isClicked.current = 0; // Reset for the next player turn
          }, 1000);
        },
      },
      // Add more magic skills as needed
    ],
    [
      playerInt,
      enemyStats.defense,
      playFireballSound,
      playLightningSound,
      playIceShieldSound,
      playerMana,
      stats, // Add stats as a dependency
    ]
  );

  // Skills array
  const skills = [
    { name: 'Attack', icon: '/swordmaple.png' },
    { name: 'Defend', icon: '/items/mapleshield.png' },
    { name: 'Heal', icon: '/items/hppot.png' },
    { name: 'Magic', icon: '/items/maplestaff.png' }, // Magic skill
  ];

  // Drawing function for CanvasRenderer
  const draw = useCallback(
    (ctx) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw background
      ctx.drawImage(background.current, 0, 0, canvasWidth, canvasHeight);

      // Use calculated sizes instead of fixed values
      const playerWidth = playerImageSize;
      const playerHeight = playerImageSize;
      const enemyWidth = enemyImageSize;
      const enemyHeight = enemyImageSize;

      const radius = 50; // Radius of circular motion

      // Calculate center of the canvas
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      // Define horizontal offset from the center for player and enemy
      const horizontalOffset = 350; // Adjust this value as needed

      // Calculate player position
      let playerX, playerY;
      if (currentTurn === 'Player') {
        playerX =
          centerX - horizontalOffset + radius * Math.cos(anglePlayerRef.current);
        playerY =
          centerY + radius * Math.sin(anglePlayerRef.current);
      } else {
        playerX =
          centerX - horizontalOffset + radius * Math.cos(anglePlayerRef.current);
        playerY = centerY;
      }

      // Adjust position to center the image
      playerX -= playerWidth / 2;
      playerY -= playerHeight / 2;

      // Calculate enemy position
      let enemyX, enemyY;
      if (currentTurn === 'Enemy') {
        enemyX =
          centerX + horizontalOffset + radius * Math.cos(angleEnemyRef.current);
        enemyY =
          centerY + radius * Math.sin(angleEnemyRef.current);
      } else {
        enemyX =
          centerX + horizontalOffset + Math.cos(angleEnemyRef.current * 4);
        enemyY = centerY + Math.sin(angleEnemyRef.current * 2);
      }

      // Adjust position to center the image
      enemyX -= enemyWidth / 2;
      enemyY -= enemyHeight / 2;

      // Draw player
      if (playerState === 'attacking' || playerState === 'casting') {
        ctx.drawImage(
          playerAttackImage.current,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
      } else {
        ctx.drawImage(
          playerImage.current,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
      }

      // Draw enemy
      if (enemyState === 'attacking') {
        ctx.drawImage(
          enemyAttackImage.current,
          enemyX,
          enemyY,
          enemyWidth,
          enemyHeight
        );
      } else {
        ctx.drawImage(
          enemyImage.current,
          enemyX,
          enemyY,
          enemyWidth,
          enemyHeight
        );
      }

      // Update player and enemy position refs
      playerPositionRef.current = {
        x: playerX + playerWidth / 2,
        y: playerY + playerHeight / 2,
      };
      enemyPositionRef.current = {
        x: enemyX + enemyWidth / 2,
        y: enemyY + enemyHeight / 2,
      };

      // Update and draw projectiles
      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];

        if (proj.isShield) {
          // Draw shield (larger size, static)
          ctx.drawImage(
            proj.image,
            proj.x - proj.size / 2, // Center the shield
            proj.y - proj.size / 2,
            proj.size, // Width of shield
            proj.size // Height of shield
          );

          // Shields are handled separately; no movement or impact
          continue; // Skip movement for shields
        }

        // Calculate distance to target
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
          // Apply damage if not a shield
          if (!proj.isShield) {
            setEnemyHP((prevHP) => Math.max(prevHP - proj.damage, 0));

            // Handle additional effects
            if (proj.stunChance && Math.random() < proj.stunChance) {
              setEnemyState('stunned');
              setTimeout(() => {
                setEnemyState('normal');
                setCurrentTurn('Player');
                isClicked.current = 0; // Reset click
              }, 1000);
            }

            // Add impact sprite at enemy's position
            impactSpritesRef.current.push({
              x: enemyPositionRef.current.x,
              y: enemyPositionRef.current.y,
              image: impactSpriteImage.current,
              size: 60, // Adjust size as needed
              duration: 500, // Duration in ms
              startTime: Date.now(),
            });
          }

          // Remove the projectile
          projectilesRef.current.splice(i, 1);
          continue;
        }

        const angle = Math.atan2(dy, dx);

        // Move the projectile towards the target
        const moveX = proj.speed * Math.cos(angle);
        const moveY = proj.speed * Math.sin(angle);

        proj.x += moveX;
        proj.y += moveY;

        // Draw the projectile with dynamic size
        ctx.drawImage(
          proj.image,
          proj.x - proj.size / 2, // Center the projectile
          proj.y - proj.size / 2,
          proj.size,
          proj.size
        );

        // Check if the projectile has reached or passed the target
        const newDx = proj.targetX - proj.x;
        const newDy = proj.targetY - proj.y;
        const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);

        if (newDistance < proj.speed) {
          // Apply damage if not a shield
          if (!proj.isShield) {
            setEnemyHP((prevHP) => Math.max(prevHP - proj.damage, 0));

            // Handle additional effects
            if (proj.stunChance && Math.random() < proj.stunChance) {
              setEnemyState('stunned');
              setTimeout(() => {
                setEnemyState('normal');
                setCurrentTurn('Player');
                isClicked.current = 0; // Reset click
              }, 1000);
            }

            // Add impact sprite at enemy's position
            impactSpritesRef.current.push({
              x: enemyPositionRef.current.x,
              y: enemyPositionRef.current.y,
              image: impactSpriteImage.current,
              size: 60, // Adjust size as needed
              duration: 500, // Duration in ms
              startTime: Date.now(),
            });
          }

          // Remove the projectile
          projectilesRef.current.splice(i, 1);
        }
      }

      // Render and update impact sprites
      for (let i = impactSpritesRef.current.length - 1; i >= 0; i--) {
        const impact = impactSpritesRef.current[i];
        const elapsed = Date.now() - impact.startTime;

        if (elapsed > impact.duration) {
          // Remove the impact sprite after its duration
          impactSpritesRef.current.splice(i, 1);
          continue;
        }

        // Calculate opacity based on elapsed time
        const opacity = 1 - elapsed / impact.duration;
        ctx.globalAlpha = opacity;

        // Draw the impact sprite with dynamic size
        ctx.drawImage(
          impact.image,
          impact.x - impact.size / 2, // Center the sprite
          impact.y - impact.size / 2,
          impact.size,
          impact.size
        );

        // Reset opacity
        ctx.globalAlpha = 1;
      }

      // Draw turn indicator
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentTurn}'s Turn`, centerX, 50);

      // Draw experience and level
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Level: ${playerLevel}`, 20, canvasHeight - 180);
      ctx.fillText(
        `EXP: ${currentExp} / ${expToLevelUp}`,
        20,
        canvasHeight - 150
      );

      // Draw HP Bar
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      // HPBar component is rendered separately

      // Draw Mana Bar
      ctx.fillStyle = 'blue';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      // ManaBar component is rendered separately

      // Draw buttons on canvas
      drawCanvasButton(ctx, {
        x: 10,
        y: 10,
        width: 150,
        height: 40,
        text: 'Back to Lobby',
        isHovered: hoveredButtonRef.current === 'backButton',
      });

      drawCanvasButton(ctx, {
        x: 10,
        y: 60,
        width: 150,
        height: 40,
        text: 'Next Turn',
        isHovered: hoveredButtonRef.current === 'turnButton',
      });

    // Draw Magic Menu if active
if (showMagicMenu) {
  // Draw semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Define magic menu dimensions
  const menuWidth = 400;
  const menuHeight = 300;
  const menuX = (canvasWidth - menuWidth) / 2;
  const menuY = (canvasHeight - menuHeight) / 2;

  // Draw magic menu background
  ctx.fillStyle = '#333';
  ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

  // Draw magic menu title
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Select a Magic Skill', menuX + menuWidth / 2, menuY + 40);

  // Define magic skill button layout
  const skillButtonWidth = 150;
  const skillButtonHeight = 60;
  const spacingX = 20;
  const spacingY = 20;
  const startX = menuX + spacingX;
  const startY = menuY + 80;

  magicSkills.forEach((skill, index) => {
    const cols = 2; // Number of columns
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = startX + col * (skillButtonWidth + spacingX);
    const y = startY + row * (skillButtonHeight + spacingY);

    // Check if this skill is hovered
    const isHovered = hoveredMagicSkillRef.current === index;

    // Draw skill button background
    ctx.fillStyle = isHovered ? '#555' : '#777';
    ctx.fillRect(x, y, skillButtonWidth, skillButtonHeight);

    // Draw skill icon
    const skillIcon = new Image();
    skillIcon.src = skill.icon;
    skillIcon.onload = () => {
      ctx.drawImage(skillIcon, x + 10, y + 10, 40, 40);
    };

    // Draw skill name (centered)
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center'; // Center text horizontally
    ctx.textBaseline = 'middle'; // Center text vertically

    // Calculate the center of the button
    const textX = x + skillButtonWidth / 2;
    const textY = y + skillButtonHeight / 2;

    // Draw the skill name at the center of the button
    ctx.fillText(skill.name, textX, textY);
  });

      }

      // Increment angles for circular motion
      const maxAngle = 2 * Math.PI;

      if (currentTurn === 'Player') {
        anglePlayerRef.current = (anglePlayerRef.current + 0.002) % maxAngle;
        angleEnemyRef.current = (angleEnemyRef.current + 0.005) % maxAngle;
      } else {
        anglePlayerRef.current = (anglePlayerRef.current + 0.005) % maxAngle;
        angleEnemyRef.current = (angleEnemyRef.current + 0.002) % maxAngle;
      }
    },
    [
      canvasHeight,
      canvasWidth,
      currentTurn,
      enemyImageSize,
      playerImageSize,
      playerState,
      enemyState,
      playerLevel,
      currentExp,
      expToLevelUp,
      showMagicMenu,
      magicSkills,
      projectilesRef,
      impactSpritesRef,
      enemyPositionRef,
      playerMana,
      stats.maxMana,
    ]
  );

  // Function to draw buttons on canvas
  const drawCanvasButton = (ctx, button) => {
    ctx.fillStyle = button.isHovered ? '#FF8261' : '#FF6347';
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  };

  // Ref to track hovered magic skill
  const hoveredMagicSkillRef = useRef(null);

  // Reset Stats to Maximum Values Function
  const resetStatsToMax = useCallback(() => {
    // Create a copy of the current stats
    const updatedStats = { ...stats };

    // Reset dynamic stats to their maximum values
    updatedStats.currentHP = updatedStats.maxHp;
    updatedStats.currentMana = updatedStats.maxMana;

    // Update local state
    setPlayerHP(updatedStats.maxHp);
    setPlayerMana(updatedStats.maxMana);

    // Save updated stats to cookies
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });

    console.log('Player stats have been reset to maximum values.');
  }, [stats]);

  const handleLootDrops = useCallback(
    (lootTable) => {
      const obtainedLoot = [];

      lootTable.forEach((loot) => {
        const rand = Math.random();
        console.log(
          `Checking loot: ${loot.item}, Drop rate: ${loot.dropRate}, Random: ${rand}`
        );
        if (rand <= loot.dropRate) {
          // Find the item details from itemsList
          const item = itemsList.find((i) => i.name === loot.item);
          if (item) {
            console.log(`Adding item to inventory: ${item.name}`);
            obtainedLoot.push(item);
            addItemToInventory(item.id); // Add to inventory
          } else {
            console.warn(`Item not found in itemsList: ${loot.item}`);
          }
        }
      });

      if (obtainedLoot.length > 0) {
        console.log(`Loot obtained:`, obtainedLoot);
        setLastLoot(obtainedLoot);
      } else {
        console.log('No loot obtained.');
      }
    },
    [addItemToInventory, setLastLoot, itemsList]
  );

  // Handle skill actions
  const handleSkillAction = useCallback(
    (skillName) => {
      if (isClicked.current >= 1) return; // Prevent further clicks
      isClicked.current += 1; // Mark as clicked

      playClickSound();

      if (skillName === 'Attack') {
        setPlayerState('attacking');
        playAttackSound();

        setEnemyHP((prevHP) => {
          // Calculate the bonus attack from dexterity
          const dexAttackBonus = Math.floor(playerDex / 5);
          const adjustedAttack = playerAttack + dexAttackBonus;

          // Calculate the damage
          const damage = Math.max(0, adjustedAttack - enemyStats.defense);

          // Determine if we get a critical hit
          const criticalChance = Math.floor(playerDex / 5) / 100; // 1% crit chance per 5 dexterity points
          const isCriticalHit = Math.random() < criticalChance;

          // If it's a critical hit, multiply the damage by 1.5 and play critical sound
          const finalDamage = isCriticalHit ? damage * 1.5 : damage;

          // Play the appropriate sound
          if (isCriticalHit) {
            playCriticalSound(); // Play critical hit sound
          } else if (finalDamage > 0) {
            playDamageSound(); // Play regular damage sound
          }

          const newHP = Math.max(prevHP - finalDamage, 0);
          return newHP;
        });

        setTimeout(() => {
          setPlayerState('normal');
          if (enemyHP > 0) {
            setCurrentTurn('Enemy');
          }
        }, 500);
      } else if (skillName === 'Heal') {
        const wasRemoved = removeItemFromInventory(1);

        if (wasRemoved) {
          // Perform the heal
          setPlayerHP((prevHP) =>
            Math.min(prevHP + 15 + playerLuck * 0.8 + playerInt * 0.8, playerMaxHp)
          );

          playHealSound(); // Play heal sound effect

          setTimeout(() => setCurrentTurn('Enemy'), 500);
        } else {
          // Alert the player that they don't have any Health Potions
          alert("You don't have any Health Potions left!");
          isClicked.current -= 1; // Allow the player to click again
        }
      } else if (skillName === 'Defend') {
        // Implement defend functionality
        setPlayerState('defending');
        setDefenseBoost(true);
        setTimeout(() => {
          setPlayerState('normal');
          setDefenseBoost(false);
          setCurrentTurn('Enemy');
          isClicked.current = 0; // Reset for the next player turn
        }, 500);
      } else if (skillName === 'Magic') {
        // Open magic selection menu
        setShowMagicMenu(true);
      }
      // Add more skill effects as needed
    },
    [
      playerAttack,
      enemyStats.defense,
      enemyHP,
      playAttackSound,
      playDamageSound,
      playClickSound,
      playerMaxHp,
      playerDex,
      playerInt,
      playerLuck,
      playCriticalSound,
      removeItemFromInventory,
    ]
  );

  // Enemy action effect
  useEffect(() => {
    if (currentTurn === 'Enemy' && enemyHP > 0) {
      const enemyActionTimeout = setTimeout(() => {
        setEnemyState('attacking');
        playAttackSound();

        setPlayerHP((prevHP) => {
          // Compute miss chance
          const missChance = Math.min(
            0.1 + (Math.max(playerAgility - 20, 0) / 40) * 0.15,
            0.25
          );

          // Generate a random number between 0 and 1 for miss determination
          const randMiss = Math.random();

          if (randMiss < missChance) {
            // Enemy missed
            console.log('Enemy missed!');
            playMissSound();
            return prevHP; // No damage taken
          } else {
            // Enemy hits
            // Define critical hit chance (e.g., 10%)
            const critChance = 0.1;
            const randCrit = Math.random();
            const isCritical = randCrit < critChance;

            // Calculate base damage
            const baseDamage = Math.max(0, enemyStats.attack - effectivePlayerDefense);

            // Apply critical multiplier if critical hit
            const damage = isCritical ? Math.floor(baseDamage * 1.3) : baseDamage;

            // Optionally, play a different sound for critical hits
            if (isCritical) {
              console.log('Critical hit!');
              playCriticalSound(); // Ensure you have this function defined
            } else if (damage > 0) {
              playDamageSound();
            }

            // Calculate new HP, ensuring it doesn't go below 0
            const newHP = Math.max(prevHP - damage, 0);
            return newHP;
          }
        });

        // After attack animation and damage calculation
        setTimeout(() => {
          setEnemyState('normal');
          setCurrentTurn('Player');
          isClicked.current = 0; // Reset for the next player turn
        }, 500);
      }, 1000);

      // Cleanup timeout on unmount or if dependencies change
      return () => clearTimeout(enemyActionTimeout);
    }
  }, [
    currentTurn,
    enemyHP,
    playAttackSound,
    playDamageSound,
    playMissSound,
    playCriticalSound,
    playerAgility,
    effectivePlayerDefense,
    enemyStats,
  ]);

  // Handle enemy defeat
  const handleEnemyDefeat = useCallback(() => {
    const expGain = 50; // Experience points for defeating the enemy
    const newExp = currentExp + expGain;

    let updatedStats = { ...stats }; // Make a copy of stats

    // Check for level up
    if (newExp >= expToLevelUp) {
      const excessExp = newExp - expToLevelUp;
      const newLevel = playerLevel + 1;
      const newExpToLevelUp = expToLevelUp + 100;

      // Update stats on level up
      updatedStats = {
        ...updatedStats,
        level: newLevel,
        currentExp: excessExp,
        expToLevelUp: newExpToLevelUp,
        skillPoints: (stats.skillPoints || 0) + 3, // Add skill points
        // Optionally, increase maxMana on level up
        maxMana: Math.floor(updatedStats.maxMana * 1.1), // Increase maxMana by 10%
        currentMana: Math.min(updatedStats.currentMana + 10, Math.floor(updatedStats.maxMana * 1.1)), // Regenerate some mana
      };

      // Keep player HP unchanged during level-up or adjust as needed
      setPlayerHP(updatedStats.maxHp);
      setPlayerMana(updatedStats.currentMana);
    } else {
      updatedStats.currentExp = newExp;
    }

    // Reset dynamic stats to maximum values after battle
    updatedStats.currentHP = updatedStats.maxHp;
    updatedStats.currentMana = updatedStats.maxMana;

    // Save updated stats to cookies
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });

    // Update local state
    setPlayerHP(updatedStats.maxHp);
    setPlayerMana(updatedStats.maxMana);

    setShowVictoryModal(true);
    playVictorySound();

    // Handle loot drops
    handleLootDrops(selectedEnemy.lootTable);

    // Return to lobby after delay
    setTimeout(() => {
      onBackToLobby();
    }, 5000);
  }, [
    currentExp,
    expToLevelUp,
    playerLevel,
    stats,
    playVictorySound,
    onBackToLobby,
    selectedEnemy,
    handleLootDrops,
  ]);

  // Watch for enemyHP changes to handle enemy defeat
  useEffect(() => {
    if (enemyHP <= 0 && !enemyDefeatHandled.current) {
      enemyDefeatHandled.current = true;
      handleEnemyDefeat();
    }
  }, [enemyHP, handleEnemyDefeat]);

  // Handle player defeat
  const handlePlayerDefeat = useCallback(() => {
    // Reset stats to maximum values
    resetStatsToMax();

    setShowDefeatModal(true);
    playDefeatSound(); // Play defeat sound effect

    // Return to lobby after delay
    setTimeout(() => {
      onBackToLobby();
    }, 5000);
  }, [resetStatsToMax, playDefeatSound, onBackToLobby]);

  // Mouse event handlers for the canvas
  const handleMouseMove = useCallback(
    (e) => {
      const canvas = e.target;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (showMagicMenu) {
        // Handle hover over magic skill buttons
        const menuWidth = 400;
        const menuHeight = 300;
        const menuX = (canvasWidth - menuWidth) / 2;
        const menuY = (canvasHeight - menuHeight) / 2;

        const skillButtonWidth = 150;
        const skillButtonHeight = 60;
        const spacingX = 20;
        const spacingY = 20;
        const startX = menuX + spacingX;
        const startY = menuY + 80;

        let hoveredSkillIndex = null;

        magicSkills.forEach((skill, index) => {
          const cols = 2; // Number of columns
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = startX + col * (skillButtonWidth + spacingX);
          const y = startY + row * (skillButtonHeight + spacingY);

          if (
            mouseX >= x &&
            mouseX <= x + skillButtonWidth &&
            mouseY >= y &&
            mouseY <= y + skillButtonHeight
          ) {
            hoveredSkillIndex = index;
          }
        });

        if (hoveredMagicSkillRef.current !== hoveredSkillIndex) {
          hoveredMagicSkillRef.current = hoveredSkillIndex;
          playHoverSound();
        }

        return; // Exit early since we're handling magic menu
      }

      // Check if the mouse is over the Back to Lobby button
      if (
        mouseX >= 10 &&
        mouseX <= 160 &&
        mouseY >= 10 &&
        mouseY <= 50
      ) {
        if (hoveredButtonRef.current !== 'backButton') {
          hoveredButtonRef.current = 'backButton';
          playHoverSound();
        }
      }
      // Check if the mouse is over the Next Turn button
      else if (
        mouseX >= 10 &&
        mouseX <= 160 &&
        mouseY >= 60 &&
        mouseY <= 100
      ) {
        if (hoveredButtonRef.current !== 'turnButton') {
          hoveredButtonRef.current = 'turnButton';
          playHoverSound();
        }
      } else {
        if (hoveredButtonRef.current !== null) {
          hoveredButtonRef.current = null;
        }
      }
    },
    [canvasWidth, canvasHeight, showMagicMenu, magicSkills, playHoverSound]
  );

  const handleMouseClick = useCallback(
    (e) => {
      const canvas = e.target;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (showMagicMenu) {
        // Handle clicks on magic skill buttons
        const menuWidth = 400;
        const menuHeight = 300;
        const menuX = (canvasWidth - menuWidth) / 2;
        const menuY = (canvasHeight - menuHeight) / 2;

        const skillButtonWidth = 150;
        const skillButtonHeight = 60;
        const spacingX = 20;
        const spacingY = 20;
        const startX = menuX + spacingX;
        const startY = menuY + 80;

        magicSkills.forEach((skill, index) => {
          const cols = 2; // Number of columns
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = startX + col * (skillButtonWidth + spacingX);
          const y = startY + row * (skillButtonHeight + spacingY);

          if (
            mouseX >= x &&
            mouseX <= x + skillButtonWidth &&
            mouseY >= y &&
            mouseY <= y + skillButtonHeight
          ) {
            // Execute the magic skill's effect
            skill.effect();

            // Close the magic menu
            setShowMagicMenu(false);

            // Transition to enemy turn if not already handled by the skill effect
            if (skill.name !== 'Ice Shield') {
              setPlayerState('casting');
              setTimeout(() => {
                setPlayerState('normal');
                setCurrentTurn('Enemy');
                isClicked.current = 0; // Reset for the next player turn
              }, 1000);
            }
          }
        });

        return; // Exit early since we've handled the magic menu
      }

      // Check if the Back to Lobby button was clicked
      if (
        mouseX >= 10 &&
        mouseX <= 160 &&
        mouseY >= 10 &&
        mouseY <= 50
      ) {
        playClickSound();
        resetStatsToMax(); // Reset stats before returning
        onBackToLobby();
      }
      // Check if the Next Turn button was clicked
      else if (
        mouseX >= 10 &&
        mouseX <= 160 &&
        mouseY >= 60 &&
        mouseY <= 100
      ) {
        playClickSound();
        setCurrentTurn((prevTurn) =>
          prevTurn === 'Player' ? 'Enemy' : 'Player'
        );
      }

      // Optionally, handle clicks on inventory items here
      // For example, using or equipping items
    },
    [canvasWidth, canvasHeight, showMagicMenu, magicSkills, playClickSound, resetStatsToMax, onBackToLobby]
  );

  // Watch for playerHP changes to handle player defeat
  useEffect(() => {
    if (playerHP <= 0) {
      handlePlayerDefeat();
    }
  }, [playerHP, handlePlayerDefeat]);

  return (
    <div
      style={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
      }}
    >
      <CanvasRenderer
        draw={draw}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
      />
      {/* Skill Buttons */}
      <div style={{ position: 'absolute', top: 120, left: 10 }}>
        {currentTurn === 'Player' &&
          skills.map((skill) => (
            <SkillButton
              key={skill.name}
              skill={skill}
              onClick={() => handleSkillAction(skill.name)}
            />
          ))}
      </div>
      {/* HP Bars and Portraits */}
      <HPBar
        hp={playerHP}
        maxHP={playerMaxHp}
        x={20}
        y={canvasHeight - 130}
        width={80}
      />
      {/* Mana Bar */}
      <ManaBar
        mana={playerMana}
        maxMana={maxMana}
        x={20}
        y={canvasHeight - 110} // Position it under the HP bar
        width={80}
      />
      <HPBar
        hp={enemyHP}
        maxHP={enemyStats.maxHp}
        x={canvasWidth - 100}
        y={canvasHeight - 140}
        width={80}
      />
      <Portrait
        imageSrc={selectedPng}
        x={20}
        y={canvasHeight - 100}
        size={80}
      />
      <Portrait
        imageSrc={selectedEnemy.image}
        x={canvasWidth - 100}
        y={canvasHeight - 100}
        size={80}
      />

      {/* Victory Modal */}
      {showVictoryModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          <h1 style={{ fontSize: 48, marginBottom: 20 }}>Congratulations!</h1>
          <p style={{ fontSize: 24 }}>You have defeated the enemy!</p>
          <p style={{ fontSize: 24 }}>Experience Gained: 50</p>
          <button
            onClick={() => {
              playClickSound();
              resetStatsToMax(); // Reset stats before returning
              onBackToLobby();
            }}
            style={{
              marginTop: 30,
              padding: '10px 20px',
              fontSize: 18,
              backgroundColor: '#FF6347',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Return to Lobby
          </button>
        </div>
      )}

      {/* Defeat Modal */}
      {showDefeatModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          <h1 style={{ fontSize: 48, marginBottom: 20 }}>Defeated!</h1>
          <p style={{ fontSize: 24 }}>
            You have been defeated by the enemy.
          </p>
          <button
            onClick={() => {
              playClickSound();
              resetStatsToMax(); // Reset stats before returning
              onBackToLobby();
            }}
            style={{
              marginTop: 30,
              padding: '10px 20px',
              fontSize: 18,
              backgroundColor: '#FF6347',
              color: 'white',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            Return to Lobby
          </button>
        </div>
      )}

      {/* Loot Modal Removed from BattleScene */}
    </div>
  );
}

export default BattleScene;
