// BattleScene.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import CanvasRenderer from './canvasRenderer';
import SkillButton from './skillButton';
import HPBar from './hpBar';
import Portrait from './portrait';
import useAudio from './useAudio';
import Cookies from 'js-cookie';

function BattleScene({ selectedPng, stats, onBackToLobby }) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Destructure stats
  const {
    level,
    currentExp,
    expToLevelUp,
    attack,
    defense,
    maxHp,
    agility,
  } = stats;

  // Player stats as state variables
  const [playerLevel, setPlayerLevel] = useState(level);
  const [playerExp, setPlayerExp] = useState(currentExp);
  const [playerExpToLevelUp, setPlayerExpToLevelUp] = useState(expToLevelUp);
  const [playerAttack, setPlayerAttack] = useState(attack);
  const [playerDefense, setPlayerDefense] = useState(defense);
  const [playerMaxHp, setPlayerMaxHp] = useState(maxHp);
  const [playerAgility, setPlayerAgility] = useState(agility);
  const [playerHP, setPlayerHP] = useState(playerMaxHp);

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

  // Load images
  const background = useRef(new Image());
  background.current.src = '/maplebattle.jpg';

  const playerImage = useRef(new Image());
  playerImage.current.src = selectedPng;

  const playerAttackImage = useRef(new Image());
  playerAttackImage.current.src = '/sprites3/7.png';

  const enemyImage = useRef(new Image());
  const enemyAttackImage = useRef(new Image());

  // Define an array of enemy types with their stats
  const enemies = [
    {
      name: 'Mushroom',
      image: '/sprites2/mush.png',
      attackImage: '/sprites2/mushatk.png',
      attack: 15,
      defense: 5,
      maxHp: 80,
      agility: 10,
    },
    {
      name: 'Pig',
      image: '/sprites2/mush.png',
      attackImage: '/sprites2/mushatk.png',
      attack: 20,
      defense: 8,
      maxHp: 100,
      agility: 15,
    },
    // Add more enemies as needed
  ];

  // Randomly select an enemy at the beginning
  const randomEnemyIndex = Math.floor(Math.random() * enemies.length);
  const selectedEnemy = enemies[randomEnemyIndex];

  // Enemy images
  enemyImage.current.src = selectedEnemy.image;
  enemyAttackImage.current.src = selectedEnemy.attackImage;

  // Enemy stats as state
  const [enemyStats] = useState({
    attack: selectedEnemy.attack,
    defense: selectedEnemy.defense,
    maxHp: selectedEnemy.maxHp,
    agility: selectedEnemy.agility,
  });

  // Initialize enemy HP
  useEffect(() => {
    setEnemyHP(enemyStats.maxHp);
  }, [enemyStats.maxHp]);

  // Drawing function for CanvasRenderer
  const draw = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.drawImage(background.current, 0, 0, canvasWidth, canvasHeight);

    // Define sizes
    const playerWidth = 150;
    const playerHeight = 150;
    const enemyWidth = 150;
    const enemyHeight = 150;

    const radius = 50; // Radius of circular motion

    // Calculate player position
    let playerX, playerY;
    if (currentTurn === 'Player') {
      playerX =
        300 +
        radius * Math.cos(anglePlayerRef.current) -
        playerWidth / 2;
      playerY =
        canvasHeight -
        350 +
        radius * Math.sin(anglePlayerRef.current) -
        playerHeight / 2;
    } else {
      playerX = 300 - playerWidth / 2;
      playerY = canvasHeight - 350 - playerHeight / 2;
    }

    // Calculate enemy position
    let enemyX, enemyY;
    if (currentTurn === 'Enemy') {
      enemyX =
        canvasWidth -
        400 +
        radius * Math.cos(angleEnemyRef.current) -
        enemyWidth / 2;
      enemyY =
        220 + radius * Math.sin(angleEnemyRef.current) - enemyHeight / 2;
    } else {
      enemyX = canvasWidth - 400 - enemyWidth / 2;
      enemyY = 220 - enemyHeight / 2;
    }

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
    ctx.fillText(`${currentTurn}'s Turn`, canvasWidth / 2, 50);

    // Draw experience and level
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${playerLevel}`, 20, canvasHeight - 180);
    ctx.fillText(
      `EXP: ${playerExp} / ${playerExpToLevelUp}`,
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

    // Increment angles
    const maxAngle = 2 * Math.PI;

    if (currentTurn === 'Player') {
      anglePlayerRef.current =
        (anglePlayerRef.current + 0.002) % maxAngle;
      angleEnemyRef.current =
        (angleEnemyRef.current + 0.005) % maxAngle;
    } else {
      anglePlayerRef.current =
        (anglePlayerRef.current + 0.005) % maxAngle;
      angleEnemyRef.current =
        (angleEnemyRef.current + 0.002) % maxAngle;
    }
  };

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

  // Enemy action effect
  useEffect(() => {
    if (currentTurn === 'Enemy' && enemyHP > 0) {
      const enemyActionTimeout = setTimeout(() => {
        setEnemyState('attacking');
        playAttackSound();

        setPlayerHP((prevHP) => {
          // Compute miss chance
          const missChance =
            playerAgility / (playerAgility + enemyStats.agility);

          // Generate a random number between 0 and 1
          const rand = Math.random();

          if (rand < missChance) {
            // Enemy missed
            console.log('Enemy missed!');
            playMissSound();
            return prevHP; // No damage taken
          } else {
            // Enemy hits
            const damage = Math.max(
              0,
              enemyStats.attack - playerDefense
            );
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

  // Watch for enemyHP changes to handle enemy defeat

  // Handle skill actions
  const handleSkillAction = (skillName) => {
    playClickSound();

    if (skillName === 'Attack') {
      setPlayerState('attacking');
      playAttackSound();

      setEnemyHP((prevHP) => {
        const damage = Math.max(
          0,
          playerAttack - enemyStats.defense
        ); // Use player's attack and enemy's defense
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
      setPlayerHP((prevHP) => Math.min(prevHP + 15, playerMaxHp));
      setTimeout(() => setCurrentTurn('Enemy'), 500);
    }
    // Add more skill effects as needed
  };

  // Handle enemy defeat
  const handleEnemyDefeat = useCallback(() => {
    const expGain = 50; // Experience points for defeating the enemy
    const newExp = playerExp + expGain;

    let updatedStats = { ...stats }; // Make a copy of stats

    // Check for level up
    if (newExp >= playerExpToLevelUp) {
      const excessExp = newExp - playerExpToLevelUp;
      const newLevel = playerLevel + 1;
      const newExpToLevelUp = playerExpToLevelUp + 100;

      // Update stats on level up
      updatedStats = {
        ...updatedStats,
        level: newLevel,
        currentExp: excessExp,
        expToLevelUp: newExpToLevelUp,
        attack: playerAttack + 5,
        defense: playerDefense + 5,
        maxHp: playerMaxHp + 20,
        agility: playerAgility + 2,
      };

      setPlayerLevel(newLevel);
      setPlayerExp(excessExp);
      setPlayerExpToLevelUp(newExpToLevelUp);
      setPlayerAttack(updatedStats.attack);
      setPlayerDefense(updatedStats.defense);
      setPlayerMaxHp(updatedStats.maxHp);
      setPlayerAgility(updatedStats.agility);
      setPlayerHP(updatedStats.maxHp); // Restore HP
    } else {
      updatedStats.currentExp = newExp;
      setPlayerExp(newExp);
    }

    // Update cookies and show victory modal
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
    setShowVictoryModal(true);
    playVictorySound();

    // Return to lobby after delay
    setTimeout(() => {
      onBackToLobby();
    }, 5000);
  }, [
    playerExp,
    playerExpToLevelUp,
    playerLevel,
    playerAttack,
    playerDefense,
    playerMaxHp,
    playerAgility,
    stats,
    playVictorySound,
    onBackToLobby,
  ]);
  // Handle player defeat
  const handlePlayerDefeat = useCallback(() => {
    setShowDefeatModal(true);
    setTimeout(() => {
      onBackToLobby();
    }, 5000);
  }, [onBackToLobby]);

  // Mouse event handlers for the canvas
  const handleMouseMove = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

  

    // Check if the mouse is over the Back to Lobby button
    if (mouseX >= 10 && mouseX <= 160 && mouseY >= 10 && mouseY <= 50) {
     
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
  };

  const handleMouseClick = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if the Back to Lobby button was clicked
    if (mouseX >= 10 && mouseX <= 160 && mouseY >= 10 && mouseY <= 50) {
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
  };
  useEffect(() => {
    if (enemyHP <= 0) {
      handleEnemyDefeat();
    }
  }, [enemyHP]);

  // Watch for playerHP changes to handle player defeat
  useEffect(() => {
    if (playerHP <= 0) {
      handlePlayerDefeat();
    }
  }, [playerHP]);

  return (
    <div
      style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}
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
              onClick={handleSkillAction}
            />
          ))}
      </div>
      {/* HP Bars and Portraits */}
      <HPBar
        hp={playerHP}
        maxHP={playerMaxHp}
        x={20}
        y={canvasHeight - 125}
        width={80}
      />
      <HPBar
        hp={enemyHP}
        maxHP={enemyStats.maxHp}
        x={canvasWidth - 100}
        y={105}
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
        y={20}
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
          <p style={{ fontSize: 24 }}>You have been defeated by the enemy.</p>
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
    </div>
  );
}

export default BattleScene;
