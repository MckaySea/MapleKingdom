/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const { chatMessages, sendMessage, isConnected, players, sendMove, currentPosition } = useContext(WebSocketContext);

  // References
  const backgroundImage = useRef(new Image());
  const chatEndRef = useRef(null);

  // Cache for player images
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

  // Movement state
  const movementRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const speed = 0.08; // Movement speed in pixels per frame

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movementRef.current.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movementRef.current.down = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movementRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movementRef.current.right = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movementRef.current.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movementRef.current.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movementRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movementRef.current.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop for handling movement
  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      let { up, down, left, right } = movementRef.current;
      let newX = currentPosition.x;
      let newY = currentPosition.y;

      if (up) newY -= speed;
      if (down) newY += speed;
      if (left) newX -= speed;
      if (right) newX += speed;

      // Boundary checks
      newX = Math.max(0, Math.min(canvasWidth - 100, newX));
      newY = Math.max(0, Math.min(canvasHeight - 100, newY));

      // If position has changed, send move
      if (newX !== currentPosition.x || newY !== currentPosition.y) {
        const updatedPosition = { x: newX, y: newY };
        if (isConnected) { // Ensure WebSocket is connected before sending
          sendMove(updatedPosition);
        }
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentPosition, canvasWidth, canvasHeight, sendMove, isConnected]);

  // Draw function for the canvas
  const draw = useCallback(
    (ctx) => {
      if (!backgroundLoaded) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);

      // Draw gold coins (if any)


      // Draw all players
      Object.values(players).forEach((player) => {
        // Check if the image is already cached
        if (!playerImages.current[player.id]) {
          const img = new Image();
          img.src = player.png;
          img.onload = () => {
            playerImages.current[player.id] = img;
            // Redraw after image loads
            draw(ctx); // Safe to call now
          };
          img.onerror = (e) => {
            console.error(`Failed to load image for player ${player.id}: ${player.png}`, e);
          };
        }

        const img = playerImages.current[player.id];
        if (img) {
          ctx.drawImage(img, player.position.x, player.position.y, 100, 100);
        } else {
          // Draw a placeholder rectangle while the image loads or if it fails
          ctx.fillStyle = 'gray';
          ctx.fillRect(player.position.x, player.position.y, 100, 100);
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading...', player.position.x + 50, player.position.y + 50);
        }

        // Draw player info
        ctx.fillStyle = 'darkblue';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.nickname} | HP:${player.maxHp}`, player.position.x + 50, player.position.y - 30);
        ctx.fillText(
          `LVL: ${player.level} ● ATK:${player.atk} ● DEF:${player.def} ● INT:${player.int} ● Agility:${player.agility} ● LUCK:${player.luck}`,
          player.position.x + 50,
          player.position.y - 10
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
    [players, canvasWidth, canvasHeight, backgroundLoaded, atk, def, int, luck, dex, agility, maxHp ] // Removed 'draw'
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
                onClick={(e) => {
                  const canvas = e.target;
                  const rect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const mouseY = e.clientY - rect.top;

                  if (mouseX >= 10 && mouseX <= 160 && mouseY >= 10 && mouseY <= 50) {
                    onBackToLobby();
                  }
                }}
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
