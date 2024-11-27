/* eslint-disable no-unused-vars */
// src/components/ExploreCanvas.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import Cookies from 'js-cookie';
import ChatBox from './chatbox';
import { WebSocketContext } from './WebSocketContext';

// Function to retrieve cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

function ExploreCanvas({ playerId, playerLevel, onBackToLobby, atk, def, int, luck, dex, agility, maxHp }) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // State variables
  const [playerPng, setPlayerPng] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [nickname, setNickname] = useState(''); // Nickname state
  const [isNicknameSet, setIsNicknameSet] = useState(false); // Flag to check if nickname is set

  // Access WebSocket context
  const { chatMessages, sendMessage, isConnected, players, sendMove, setPlayers } = useContext(WebSocketContext);

  // References
  const backgroundImage = useRef(new Image());
  const chatEndRef = useRef(null);
  const playerImages = useRef({});

  // Load background and gold coin images
  useEffect(() => {
    backgroundImage.current.src = '/msbg.jpg';
    backgroundImage.current.onload = () => {
      setBackgroundLoaded(true);
    };
    backgroundImage.current.onerror = (e) => {
      console.error('Failed to load background image:', e);
    };
  }, []);

  // Initialize player PNG from cookies or other source
  useEffect(() => {
    const pngFromCookie = getCookie('selectedPng');
    if (pngFromCookie) {
      setPlayerPng(pngFromCookie);
    } else {
      console.warn('selectedPng cookie not found. Using default image.');
      setPlayerPng('/images/defaultPlayer.png'); // Ensure this default image exists
    }
  }, []);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Handle click events to set target position
  const handleCanvasClick = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if "Back to Lobby" button was clicked
    if (mouseX >= 10 && mouseX <= 160 && mouseY >= 10 && mouseY <= 50) {
      onBackToLobby();
      return;
    }

    // Set target position
    const newTarget = { x: mouseX - 50, y: mouseY - 50 }; // Adjust for player size (100x100)

    // Boundary checks
    newTarget.x = Math.max(0, Math.min(canvasWidth - 100, newTarget.x));
    newTarget.y = Math.max(0, Math.min(canvasHeight - 100, newTarget.y));

    // Update local player's target position in players state
    setPlayers((prevPlayers) => ({
      ...prevPlayers,
      [playerId]: {
        ...prevPlayers[playerId],
        targetPosition: newTarget,
      },
    }));

    // Send target position to the server
    if (isConnected) {
      sendMove(newTarget);
    }
  };

  // Implement rate limiting for clicks (20 clicks per second)
  const clickTimestampsRef = useRef([]);

  const handleCanvasClickWithRateLimit = (e) => {
    const now = Date.now();
    const timestamps = clickTimestampsRef.current.filter((timestamp) => now - timestamp < 1000); // Keep clicks within the last second

    if (timestamps.length >= 20) {
      console.warn('Click rate limit exceeded');
      return; // Ignore this click
    }

    // Add current timestamp
    timestamps.push(now);
    clickTimestampsRef.current = timestamps;

    // Proceed with movement handling
    handleCanvasClick(e);
  };

  // Draw function for the canvas
  const draw = useCallback(
    (ctx) => {
      if (!backgroundLoaded) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);

      // Draw all players
      Object.values(players).forEach((player) => {
        // Check if the image is already cached
        if (!playerImages.current[player.id]) {
          const img = new Image();
          img.src = player.png;
          img.onload = () => {
            playerImages.current[player.id] = img;
            // Redraw after image loads
            draw(ctx);
          };
          img.onerror = (e) => {
            console.error(`Failed to load image for player ${player.id}: ${player.png}`, e);
          };
        }

        const img = playerImages.current[player.id];
        const position = player.currentPosition || player.position; // Use server-sent position

        if (img) {
          ctx.drawImage(img, position.x, position.y, 100, 100);
        } else {
          // Draw a placeholder rectangle while the image loads or if it fails
          ctx.fillStyle = 'gray';
          ctx.fillRect(position.x, position.y, 100, 100);
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading...', position.x + 50, position.y + 50);
        }

        // Draw player info
        ctx.fillStyle = 'darkblue';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.nickname} | HP:${player.maxHp}`, position.x + 50, position.y - 30);
        ctx.fillText(
          `LVL: ${player.level} ● ATK:${player.atk} ● DEF:${player.def} ● INT:${player.int} ● Agility:${player.agility} ● LUCK:${player.luck}`,
          position.x + 50,
          position.y - 10
        );
      });

      // Draw "Back to Lobby" button
      ctx.fillStyle = '#FF6347';
      ctx.fillRect(10, 10, 150, 40);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Back to Lobby', 85, 30);
    },
    [players, canvasWidth, canvasHeight, backgroundLoaded]
  );

  // Handle sending messages via context
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      sendMessage(currentMessage.trim());
      setCurrentMessage('');
    }
  };

  // Handle pressing Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent newline in the input
      handleSendMessage();
    }
  };

  // Handle nickname submission and setting up WebSocket (handled by context)
  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      alert('Please enter a valid nickname.');
      return;
    }
    setIsNicknameSet(true);

    // Store nickname in a cookie (expires in 7 days)
    Cookies.set('nickname', nickname.trim(), { expires: 7 });
  };

  // Render nickname submission form if not set
  if (!isNicknameSet) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <form onSubmit={handleNicknameSubmit} style={{ textAlign: 'center' }}>
          <h2>Enter Your Nickname</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <br />
          <button type="submit" style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}>
            Join Game
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>
      <>
        {playerPng ? (
          <>
            {/* Render the game canvas */}
            <CanvasRenderer
              draw={draw}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClickWithRateLimit} // Attach rate-limited click handler
            />
            {/* Render the ChatBox globally */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                maxHeight: '300px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '10px',
                padding: '10px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <ChatBox />
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          <div>Loading player image...</div>
        )}
      </>
    </div>
  );
}

export default ExploreCanvas;
