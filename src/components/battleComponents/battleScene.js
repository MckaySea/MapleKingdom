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
import Portrait from './portrait';
import useAudio from './useAudio';
import Cookies from 'js-cookie';
import itemsList from '../itemslist';
function BattleScene({
  selectedPng, // Added prop for attack PNG
  stats,
  onBackToLobby,
  addItemToInventory,
  setLastLoot,
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
    agility: playerAgility,
    dexterity: playerDex,
    intellect: playerInt,
  } = stats;

  // Player HP state
  const [playerHP, setPlayerHP] = useState(playerMaxHp);

  // Define minimum and maximum sizes for the player's image
  const playerMinSize = 70; // Smaller size at level 1
  const playerMaxSize = 200; // Maximum size at higher levels
  const playerMaxLevel = 50; // Level at which the size caps

  // Calculate player image size based on level
  const playerImageSize = useMemo(() => {
    const sizeIncrement =
      (playerMaxSize - playerMinSize) / (playerMaxLevel - 1);
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
  const anglePlayerRef = useRef(0);
  const angleEnemyRef = useRef(0);
  const hoveredButtonRef = useRef(null);
  const isClicked = useRef(0); // Ref to track if a button has been clicked
  const enemyDefeatHandled = useRef(false); // Ref to track if enemy defeat has been handled

  // Skills array
  const skills = [
    { name: 'Attack', icon: '/swordmaple.png' },
    { name: 'Defend', icon: '/items/mapleshield.png' },
    { name: 'Heal', icon: '/items/hppot.png' },
    { name: 'Magic', icon: '/items/maplestaff.png' },
  ];

  // Audio hooks
  const playHoverSound = useAudio('/sounds/hover.mp3');
  const playClickSound = useAudio('/sounds/clicker.mp3');
  const playAttackSound = useAudio('/sounds/attack.mp3');
  const playDamageSound = useAudio('/sounds/damage.mp3');
  const playVictorySound = useAudio('/sounds/quest.mp3');
  const playMissSound = useAudio('/sounds/miss.mp3');

  // Load background image
  const background = useRef(new Image());
  background.current.src = '/maplebattle.jpg';

  // Load player images
  const playerImage = useRef(new Image());
  playerImage.current.src = selectedPng;
const selectedAtkPng = Cookies.get("selectedAtkPng")
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
  }, []);

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
          { item: 'Health Potion', dropRate: 0.3 }, // 40% chance
          { item: 'Katana', dropRate: 0.1 },
          { item: 'Pitch Fork', dropRate: 0.2 },   // 10% chance   // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.2 },
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
          { item: 'Health Potion', dropRate: 0.3 }, // 40% chance
          { item: 'Katana', dropRate: 0.1 },    // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.1 },
        ],
      },
      {
        name: 'Baby Bunny',
        image: '/mobs/bunnyidle.png',
        attackImage: '/sprites2/bunnyatk.png',
        attack: 20,
        defense: 7,
        maxHp: 70,
        agility: 10,
        level: 2,
        lootTable: [
          { item: 'Health Potion', dropRate: 0.3 }, // 40% chance
          { item: 'Katana', dropRate: 0.3 },    // 10% chance
          { item: 'Maple Shield', dropRate: 0.1 }, 
          { item: 'Pitch Fork', dropRate: 0.1 }, 
          { item: 'Gold Coin', dropRate: 0.1 },
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
          { item: 'Round Mace', dropRate: 0.2 },  
          { item: 'Steel Club', dropRate: 0.1 },  // 60% chance // 30% chance
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
          { item: 'Steel Club', dropRate: 0.2 },  // 60% chance
          { item: 'Maple Axe', dropRate: 0.1 },   // 30% chance
                  // 10% chance
        ],
      },
      {
        name: 'Yeti',
        image: '/sprites4/2.png',
        attackImage: '/sprites4/0.png',
        attack: 32,
        defense: 19,
        maxHp: 130,
        agility: 18,
        level: 9,
        lootTable: [
          { item: 'Gold Coin', dropRate: 0.5 }, // 60% chance
          { item: 'Zard', dropRate: 0.1 },   // 30% chance
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
  
        enemyY =  centerY + Math.sin(angleEnemyRef.current * 2);
      }

      // Adjust position to center the image
      enemyX -= enemyWidth / 2;
      enemyY -= enemyHeight / 2;

      // Draw player
      if (playerState === 'attacking') {
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

const handleLootDrops = useCallback(
  (lootTable) => {
    const obtainedLoot = [];

    lootTable.forEach((loot) => {
      const rand = Math.random();
      console.log(`Checking loot: ${loot.item}, Drop rate: ${loot.dropRate}, Random: ${rand}`);
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

// const addItemToInventory = (itemId) => {
//   setInventory((prevInventory) => {
//     const updatedInventory = [...prevInventory, itemId];
//     console.log(`Inventory updated:`, updatedInventory);
//     Cookies.set('inventory', JSON.stringify(updatedInventory), { expires: 7 });
//     return updatedInventory;
//   });
// };

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
          const adjustedAttack = playerAttack + Math.floor(playerDex / 10);
          const damage = Math.max(0, adjustedAttack - enemyStats.defense);

          const newHP = Math.max(prevHP - damage, 0);
          if (newHP < prevHP) {
            playDamageSound();
          }
          return newHP;
        });

        setTimeout(() => {
          setPlayerState('normal');
          if (enemyHP > 0) {
            setCurrentTurn('Enemy');
          }
        }, 500);
      } else if (skillName === 'Heal') {
        setPlayerHP((prevHP) => Math.min(prevHP + 15 + playerInt, playerMaxHp));
        setTimeout(() => setCurrentTurn('Enemy'), 500);
      } else if (skillName === 'Defend') {
        // Implement defend functionality if needed
        setTimeout(() => setCurrentTurn('Enemy'), 500);
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
  
          // Generate a random number between 0 and 1
          const rand = Math.random();
  
          if (rand < missChance) {
            // Enemy missed
            console.log('Enemy missed!');
            playMissSound();
            return prevHP; // No damage taken
          } else {
            // Enemy hits
            const damage = Math.max(0, enemyStats.attack - playerDefense);
            const newHP = Math.max(prevHP - damage, 0);
            if (newHP < prevHP) {
              playDamageSound();
            }
            return newHP;
          }
        });
  
        setTimeout(() => {
          setEnemyState('normal');
          setCurrentTurn('Player');
          isClicked.current = 0; // Reset for the next player turn
        }, 500);
      }, 1000);
  
      return () => clearTimeout(enemyActionTimeout);
    }
  }, [
    currentTurn,
    enemyHP,
    playAttackSound,
    playDamageSound,
    playMissSound,
    playerAgility,
    playerDefense,
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
      };
  
      // Keep player HP unchanged during level-up
      setPlayerHP(updatedStats.maxHp);
    } else {
      updatedStats.currentExp = newExp;
    }
  
    // Save updated stats to cookies
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
  
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
    setShowDefeatModal(true);
    setTimeout(() => {
      onBackToLobby();
    }, 5000);
  }, [onBackToLobby]);

  // Mouse event handlers for the canvas
  const handleMouseMove = useCallback(
    (e) => {
      const canvas = e.target;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

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
    [playHoverSound]
  );

  const handleMouseClick = useCallback(
    (e) => {
      const canvas = e.target;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check if the Back to Lobby button was clicked
      if (
        mouseX >= 10 &&
        mouseX <= 160 &&
        mouseY >= 10 &&
        mouseY <= 50
      ) {
        playClickSound();
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
    [playClickSound, onBackToLobby]
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
