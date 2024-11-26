// src/components/lobby.js

/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useAudio from './battleComponents/useAudio';

import '../App.css';
import Cookies from 'js-cookie';
import CanvasRenderer from './battleComponents/canvasRenderer';
import ChatBox from './chatbox';
function Lobby({
  stats,
  selectedPng,
  onEnterExplore,
  inventory,
  itemsList,
  onEnterBattle,
  addItemToInventory,
  lastLoot,
  setLastLoot,
  equipped,          // Receive equipped state
  equipItem,         // Receive equipItem function
  unequipItem,       // Receive unequipItem function
}) {
  const canvasWidth = window.innerWidth * 0.7;
  const canvasHeight = window.innerHeight;

  // UI State
  const [showLootModal, setShowLootModal] = useState(false);
  const [lootedItems, setLootedItems] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Tooltip State
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    position: { x: 0, y: 0 },
  });

  // Audio Hooks
  const playHoverSound = useAudio('/sounds/hover.mp3'); // ensure useAudio is correctly implemented
  const playClickSound = useAudio('/sounds/clicker.mp3');
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

  // Define minimum and maximum sizes
  const playerMinSize = 25; // Smaller size at level 1
  const playerMaxSize = 150; // Maximum size at higher levels
  const playerMaxLevel = 50; // Level at which the size caps

  // Calculate player image size based on level
  const playerImageSize = useMemo(() => {
    const sizeIncrement = (playerMaxSize - playerMinSize) / (playerMaxLevel - 1);
    const size = playerMinSize + sizeIncrement * (stats.level - 1);
    return Math.min(size, playerMaxSize); // Ensure size doesn't exceed maxSize
  }, [stats.level]);

  // Background and character images
  const background = useRef(new Image());
  const characterImage = useRef(new Image());
  // const characterAttackImage = useRef(new Image()); // Ref for attack image
  const frameCount = useRef(0);

  useEffect(() => {
    background.current.src = '/msbg.jpg'; // Retro-style lobby background image
    characterImage.current.src = selectedPng; // Character defense PNG

    // Handle image load errors
    characterImage.current.onerror = () => {
      characterImage.current.src = selectedPng; // Fallback image
    };
  }, [selectedPng]);

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
    drawCanvasButton(ctx, {
      x: canvasWidth / 2 - 100,
      y: canvasHeight / 2 + 60,
      width: 200,
      height: 40,
      text: 'Explore Area',
      isHovered: hoveredButtonRef.current === 'exploreArea',
    });
    
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
      width: 300,
      height: 40,
      text: 'Collect Resources',
      isHovered: hoveredButtonRef.current === 'collectResources',
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
    } else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 + 60 &&
      mouseY <= canvasHeight / 2 + 100
    ) {
      if (hoveredButtonRef.current !== 'exploreArea') {
        hoveredButtonRef.current = 'exploreArea';
        playHoverSound();
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
      onEnterBattle(); // Trigger battle scene
    }
    // Collect Resources button
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 200 &&
      mouseY >= canvasHeight / 2 &&
      mouseY <= canvasHeight / 2 + 40
    ) {

      // Implement Collect Resources logic
      alert('Resources Collected!');
    }
    else if (
      mouseX >= canvasWidth / 2 - 100 &&
      mouseX <= canvasWidth / 2 + 100 &&
      mouseY >= canvasHeight / 2 + 60 &&
      mouseY <= canvasHeight / 2 + 100
    ) {
      playClickSound();
      onEnterExplore(); // Call the navigation function
    }
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
      {tooltip.visible && (
  <div
    className="retro-tooltip"
    style={{
      position: 'absolute',
      top: tooltip.position.y + 10,
      left: tooltip.position.x,
      transform: 'translateX(-50%)',
    }}
  >
    {tooltip.content}
  </div>
)}

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
        <PlayerStats stats={stats} />

        {/* Display Equipped Items */}
        <EquippedItems
          equipped={equipped}
          itemsList={itemsList}
          unequipItem={unequipItem}
        />

        {/* Display Inventory */}
        <InventoryGrid
          inventory={inventory}
          itemsList={itemsList}
          setTooltip={setTooltip}
          equipped={equipped}
          equipItem={equipItem}
          unequipItem={unequipItem}
        />

        {/* Enter Battle Button */}
        <button
          onClick={onEnterBattle}
          className="enter-battle-button"
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            cursor: 'pointer',
            backgroundColor: '#ff6347',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
          }}
        >
          Enter Battle
        </button>

        {/* Manage Inventory Buttons */}
        {/* <div className="manage-inventory-buttons" style={{ marginTop: '20px' }}>
          <button onClick={() => addItemToInventory(1)} style={manageButtonStyle}>Add Health Potion</button>
          <button onClick={() => addItemToInventory(2)} style={manageButtonStyle}>Add Mana Potion</button>
          <button onClick={() => addItemToInventory(3)} style={manageButtonStyle}>Add Maple Staff</button>
          <button onClick={() => addItemToInventory(4)} style={manageButtonStyle}>Add Maple Shield</button>
          <button onClick={() => addItemToInventory(5)} style={manageButtonStyle}>Add Gold Coin</button>
          <button onClick={() => addItemToInventory(6)} style={manageButtonStyle}>Add Zard</button>
          <button onClick={() => addItemToInventory(7)} style={manageButtonStyle}>Add Maple Axe</button>
          <button onClick={() => addItemToInventory(8)} style={manageButtonStyle}>Add Katana</button>
        </div> */}

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
              position: 'absolute',
              top: tooltip.position.y + 10, // Slight offset
              left: tooltip.position.x + 10,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '5px 10px',
              borderRadius: '5px',
              pointerEvents: 'none',
              zIndex: 1000,
              color: 'white',
              fontSize: '12px',
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles for manage inventory buttons
const manageButtonStyle = {
  padding: '5px 10px',
  margin: '5px 0',
  cursor: 'pointer',
  backgroundColor: '#32cd32',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '14px',
};

