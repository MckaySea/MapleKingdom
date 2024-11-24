import React, { useRef } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import useAudio from './battleComponents/useAudio';

function LobbyScene({ stats, onEnterBattle, characterPng, selectedPng }) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Player stats
  const { level, currentExp, expToLevelUp, attack, defense, maxHp, agility, dexterity, luck } = stats;

  // Audio hooks
  const playHoverSound = useAudio('/sounds/hover.mp3');
  const playClickSound = useAudio('/sounds/clicker.mp3');

  // Background and character images
  const background = useRef(new Image());
  const characterImage = useRef(new Image());
  const frameCount = useRef(0);

  background.current.src = '/msbg.jpg'; // Retro-style lobby background image
  characterImage.current.src = selectedPng; // Character PNG

  // Button hover state
  const hoveredButtonRef = useRef(null);

  // Drawing function
  const draw = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.drawImage(background.current, 0, 0, canvasWidth, canvasHeight);

    // Draw player stats in retro style
    ctx.fillStyle = 'red';
    ctx.font = '20px "Press Start 2P"'; // Retro pixel-style font
    ctx.textAlign = 'left';

    ctx.fillText(`Level: ${level}`, 20, 50);
    ctx.fillText(`EXP: ${currentExp} / ${expToLevelUp}`, 20, 80);
    ctx.fillText(`Attack: ${attack}`, 20, 110);
    ctx.fillText(`Defense: ${defense}`, 20, 140);
    ctx.fillText(`Max HP: ${maxHp}`, 20, 170);
    ctx.fillText(`Agility: ${agility}`, 20, 200);
    ctx.fillText(`Dexterity: ${dexterity}`, 20, 230);
    ctx.fillText(`Luck: ${luck}`, 20, 260);

    // Animate the character sway
    const swayAmplitude = 10; // Amplitude of the sway in pixels
    const swaySpeed = 0.05; // Speed of the sway
    const swayOffset = Math.sin(frameCount.current * swaySpeed) * swayAmplitude;

    // Draw character image with sway effect
    const characterX = canvasWidth / 2 - 50;
    const characterY = canvasHeight / 2 - 200 + swayOffset;
    ctx.drawImage(characterImage.current, characterX, characterY, 100, 100);

    // Draw buttons
    drawCanvasButton(ctx, {
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2 - 60,
      width: 200,
      height: 40,
      text: 'Enter Battle',
      isHovered: hoveredButtonRef.current === 'enterBattle',
    });

    drawCanvasButton(ctx, {
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2,
      width: 200,
      height: 40,
      text: 'Quit Game',
      isHovered: hoveredButtonRef.current === 'quitGame',
    });

    // Increment frame count for animation
    frameCount.current += 1;
  };

  // Function to draw buttons on canvas
  const drawCanvasButton = (ctx, { x, y, width, height, text, isHovered }) => {
    ctx.fillStyle = isHovered ? '#FF8261' : '#FF6347'; // Hover effect
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + width / 2, y + height / 2 + 5);
  };

  // Mouse event handlers
  const handleMouseMove = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is over the Enter Battle button
    if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 - 60 &&
      mouseY <= canvasHeight / 2 - 20
    ) {
      if (hoveredButtonRef.current !== 'enterBattle') {
        hoveredButtonRef.current = 'enterBattle';
        playHoverSound();
      }
    }
    // Check if mouse is over the Quit Game button
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 &&
      mouseY <= canvasHeight / 2 + 40
    ) {
      if (hoveredButtonRef.current !== 'quitGame') {
        hoveredButtonRef.current = 'quitGame';
        playHoverSound();
      }
    } else {
      hoveredButtonRef.current = null;
    }
  };

  const handleMouseClick = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Enter Battle button
    if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 - 60 &&
      mouseY <= canvasHeight / 2 - 20
    ) {
      playClickSound();
      onEnterBattle(); // Trigger battle scene
    }
    // Quit Game button
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 &&
      mouseY <= canvasHeight / 2 + 40
    ) {
      playClickSound();
      alert('Thanks for playing!');
    }
  };

  return (
    <div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>
      <CanvasRenderer
        draw={draw}
        width={canvasWidth}
        height={canvasHeight}
        onMouseMove={handleMouseMove}
        onClick={handleMouseClick}
      />
    </div>
  );
}

export default LobbyScene;
