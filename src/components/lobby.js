// src/components/Lobby.js
import React, { useState, useEffect, useRef, useMemo } from 'react';

import useAudio from './battleComponents/useAudio';
import '../App.css'; // Ensure App.css is imported if using external CSS
import itemsList from './itemslist'; // Ensure this path is correctfin

function Lobby({
  stats,
  selectedPng,
  inventory,
  onEnterBattle,
  addItemToInventory,
  lastLoot,
  setLastLoot,
}) {
  const canvasWidth = window.innerWidth * 0.7; // 70% width for canvas
  const canvasHeight = window.innerHeight;

  // UI State
  const [showLootModal, setShowLootModal] = useState(false);
  const [lootedItems, setLootedItems] = useState([]);

  // Tooltip State
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    position: { x: 0, y: 0 },
  });

  // Effect to watch for changes in lastLoot
  useEffect(() => {
    if (lastLoot.length > 0) {
      setLootedItems(lastLoot);
      setShowLootModal(true);
      // Optionally, reset lastLoot here or after closing the modal
      // setLastLoot([]); // Uncomment if you want to reset immediately
    }
  }, [lastLoot, setLastLoot]);

  const handleCloseLootModal = () => {
    setShowLootModal(false);
    setLootedItems([]);
    setLastLoot([]); // Reset lastLoot after closing the modal
  };

  // Player stats destructuring
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
  // const playHoverSound = useAudio('/sounds/hover.mp3');
  // const playClickSound = useAudio('/sounds/clicker.mp3');
  

  // Background and character images
  const background = useRef(new Image());
  const characterImage = useRef(new Image());
  const frameCount = useRef(0);

  background.current.src = '/msbg.jpg'; // Retro-style lobby background image
  characterImage.current.src = selectedPng; // Character PNG

  // Button hover state
  const hoveredButtonRef = useRef(null);

  // // Preload inventory item images
  // const itemImages = useMemo(() => {
  //   const images = {};
  //   itemsList.forEach((item) => {
  //     const img = new Image();
  //     img.src = item.png;
  //     images[item.id] = img;
  //   });
  //   return images;
  // }, [itemsList]);

  // Drawing function
  // eslint-disable-next-line no-unused-vars
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
    const swayAmplitude = 15; // Amplitude of the sway in pixels
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

  // // Mouse event handlers for canvas
  // const handleMouseMove = (e) => {
  //   const canvas = e.target;
  //   const rect = canvas.getBoundingClientRect();
  //   const mouseX = e.clientX - rect.left;
  //   const mouseY = e.clientY - rect.top;

  //   // Handle hover over buttons
  //   // Check if mouse is over the Enter Battle button
  //   if (
  //     mouseX >= canvasWidth / 2 - 100 &&
  //     mouseX <= canvasWidth / 2 + 100 &&
  //     mouseY >= canvasHeight / 2 - 60 &&
  //     mouseY <= canvasHeight / 2 - 20
  //   ) {
  //     if (hoveredButtonRef.current !== 'enterBattle') {
  //       hoveredButtonRef.current = 'enterBattle';
  //       playHoverSound();
  //     }
  //   }
  //   // Check if mouse is over the Quit Game button
  //   else if (
  //     mouseX >= canvasWidth / 2 - 100 &&
  //     mouseX <= canvasWidth / 2 + 100 &&
  //     mouseY >= canvasHeight / 2 &&
  //     mouseY <= canvasHeight / 2 + 40
  //   ) {
  //     if (hoveredButtonRef.current !== 'quitGame') {
  //       hoveredButtonRef.current = 'quitGame';
  //       playHoverSound();
  //     }
  //   } else {
  //     if (hoveredButtonRef.current !== null) {
  //       hoveredButtonRef.current = null;
  //     }
  //   }
  // };

  // const handleMouseClick = (e) => {
  //   const canvas = e.target;
  //   const rect = canvas.getBoundingClientRect();
  //   const mouseX = e.clientX - rect.left;
  //   const mouseY = e.clientY - rect.top;

  //   // Enter Battle button
  //   if (
  //     mouseX >= canvasWidth / 2 - 100 &&
  //     mouseX <= canvasWidth / 2 + 100 &&
  //     mouseY >= canvasHeight / 2 - 60 &&
  //     mouseY <= canvasHeight / 2 - 20
  //   ) {
  //     playClickSound();
  //     onEnterBattle(); // Trigger battle scene
  //   }
  //   // Quit Game button
  //   else if (
  //     mouseX >= canvasWidth / 2 - 100 &&
  //     mouseX <= canvasWidth / 2 + 100 &&
  //     mouseY >= canvasHeight / 2 &&
  //     mouseY <= canvasHeight / 2 + 40
  //   ) {
  //     playClickSound();
  //     alert('Thanks for playing!');
  //   }

  //   // Optionally, handle clicks on inventory items here
  //   // For example, using or equipping items
  // };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Canvas Section */}
      {/* Uncomment and adjust if you want to display the canvas */}
      {/* <div style={{ flex: '7 7 70%', position: 'relative' }}>
        <CanvasRenderer
          draw={draw}
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
        />
      </div> */}

      {/* UI Section */}
      <div
        style={{
          flex: '3 3 30%',
          backgroundColor: '#1e1e1e',
          color: 'white',
          padding: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Welcome to the Lobby!</h1>
        {/* Display Player Stats */}
        <PlayerStats selectedPng={selectedPng} stats={stats} />

        {/* Display Inventory */}
        <InventoryGrid
          inventory={inventory}
          itemsList={itemsList}
          setTooltip={setTooltip}
        />

        {/* Enter Battle Button */}
        <button
          onClick={onEnterBattle}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '20px',
          }}
        >
          Enter Battle
        </button>

        {/* Optional: Add UI elements outside the canvas for inventory management */}
        {/* For example, buttons to add items for testing */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Manage Inventory</h3>
          <button
            onClick={() => addItemToInventory(1)}
            style={{
              padding: '5px 10px',
              marginRight: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Add Health Potion
          </button>
          <button
            onClick={() => addItemToInventory(2)}
            style={{
              padding: '5px 10px',
              marginRight: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Add Mana Potion
          </button>
          <button
            onClick={() => addItemToInventory(3)}
            style={{
              padding: '5px 10px',
              marginRight: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Add Sword
          </button>
          <button
            onClick={() => addItemToInventory(4)}
            style={{
              padding: '5px 10px',
              marginRight: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Add Shield
          </button>
          <button
            onClick={() => addItemToInventory(5)}
            style={{
              padding: '5px 10px',
              marginRight: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#555',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Add Magic Scroll
          </button>
        </div>

        {/* Loot Modal */}
        {showLootModal && (
          <LootModal
            lootedItems={lootedItems}
            handleCloseLootModal={handleCloseLootModal}
          />
        )}

        {/* Tooltip Component */}
        {tooltip.visible && (
          <div
            className="retro-tooltip"
            style={{
              position: 'fixed',
              top: tooltip.position.y + 10, // Slight offset
              left: tooltip.position.x + 10,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              pointerEvents: 'none', // Allows mouse events to pass through
              maxWidth: '200px',
              zIndex: 300, // Above other elements
              whiteSpace: 'pre-wrap',
              fontFamily: '"Press Start 2P", cursive', // Retro font
              fontSize: '10px',
              border: '2px dashed #fff', // Retro border
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)', // Optional glow
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;

// Sub-components

// PlayerStats Component
// PlayerStats Component
function PlayerStats({ selectedPng, stats }) {
  return (
    <div className="player-stats-container">
      <img
        src={selectedPng}
        alt="Player"
        width={150} /* Increased size for better visibility */
        height={150}
        className="player-image sway-animation mb-4"
      />
      <div className="player-stats">
        <div className="stats-row">
          <p className="stat-item">Level: {stats.level}</p>
          <p className="stat-item">EXP: {stats.currentExp} / {stats.expToLevelUp}</p>
          <p className="stat-item">Attack: {stats.attack}</p>
          <p className="stat-item">Defense: {stats.defense}</p>
        </div>
        <div className="stats-row">
          <p className="stat-item">Max HP: {stats.maxHp}</p>
          <p className="stat-item">Agility: {stats.agility}</p>
          <p className="stat-item">Dexterity: {stats.dexterity}</p>
          <p className="stat-item">Luck: {stats.luck}</p>
        </div>
      </div>
    </div>
  );
}


// InventoryGrid Component
function InventoryGrid({ inventory, itemsList, setTooltip }) {
  // Create a fixed 10x10 grid (100 slots)
  const gridSize = 100;
  const slots = Array.from({ length: gridSize }, (_, index) => index);

  // Handle item use
  const handleUseItem = (itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);
    if (item) {
      alert(`Used ${item.name}!`);
      // Implement logic to use or equip the item
      // For example, remove from inventory if consumableheal
    }
  };
  const playTooltipSound = useAudio('/sounds/hover.mp3'); // Optional: Tooltip sound
  return (
    <div className="inventory-grid-container mb-5">
    <h2 className="inventory-title text-center">Your Inventory</h2>
    <div className="inventory-grid">
      {slots.map((slotIndex) => {
        const item = inventory[slotIndex]
          ? itemsList.find((itm) => itm.id === inventory[slotIndex])
          : null;

        return item ? (
          <div
            key={slotIndex}
            className="inventory-item"
            onClick={() => handleUseItem(item.id)}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                visible: true,
                content: item.description,
                position: { x: rect.left + rect.width / 2, y: rect.top },
              });
              playTooltipSound(); // Optional: Play tooltip sound
            }}
            onMouseLeave={() =>
              setTooltip({ visible: false, content: '', position: { x: 0, y: 0 } })
            }
          >
            <img
              src={item.png}
              alt={item.name}
              className="inventory-item-image"
            />
            <span className="inventory-item-name">{item.name}</span>
          </div>
        ) : (
          // Empty Slot
          <div key={slotIndex} className="inventory-empty-slot"></div>
        );
      })}
    </div>
  </div>
  )}

// LootModal Component
function LootModal({ lootedItems, handleCloseLootModal }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '70%', // Position it to the right of the canvas (70% width)
        width: '30%',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 200, // Higher than other elements
      }}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Loot Obtained!</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {lootedItems.map((item, index) => (
          <div
            key={index}
            style={{
              margin: '10px',
              textAlign: 'center',
            }}
          >
            <img src={item.png} alt={item.name} width={64} height={64} />
            <p style={{ fontSize: '20px' }}>{item.name}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleCloseLootModal}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          fontSize: '18px',
          backgroundColor: '#FFD700', // Gold color for emphasis
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Continue
      </button>
    </div>
  );
}
