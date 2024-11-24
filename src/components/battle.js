import React, { useEffect, useRef, useState } from 'react';

function BattleScene({ selectedPng, stats, onBackToLobby }) {
  const canvasRef = useRef(null);
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Array of public folder PNGs
  const pngArray = [
    '/sprites2/mush.png',
    '/2.png',
    '/3.png',
    '/4.png',
    '/0.png',
    '/5.png',
    '/6.png',
    '/7.png',
    '/8.png',
  ];
  const randomPng = pngArray[0];
  // Turn system state
  const [currentTurn, setCurrentTurn] = useState('Player');

  // HP state for player and enemy
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);

  // Use useRef to store angles and current turn
  const anglePlayerRef = useRef(0);
  const angleEnemyRef = useRef(0);
  const currentTurnRef = useRef(currentTurn);

  // Update currentTurnRef whenever currentTurn changes
  useEffect(() => {
    currentTurnRef.current = currentTurn;
  }, [currentTurn]);

  // Define skills array
  const skills = [
    { name: 'Attack', icon: '/swordmaple.png' },
    { name: 'Defend', icon: '/defend.png' },
    { name: 'Heal', icon: '/heal.png' },
    { name: 'Magic', icon: '/magic.png' },
  ];

  // Store skill button positions
  const skillButtonsRef = useRef([]);

  // For tracking hovered button
  const hoveredButtonRef = useRef(null);

  // Load sounds using useRef
  const hoverSound = useRef(new Audio('/sounds/hover.mp3'));
  const clickSound = useRef(new Audio('/sounds/clicker.mp3'));
  const attackSound = useRef(new Audio('/sounds/attack.mp3'));
  const damageSound = useRef(new Audio('/sounds/damage.mp3'));

  // State variables for player and enemy states
  const [playerState, setPlayerState] = useState('normal'); // 'normal' or 'attacking'
  const [enemyState, setEnemyState] = useState('normal');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx || !selectedPng) return;

    const background = new Image();
    background.src = '/msbg.jpg';

    const playerImage = new Image();
    playerImage.src = selectedPng;

    // Choose a random PNG from the array
    const enemyImage = new Image();
    enemyImage.src = randomPng;

    // Load attacking images
    const playerAttackImage = new Image();
    playerAttackImage.src = '/sprites3/7.png'; // Replace with actual path

    const enemyAttackImage = new Image();
    enemyAttackImage.src = '/sprites2/mushatk.png'; // Replace with actual path

    // Load portrait images
    const playerPortrait = new Image();
    playerPortrait.src = selectedPng; // You can use a different image if you have one

    const enemyPortrait = new Image();
    enemyPortrait.src = randomPng; // Same as enemy image

    const radius = 50; // Radius of the circular motion

    const backButton = {
      x: 10,
      y: 10,
      width: 150,
      height: 40,
      text: 'Back to Lobby',
    };

    const turnButton = {
      x: 10,
      y: 60,
      width: 150,
      height: 40,
      text: 'Next Turn',
    };

    const drawButton = (button) => {
      ctx.fillStyle = '#FF6347'; // Button background color
      ctx.fillRect(button.x, button.y, button.width, button.height);

      ctx.fillStyle = 'white'; // Button text color
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        button.text,
        button.x + button.width / 2,
        button.y + button.height / 2
      );
    };

    const drawTurnIndicator = () => {
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentTurnRef.current}'s Turn`, canvasWidth / 2, 50);
    };

    const drawPortraits = () => {
      // Set a smaller portrait size
      const portraitSize = 80;

      // Player portrait position
      const playerPortraitX = 20;
      const playerPortraitY = canvasHeight - portraitSize - 20;

      // Draw player portrait
      ctx.drawImage(
        playerPortrait,
        playerPortraitX,
        playerPortraitY,
        portraitSize,
        portraitSize
      );

      // Player HP bar
      drawHPBar(playerHP, playerPortraitX, playerPortraitY - 25, portraitSize);

      // Enemy portrait position
      const enemyPortraitX = canvasWidth - portraitSize - 20;
      const enemyPortraitY = 20;

      // Draw enemy portrait
      ctx.drawImage(
        enemyPortrait,
        enemyPortraitX,
        enemyPortraitY,
        portraitSize,
        portraitSize
      );

      // Enemy HP bar
      drawHPBar(
        enemyHP,
        enemyPortraitX,
        enemyPortraitY + portraitSize + 5,
        portraitSize
      );
    };

    const drawHPBar = (hp, x, y, width) => {
      const maxHP = 100;
      const hpBarWidth = width;
      const hpBarHeight = 15;

      // Background
      ctx.fillStyle = 'grey';
      ctx.fillRect(x, y, hpBarWidth, hpBarHeight);

      // Current HP
      ctx.fillStyle = 'green';
      const currentHPWidth = (hp / maxHP) * hpBarWidth;
      ctx.fillRect(x, y, currentHPWidth, hpBarHeight);

      // HP Text
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${hp} / ${maxHP}`,
        x + hpBarWidth / 2,
        y + hpBarHeight / 2
      );
    };

    // Ensure images are loaded before starting animation
    let imagesLoaded = 0;
    const totalImages = 7;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        animate();
      }
    };

    background.onload = onImageLoad;
    playerImage.onload = onImageLoad;
    enemyImage.onload = onImageLoad;
    playerAttackImage.onload = onImageLoad;
    enemyAttackImage.onload = onImageLoad;
    playerPortrait.onload = onImageLoad;
    enemyPortrait.onload = onImageLoad;

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw background
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // Draw portraits and HP bars
      drawPortraits();

      // Define new sizes
      const playerWidth = 150;
      const playerHeight = 150;
      const enemyWidth = 150;
      const enemyHeight = 150;

      // Calculate player position
      let playerX, playerY;
      if (currentTurnRef.current === 'Player') {
        playerX =
          300 + radius * Math.cos(anglePlayerRef.current) - playerWidth / 2;
        playerY =
          canvasHeight -
          350 +
          radius * Math.sin(anglePlayerRef.current) -
          playerHeight / 2;
      } else {
        playerX = 300 - playerWidth / 2; // Adjusted for size
        playerY = canvasHeight - 350 - playerHeight / 2;
      }

      // Calculate enemy position
      let enemyX, enemyY;
      if (currentTurnRef.current === 'Enemy') {
        enemyX =
          canvasWidth -
          400 +
          radius * Math.cos(angleEnemyRef.current) -
          enemyWidth / 2;
        enemyY =
          220 + radius * Math.sin(angleEnemyRef.current) - enemyHeight / 2;
      } else {
        enemyX = canvasWidth - 400 - enemyWidth / 2; // Adjusted for size
        enemyY = 220 - enemyHeight / 2;
      }

      // Draw player
      if (playerState === 'attacking') {
        ctx.drawImage(
          playerAttackImage,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
      } else {
        ctx.drawImage(
          playerImage,
          playerX,
          playerY,
          playerWidth,
          playerHeight
        );
      }

      // Draw enemy
      if (enemyState === 'attacking') {
        ctx.drawImage(
          enemyAttackImage,
          enemyX,
          enemyY,
          enemyWidth,
          enemyHeight
        );
      } else {
        ctx.drawImage(
          enemyImage,
          enemyX,
          enemyY,
          enemyWidth,
          enemyHeight
        );
      }

      // Draw turn indicator
      drawTurnIndicator();

      // Draw the buttons
      drawButton(backButton);
      drawButton(turnButton);

      // Draw skill buttons if it's the player's turn
      if (currentTurnRef.current === 'Player') {
        drawSkillButtons();
      }

      // Increment angles to create animation
      const maxAngle = 2 * Math.PI;

      if (currentTurnRef.current === 'Player') {
        anglePlayerRef.current =
          (anglePlayerRef.current + 0.002) % maxAngle; // Slower rotation
        angleEnemyRef.current =
          (angleEnemyRef.current + 0.005) % maxAngle; // Faster rotation
      } else {
        anglePlayerRef.current =
          (anglePlayerRef.current + 0.005) % maxAngle; // Faster rotation
        angleEnemyRef.current =
          (angleEnemyRef.current + 0.002) % maxAngle; // Slower rotation
      }

      requestAnimationFrame(animate);
    };

    // Function to draw skill buttons
    const drawSkillButtons = () => {
      const buttonWidth = 150;
      const buttonHeight = 50;
      const x = 10; // Left side of the screen
      const yStart = 120; // Starting y position
      const ySpacing = 10; // Spacing between buttons

      skillButtonsRef.current = []; // Clear previous positions

      for (let i = 0; i < skills.length; i++) {
        const skill = skills[i];
        const y = yStart + i * (buttonHeight + ySpacing);

        // Draw button background
        ctx.fillStyle = '#4682B4'; // SteelBlue color
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Draw skill name
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name, x + 10, y + buttonHeight / 2);

        // Store button position for click detection
        skillButtonsRef.current.push({
          x: x,
          y: y,
          width: buttonWidth,
          height: buttonHeight,
          skill: skill,
        });
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let isHovering = false;

      // Back to Lobby button
      if (
        mouseX >= backButton.x &&
        mouseX <= backButton.x + backButton.width &&
        mouseY >= backButton.y &&
        mouseY <= backButton.y + backButton.height
      ) {
        isHovering = true;
        if (hoveredButtonRef.current !== 'backButton') {
          hoveredButtonRef.current = 'backButton';
          hoverSound.current.play();
        }
      }
      // Next Turn button
      else if (
        mouseX >= turnButton.x &&
        mouseX <= turnButton.x + turnButton.width &&
        mouseY >= turnButton.y &&
        mouseY <= turnButton.y + turnButton.height
      ) {
        isHovering = true;
        if (hoveredButtonRef.current !== 'turnButton') {
          hoveredButtonRef.current = 'turnButton';
          hoverSound.current.play();
        }
      }
      // Skill buttons (only if it's player's turn)
      else if (currentTurnRef.current === 'Player') {
        for (let i = 0; i < skillButtonsRef.current.length; i++) {
          const button = skillButtonsRef.current[i];
          if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
          ) {
            isHovering = true;
            if (hoveredButtonRef.current !== button.skill.name) {
              hoveredButtonRef.current = button.skill.name;
              hoverSound.current.play();
            }
            break;
          }
        }
      }

      if (!isHovering) {
        hoveredButtonRef.current = null;
      }
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Back to Lobby button
      if (
        mouseX >= backButton.x &&
        mouseX <= backButton.x + backButton.width &&
        mouseY >= backButton.y &&
        mouseY <= backButton.y + backButton.height
      ) {
        clickSound.current.play();
        onBackToLobby();
      }
      // Next Turn button
      else if (
        mouseX >= turnButton.x &&
        mouseX <= turnButton.x + turnButton.width &&
        mouseY >= turnButton.y &&
        mouseY <= turnButton.y + turnButton.height
      ) {
        clickSound.current.play();
        setCurrentTurn((prevTurn) =>
          prevTurn === 'Player' ? 'Enemy' : 'Player'
        );
      }
      // Skill buttons (only if it's player's turn)
      else if (currentTurnRef.current === 'Player') {
        for (let i = 0; i < skillButtonsRef.current.length; i++) {
          const button = skillButtonsRef.current[i];
          if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
          ) {
            // Skill button clicked
            console.log('Skill clicked:', button.skill.name);
            clickSound.current.play();

            // Implement skill action here
            handleSkillAction(button.skill.name);

            break;
          }
        }
      }
    };

    const handleSkillAction = (skillName) => {
      if (skillName === 'Attack') {
        setPlayerState('attacking'); // Set state to 'attacking'
        attackSound.current.play(); // Play attack sound

        // Reduce enemy HP
        setEnemyHP((prevHP) => {
          const newHP = Math.max(prevHP - 20, 0);
          if (newHP < prevHP) {
            damageSound.current.play(); // Play damage sound
          }
          return newHP;
        });

        // Reset player state back to 'normal' after 500ms
        const playerAttackTimeout = setTimeout(() => {
          setPlayerState('normal');
        }, 500);

        // Switch turn after action
        const turnSwitchTimeout = setTimeout(() => {
          setCurrentTurn('Enemy');
        }, 500);

        // Clean up timeouts
        return () => {
          clearTimeout(playerAttackTimeout);
          clearTimeout(turnSwitchTimeout);
        };
      } else if (skillName === 'Heal') {
        // Increase player HP
        setPlayerHP((prevHP) => Math.min(prevHP + 15, 100));

        // Switch turn after action
        const turnSwitchTimeout = setTimeout(() => {
          setCurrentTurn('Enemy');
        }, 500);

        // Clean up timeout
        return () => {
          clearTimeout(turnSwitchTimeout);
        };
      }
      // Add more skill effects as needed
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    // Clean up
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [
    selectedPng,
    onBackToLobby,
    playerHP,
    enemyHP,
    currentTurn,
    playerState,
    enemyState,
  ]);

  // Enemy action effect
  useEffect(() => {
    if (currentTurn === 'Enemy') {
      // Enemy action after a short delay
      const enemyActionTimeout = setTimeout(() => {
        setEnemyState('attacking'); // Set enemy state to 'attacking'
        attackSound.current.play(); // Enemy attack sound

        setPlayerHP((prevHP) => {
          const newHP = Math.max(prevHP - 15, 0);
          if (newHP < prevHP) {
            damageSound.current.play(); // Play damage sound
          }
          return newHP;
        });

        // Reset enemy state back to 'normal' after 500ms
        const enemyAttackTimeout = setTimeout(() => {
          setEnemyState('normal');
        }, 500);

        // Switch back to player's turn after enemy action
        const turnSwitchTimeout = setTimeout(() => {
          setCurrentTurn('Player');
        }, 500);

        // Clean up timeouts
        return () => {
          clearTimeout(enemyAttackTimeout);
          clearTimeout(turnSwitchTimeout);
        };
      }, 1000); // 1 second delay for enemy action

      // Clean up timeout if component unmounts or currentTurn changes
      return () => clearTimeout(enemyActionTimeout);
    }
  }, [currentTurn]);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}

export default BattleScene;
