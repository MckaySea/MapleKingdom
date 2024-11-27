/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/ExploreCanvas.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import Cookies from 'js-cookie';
import ChatBox from './chatbox';
import { FaArrowUp } from 'react-icons/fa'; // example icon import
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
  const [goldCoins, setGoldCoins] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [nickname, setNickname] = useState(''); // Nickname state
  const [isNicknameSet, setIsNicknameSet] = useState(false); // Flag to check if nickname is set

  // Access WebSocket context
  const { chatMessages, sendMessage, isConnected, players } = useContext(WebSocketContext);

  // References
  const backgroundImage = useRef(new Image());
  const goldCoinImage = useRef(new Image());
  const chatEndRef = useRef(null);

  // Load background and gold coin images
  useEffect(() => {
    backgroundImage.current.src = '/msbg.jpg';
    backgroundImage.current.onload = () => {
      setBackgroundLoaded(true);
    };

    goldCoinImage.current.src = '/goldcoin.png';
  }, []);

  // Initialize player PNG from cookies or other source
  useEffect(() => {
    const pngFromCookie = getCookie('selectedPng');
    setPlayerPng(pngFromCookie);
  }, []);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Draw function for the canvas
  const draw = useCallback(
    (ctx) => {
      if (!backgroundLoaded) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);

      // Draw other players
      Object.values(players).forEach((player) => {
        const img = new Image();
        img.src = player.png;

        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, player.position.x, player.position.y, 100, 100);
        }

        ctx.fillStyle = 'darkblue';
        ctx.font = '18px Arial';
        ctx.fillText(`${player.nickname} | HP:${player.maxHp}`, player.position.x + 50, player.position.y - 30);
        ctx.fillText(
          `LVL: ${player.level} ● ATK:${atk} ● DEF:${def} ● INT:${int} ● Agility:${agility} ● LUCK:${luck}`,
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
    [players, canvasWidth, canvasHeight, backgroundLoaded, atk, def, int, luck, dex, agility, maxHp]
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
      {/* {!isNicknameSet ? (
        // Render nickname input form
        <form
          onSubmit={handleNicknameSubmit}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          }}
        >
          <h2>Enter Your Nickname</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            required
            style={{ padding: '10px', fontSize: '16px', width: '100%', marginBottom: '10px' }}
          />
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
            Join
          </button>
        </form> */}

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