// PlayerStats Component
function PlayerStats() {
  const [stats, setStats] = useState(null);

  // Load stats from cookies on component mount
  useEffect(() => {
    const savedStats = Cookies.get('stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [stats]);

  const allocateSkillPoint = (stat) => {
    // Ensure stats exist and there are available skill points
    if (!stats || stats.skillPoints <= 0) return;
  
    // Determine the increment value based on the stat
    const increment = stat === 'maxHp' ? 5 : 1;
  
    // Update stats in local state
    const updatedStats = {
      ...stats,
      [stat]: stats[stat] + increment, // Increase the selected stat
      skillPoints: stats.skillPoints - 1, // Decrease skill points
    };
  
    // Update the state with the new stats
    setStats(updatedStats);
  
    // Save updated stats back to cookies with a 7-day expiration
    Cookies.set('stats', JSON.stringify(updatedStats), { expires: 7 });
  };
  

  if (!stats) {
    return <div>Loading stats...</div>; // Fallback if stats are not yet loaded
  }

  const { level, skillPoints, attack, defense, maxHp, agility, currentExp, expToLevelUp, dexterity, intellect, luck} = stats;

  return (
    <div className="player-stats-container" style={{ marginBottom: '20px' }}>
      <h2>Player Stats</h2>
      <h2>Level: {level}</h2>
      <h3>EXP: {currentExp}/{expToLevelUp} </h3>
      <p>Skill Points: {skillPoints || 0}</p>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Attack: {attack}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('attack')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Defense: {defense}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('defense')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Max HP: {maxHp}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('maxHp')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Agility: {agility}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('agility')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Dexterity: {dexterity}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('dexterity')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Intellect: {intellect}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('intellect')}>+</button>
        )}
      </div>
      <div className="stats-row" style={{ display: 'flex', gap: '10px' }}>
        <p>Luck: {luck}</p>
        {skillPoints > 0 && (
          <button onClick={() => allocateSkillPoint('luck')}>+</button>
        )}
      </div>
    </div>
  );
}

// EquippedItems Component
function EquippedItems({ equipped, itemsList, unequipItem }) {
  const equippedItems = equipped.map(id => itemsList.find(item => item.id === id)).filter(Boolean);

  if (equippedItems.length === 0) {
    return (
      <div className="equipped-items-container" style={{ marginBottom: '20px' }}>
        <h2>Equipped Items</h2>
        <p>No items equipped.</p>
      </div>
    );
  }

  return (
    <div className="equipped-items-container" style={{ marginBottom: '20px' }}>
      <h2>Equipped Items</h2>
      <div className="equipped-items" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {equippedItems.map(item => (
          <div key={item.id} className="equipped-item" style={{ textAlign: 'center' }}>
            <img
              src={item.png}
              alt={item.name}
              className="equipped-item-image"
              style={{ width: '50px', height: '50px', cursor: 'pointer' }}
              onClick={() => unequipItem(item.id)}
            />
            <p style={{ fontSize: '12px' }}>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// InventoryGrid Component
function InventoryGrid({ inventory, itemsList, setTooltip, equipped, equipItem, unequipItem }) {
  // Map inventory IDs to item objects, including empty slots if needed
  const items = inventory.map((itemId, index) => itemsList.find((itm) => itm.id === itemId) || null);

  const handleUseItem = (itemId) => {
    const item = itemsList.find((itm) => itm.id === itemId);
    if (item && !item.equippable) {
      alert(`Used ${item.name}!`);
      // Implement logic to use the item, e.g., remove from inventory if consumable
    }
  };
  const handleMouseEnter = (item, e) => {
    const rect = e.target.getBoundingClientRect();
    playHoverSound();
    setTooltip({
      visible: true,
      content: item.description,
      position: { x: rect.left + rect.width / 2, y: rect.top },
    });
  };
  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: '', position: { x: 0, y: 0 } });
  };
  const playHoverSound = useAudio('/sounds/hover.mp3'); // Optional: Tooltip sound

  return (
    <div className="inventory-grid-container">
    <h2 className="inventory-title">Your Inventory</h2>
    <div className="inventory-grid">
      {items.map((item, index) => (
        item ? (
          <div
            key={index}
            className={`inventory-item ${equipped.includes(item.id) ? 'equipped' : ''}`}
            onMouseEnter={(e) => handleMouseEnter(item, e)}
            onMouseLeave={handleMouseLeave}
          >
            <img src={item.png} alt={item.name} className="inventory-item-image" />
            <span className="inventory-item-name">{item.name}</span>
            {item.equippable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (equipped.includes(item.id)) {
                    unequipItem(item.id);
                  } else {
                    equipItem(item.id);
                  }
                }}
                className={`equip-button ${equipped.includes(item.id) ? 'unequip' : 'equip'}`}
              >
                {equipped.includes(item.id) ? 'Unequip' : 'Equip'}
              </button>
            )}
          </div>
        ) : (
          <div key={index} className="inventory-empty-slot"></div>
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
        style={{
          padding: '10px 20px',
          marginTop: '20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#ff6347',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Continue
      </button>
    </div>
  );
}

export default Lobby;
