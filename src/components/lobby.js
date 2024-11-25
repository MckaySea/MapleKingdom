// src/components/lobby.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import useAudio from './battleComponents/useAudio';
import '../App.css';
import itemsList from './itemslist';
import CanvasRenderer from './battleComponents/canvasRenderer';

function Lobby({
  stats,
  selectedPng,
  selectedAtkPng,
  inventory,
  itemsList,
  onEnterBattle,
  addItemToInventory,
  lastLoot,
  setLastLoot,
}) {
  const canvasWidth = window.innerWidth * 0.7;
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
  const characterAttackImage = useRef(new Image()); // Ref for attack image
  const frameCount = useRef(0);

  background.current.src = '/msbg.jpg'; // Retro-style lobby background image
  characterImage.current.src = selectedPng; // Character defense PNG
  characterAttackImage.current.src = selectedAtkPng; // Character attack PNG

  // Handle image load errors
  characterImage.current.onerror = () => {
    characterImage.current.src = selectedPng; // Fallback image
  };

  characterAttackImage.current.onerror = () => {
    characterAttackImage.current.src = selectedAtkPng; // Fallback image
  };

  // Button hover state
  const hoveredButtonRef = useRef(null);

  // Drawing function
  const draw = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.drawImage(background.current, 0, 0, canvasWidth, canvasHeight);

    // Animate the character sway
    const swayAmplitude = 15; // Amplitude of the sway in pixels
    const swaySpeed = 0.05; // Speed of the sway
    const swayOffset = Math.sin(frameCount.current * swaySpeed) * swayAmplitude;

    // Draw character defense image with sway effect
    const characterX = canvasWidth / 2 - playerImageSize / 2;
    const characterY = canvasHeight / 2 - 200 + swayOffset;

    ctx.drawImage(
      characterImage.current,
      characterX,
      characterY,
      playerImageSize,
      playerImageSize
    );

    // Draw character attack image (e.g., overlay or side position)
    const attackImageSize = playerImageSize * 0.6; // Smaller size for attack
    const attackX = characterX + playerImageSize - attackImageSize / 2;
    const attackY = characterY - attackImageSize / 2;

    ctx.drawImage(
      characterAttackImage.current,
      attackX,
      attackY,
      attackImageSize,
      attackImageSize
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

  // Mouse event handlers for canvas
  const handleMouseMove = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle hover over buttons
    if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 - 60 &&
      mouseY <= canvasHeight / 2 - 20
    ) {
      if (hoveredButtonRef.current !== 'enterBattle') {
        hoveredButtonRef.current = 'enterBattle';
        // playHoverSound(); // Uncomment if using sound
      }
    }
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 &&
      mouseY <= canvasHeight / 2 + 40
    ) {
      if (hoveredButtonRef.current !== 'quitGame') {
        hoveredButtonRef.current = 'quitGame';
        // playHoverSound(); // Uncomment if using sound
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
      // playClickSound(); // Uncomment if using sound
      onEnterBattle(); // Trigger battle scene
    }
    // Quit Game button
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 &&
      mouseY <= canvasHeight / 2 + 40
    ) {
      // playClickSound(); // Uncomment if using sound
      alert('Thanks for playing!');
    }

    // Optionally, handle clicks on inventory items here
    // For example, using or equipping items
  };

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
      <div style={{ flex: '7 7 70%', position: 'relative' }}>
        <CanvasRenderer
          draw={draw}
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
        />
      </div>

      {/* UI Section */}
      <div
        style={{
          flex: '3 3 30%',
          backgroundColor: '#1e1e1e',
          color: 'white',
          padding: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden', // Prevent horizontal overflow
          position: 'relative',
          display: 'flex',
          flexDirection: 'column', // Stack children vertically
        }}
      >
        <h1 className="inventory-title">Welcome to the Lobby!</h1>
        {/* Display Player Stats */}
        <PlayerStats selectedPng={selectedPng} selectedAtkPng={selectedAtkPng} stats={stats} />

        {/* Display Inventory */}
        <InventoryGrid
          inventory={inventory}
          itemsList={itemsList}
          setTooltip={setTooltip}
        />

        {/* Enter Battle Button */}
        <button
          onClick={onEnterBattle}
          className="enter-battle-button"
        >
          Enter Battle
        </button>

        {/* Manage Inventory Buttons */}
        <div className="manage-inventory-buttons">
          <button onClick={() => addItemToInventory(1)}>Add Health Potion</button>
          <button onClick={() => addItemToInventory(2)}>Add Mana Potion</button>
          <button onClick={() => addItemToInventory(3)}>Add Sword</button>
          <button onClick={() => addItemToInventory(4)}>Add Shield</button>
          <button onClick={() => addItemToInventory(5)}>Add Magic Scroll</button>
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
              top: tooltip.position.y + 10, // Slight offset
              left: tooltip.position.x + 10,
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components

// PlayerStats Component
function PlayerStats({ selectedPng, selectedAtkPng, stats }) {
  return (
    <div className="player-stats-container" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <img
          src={selectedPng}
          alt="Player Defense"
          className="player-image mr-4"
          style={{
            width: '100px', // Adjust as needed
            height: '100px',
            objectFit: 'contain',
          }}
        />
        {/* Uncomment if you want to display attack image */}
        {/* <img
          src={selectedAtkPng}
          alt="Player Attack"
          className="player-attack-image sway-animation"
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
          }}
        /> */}
      </div>
      <div className="player-stats">
        <div className="stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <p className="stat-item">Level: {stats.level}</p>
          <p className="stat-item">EXP: {stats.currentExp} / {stats.expToLevelUp}</p>
          <p className="stat-item">Attack: {stats.attack}</p>
          <p className="stat-item">Defense: {stats.defense}</p>
        </div>
        <div className="stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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
  // Map inventory IDs to item objects, including empty slots if needed
  const items = inventory.map((itemId, index) => itemsList.find((itm) => itm.id === itemId) || null);

  const handleUseItem = (itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);
    if (item) {
      alert(`Used ${item.name}!`);
      // Implement logic to use or equip the item
      // For example, remove from inventory if consumable
    }
  };

  const playTooltipSound = useAudio('/sounds/hover.mp3'); // Optional: Tooltip sound

  return (
    <div className="inventory-grid-container">
      <h2 className="inventory-title">Your Inventory</h2>
      <div className="inventory-grid">
        {items.map((item, index) => (
          item ? (
            <div
              key={index}
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
            <div
              key={index}
              className="inventory-empty-slot"
            ></div>
          )
        ))}
      </div>
    </div>
  );
}

// LootModal Component
function LootModal({ lootedItems, handleCloseLootModal }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%', // Full width to cover the entire screen
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        zIndex: 200, // Ensure it's above other elements
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
        className="loot-continue-button"
      >
        Continue
      </button>
    </div>
  );
}

export default Lobby;
