// src/components/lobby.js
import React, { useRef, useMemo } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import useAudio from './battleComponents/useAudio';

function Lobby({
  stats,
  onEnterBattle,
  selectedPng,
  inventory,
  itemsList,
  addItemToInventory,
}) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Player stats
  const {
    level,
    currentExp,
    expToLevelUp,
    attack,
    defense,
    maxHp,
    agility,
    dexterity,
    luck,
  } = stats;

  // Define minimum and maximum sizes
  const playerMinSize = 25; // Smaller size at level 1
  const playerMaxSize = 150; // Maximum size at higher levels
  const playerMaxLevel = 50; // Level at which the size caps

  // Calculate player image size based on level
  const playerImageSize = useMemo(() => {
    const sizeIncrement = (playerMaxSize - playerMinSize) / (playerMaxLevel - 1);
    const size = playerMinSize + sizeIncrement * (level - 1);
    return Math.min(size, playerMaxSize); // Ensure size doesn't exceed maxSize
  }, [level]);

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
  const hoveredItemRef = useRef(null); // Ref to track hovered inventory item

  // Preload inventory item images
  const itemImages = useMemo(() => {
    const images = {};
    itemsList.forEach((item) => {
      const img = new Image();
      img.src = item.png;
      images[item.id] = img;
    });
    return images;
  }, [itemsList]);

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
    const characterX = canvasWidth / 2 - playerImageSize / 2;
    const characterY = canvasHeight / 2 - 200 + swayOffset;

    ctx.drawImage(
      characterImage.current,
      characterX,
      characterY,
      playerImageSize,
      playerImageSize
    );

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

    // Draw inventory items in the top-right corner
    const inventorySlotSize = 40; // Size of each inventory slot
    const inventoryMarginRight = 20; // Right margin from the canvas edge
    const inventoryMarginTop = 20; // Top margin from the canvas edge

    inventory.forEach((itemId, index) => {
      const item = itemsList.find((item) => item.id === itemId);
      if (item) {
        const img = itemImages[item.id];
        if (img.complete) {
          const x = canvasWidth - inventoryMarginRight - inventorySlotSize;
          const y = inventoryMarginTop + index * (inventorySlotSize + 30); // 30 for name below

          ctx.drawImage(img, x, y, inventorySlotSize, inventorySlotSize);

          // Draw item name below the image
          ctx.fillStyle = 'white';
          ctx.font = '12px "Press Start 2P"';
          ctx.textAlign = 'center';
          ctx.fillText(item.name, x + inventorySlotSize / 2, y + inventorySlotSize + 15);
        }
      }
    });

    // Draw Tooltip if an item is hovered
// Within the draw function, modify the tooltip rendering section:

if (hoveredItemRef.current) {
  const { x, y, item } = hoveredItemRef.current;

  const tooltipPadding = 10;
  const maxTooltipWidth = 200; // Maximum width for the tooltip
  const lineHeight = 14; // Line height for wrapped text

  // Function to wrap text into multiple lines
  const wrapText = (text, maxWidth, context) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());
    return lines;
  };

  const tooltipText = item.description;
  const tooltipLines = wrapText(tooltipText, maxTooltipWidth - tooltipPadding * 2, ctx);
  const tooltipWidth = Math.max(
    ...tooltipLines.map((line) => ctx.measureText(line).width)
  ) + tooltipPadding * 2;
  const tooltipHeight = tooltipLines.length * lineHeight + tooltipPadding * 2;

  // Position the tooltip above the item if there's space, otherwise below
  let tooltipX = x + inventorySlotSize / 2 - tooltipWidth / 2;
  let tooltipY = y - tooltipHeight - 5;

  if (tooltipX < 0) tooltipX = 0;
  if (tooltipX + tooltipWidth > canvasWidth) tooltipX = canvasWidth - tooltipWidth;
  if (tooltipY < 0) tooltipY = y + inventorySlotSize + 5;

  // Draw tooltip background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

  // Draw tooltip border
  ctx.strokeStyle = 'white';
  ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

  // Draw tooltip text
  ctx.fillStyle = 'white';
  ctx.font = '12px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  tooltipLines.forEach((line, index) => {
    ctx.fillText(
      line,
      tooltipX + tooltipPadding,
      tooltipY + tooltipPadding + index * lineHeight
    );
  });
}


    // Increment frame count for animation
    frameCount.current += 1;
  };

  // Function to draw buttons on canvas
  const drawCanvasButton = (
    ctx,
    { x, y, width, height, text, isHovered }
  ) => {
    ctx.fillStyle = isHovered ? '#FF8261' : '#FF6347'; // Hover effect
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
  };

  // Mouse event handlers
  const handleMouseMove = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let tooltipShown = false;

    // Check if mouse is over any inventory item
    const inventorySlotSize = 40; // Size of each inventory slot
    const inventoryMarginRight = 20; // Right margin from the canvas edge
    const inventoryMarginTop = 20; // Top margin from the canvas edge

    for (let index = 0; index < inventory.length; index++) {
      const itemId = inventory[index];
      const item = itemsList.find((item) => item.id === itemId);
      if (item) {
        const x = canvasWidth - inventoryMarginRight - inventorySlotSize;
        const y = inventoryMarginTop + index * (inventorySlotSize + 30); // 30 for name below

        if (
          mouseX >= x &&
          mouseX <= x + inventorySlotSize &&
          mouseY >= y &&
          mouseY <= y + inventorySlotSize
        ) {
          const img = itemImages[item.id];
          if (img.complete) {
            hoveredItemRef.current = { x, y, item };
            tooltipShown = true;
            break;
          }
        }
      }
    }

    if (!tooltipShown) {
      hoveredItemRef.current = null;
    }

    // Handle hover over buttons
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

    // Optionally, handle clicks on inventory items here
    // For example, using or equipping items
  };

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
      {/* Optional: Add UI elements outside the canvas for inventory management */}
      {/* For example, buttons to add items for testing */}
      <div style={{ position: 'absolute', top: 10, left: 20 }}>
        {/* Example buttons to add items (for testing purposes) */}
        {/* Uncomment and modify as needed */}
         <button onClick={() => addItemToInventory(1)}>Add Health Potion</button>
        {/* <button onClick={() => addItemToInventory(2)}>Add Mana Potion</button>
        <button onClick={() => addItemToInventory(3)}>Add Sword</button>
        <button onClick={() => addItemToInventory(4)}>Add Shield</button>
        <button onClick={() => addItemToInventory(5)}>Add Magic Scroll</button>  */}
      </div>
    </div>
  );
}

export default Lobby;
