/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import Cookies from 'js-cookie';

// Function to retrieve cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

function ExploreCanvas({ playerId, playerLevel, onBackToLobby }) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // State variables
  const [otherPlayers, setOtherPlayers] = useState({});
  const [playerPng, setPlayerPng] = useState(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [goldCoins, setGoldCoins] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [nickname, setNickname] = useState(''); // Nickname state
  const [isNicknameSet, setIsNicknameSet] = useState(false); // Flag to check if nickname is set

  // References
  const backgroundImage = useRef(new Image());
  const goldCoinImage = useRef(new Image());
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load background and gold coin images
  useEffect(() => {
    backgroundImage.current.src = '/msbg.jpg';
    backgroundImage.current.onload = () => {
      setBackgroundLoaded(true);
    };

    goldCoinImage.current.src = '/goldcoin.png';
  }, []);

  // Handle nickname submission and WebSocket connection
  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim() === '') {
      alert('Please enter a valid nickname.');
      return;
    }
    setIsNicknameSet(true);

    // Store nickname in a cookie (expires in 7 days)
    Cookies.set('nickname', nickname.trim(), { expires: 7 });

    const pngFromCookie = getCookie('selectedPng');
    setPlayerPng(pngFromCookie);

    if (!pngFromCookie) {
      console.error('No selectedPng found in cookies');
      return;
    }

    // Initialize WebSocket connection
    const ws = new WebSocket('wss://027d-2601-201-8a80-5780-d8d9-7bdc-8caa-a8f9.ngrok-free.app');    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          type: 'join',
          id: playerId,
          png: pngFromCookie,
          level: playerLevel,
          nickname: nickname.trim(), // Send nickname to server
          position: { x: canvasWidth / 2, y: canvasHeight / 2 }, // Initial position
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'playerJoined') {
        setOtherPlayers((prev) => {
          if (prev[data.player.id]) return prev;
          return {
            ...prev,
            [data.player.id]: {
              ...data.player,
              x: Math.random() * (canvasWidth - 100),
              y: Math.random() * (canvasHeight - 100),
              dx: (Math.random() - 0.5) * 2,
              dy: (Math.random() - 0.5) * 2,
            },
          };
        });
      }

      if (data.type === 'playerLeft') {
        setOtherPlayers((prev) => {
          const updatedPlayers = { ...prev };
          delete updatedPlayers[data.id];
          return updatedPlayers;
        });
      }

      if (data.type === 'allPlayers') {
        const playersWithMovement = Object.keys(data.players).reduce((acc, id) => {
          acc[id] = {
            ...data.players[id],
            x: Math.random() * (canvasWidth - 100),
            y: Math.random() * (canvasHeight - 100),
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          };
          return acc;
        }, {});
        setOtherPlayers(playersWithMovement);
      }

      if (data.type === 'playerMoved') {
        setOtherPlayers((prev) => {
          if (!prev[data.player.id]) return prev;
          return {
            ...prev,
            [data.player.id]: {
              ...prev[data.player.id],
              position: data.player.position,
            },
          };
        });
      }

      if (data.type === 'chatMessage') {
        setChatMessages((prev) => [...prev, { nickname: data.nickname, message: data.message }]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  };

  // Initialize nickname from cookie if exists
  useEffect(() => {
    const storedNickname = getCookie('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
      setIsNicknameSet(true);

      const pngFromCookie = getCookie('selectedPng');
      setPlayerPng(pngFromCookie);

      if (!pngFromCookie) {
        console.error('No selectedPng found in cookies');
        return;
      }

      // Initialize WebSocket connection
      const ws = new WebSocket('ws://localhost:8080'); // Update with your server URL if different
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(
          JSON.stringify({
            type: 'join',
            id: playerId,
            png: pngFromCookie,
            level: playerLevel,
            nickname: storedNickname, // Send nickname from cookie
            position: { x: canvasWidth / 2, y: canvasHeight / 2 }, // Initial position
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'playerJoined') {
          setOtherPlayers((prev) => {
            if (prev[data.player.id]) return prev;
            return {
              ...prev,
              [data.player.id]: {
                ...data.player,
                x: Math.random() * (canvasWidth - 100),
                y: Math.random() * (canvasHeight - 100),
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
              },
            };
          });
        }

        if (data.type === 'playerLeft') {
          setOtherPlayers((prev) => {
            const updatedPlayers = { ...prev };
            delete updatedPlayers[data.id];
            return updatedPlayers;
          });
        }

        if (data.type === 'allPlayers') {
          const playersWithMovement = Object.keys(data.players).reduce((acc, id) => {
            acc[id] = {
              ...data.players[id],
              x: Math.random() * (canvasWidth - 100),
              y: Math.random() * (canvasHeight - 100),
              dx: (Math.random() - 0.5) * 2,
              dy: (Math.random() - 0.5) * 2,
            };
            return acc;
          }, {});
          setOtherPlayers(playersWithMovement);
        }

        if (data.type === 'playerMoved') {
          setOtherPlayers((prev) => {
            if (!prev[data.player.id]) return prev;
            return {
              ...prev,
              [data.player.id]: {
                ...prev[data.player.id],
                position: data.player.position,
              },
            };
          });
        }

        if (data.type === 'chatMessage') {
          setChatMessages((prev) => [...prev, { nickname: data.nickname, message: data.message }]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update other players' positions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherPlayers((prev) =>
        Object.keys(prev).reduce((acc, id) => {
          const player = prev[id];
          let newX = player.x + player.dx;
          let newY = player.y + player.dy;

          if (newX < 0 || newX > canvasWidth - 100) player.dx *= -1;
          if (newY < 0 || newY > canvasHeight - 100) player.dy *= -1;

          acc[id] = {
            ...player,
            x: Math.max(0, Math.min(canvasWidth - 100, newX)),
            y: Math.max(0, Math.min(canvasHeight - 100, newY)),
          };
          return acc;
        }, {})
      );
    }, 50);

    return () => clearInterval(interval);
  }, [canvasWidth, canvasHeight]);

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
      Object.values(otherPlayers).forEach((player) => {
        const img = new Image();
        img.src = player.png;

        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, player.x, player.y, 100, 100);
        }

        ctx.fillStyle = 'red';
        ctx.font = '22px Arial';
        ctx.fillText(`Lv ${player.level}`, player.x + 50, player.y - 10);
      });

      // Draw gold coins
      goldCoins.forEach((coin) => {
        ctx.drawImage(goldCoinImage.current, coin.x, coin.y, 30, 30);
      });

      // Draw "Back to Lobby" button
      ctx.fillStyle = '#FF6347';
      ctx.fillRect(10, 10, 150, 40);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Back to Lobby', 85, 30);
    },
    [otherPlayers, goldCoins, canvasWidth, canvasHeight, backgroundLoaded]
  );

  // Handle sending messages
  const handleSendMessage = () => {
    if (currentMessage.trim() && wsRef.current) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chatMessage',
          playerId, // Unique identifier
          message: currentMessage.trim(),
        })
      );
      setCurrentMessage('');
    }
  };

  // Handle pressing Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>
      {/* Render nickname form if nickname is not set */}
      {!isNicknameSet && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <h2>Enter Your Nickname</h2>
          <form onSubmit={handleNicknameSubmit}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname"
              style={{
                padding: '10px',
                width: '200px',
                borderRadius: '5px',
                border: 'none',
                marginBottom: '10px',
                fontSize: '16px',
              }}
              required
            />
            <br />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: '#28a745',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Enter Chatroom
            </button>
          </form>
        </div>
      )}

      {/* Render the game canvas and chat only if nickname is set */}
      {isNicknameSet && (
        <>
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
 {/* Chat Container */}
<div
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '280px',
    height: '300px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    overflowY: 'auto',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }}
>
  <div>
    <strong>Chat</strong>
  </div>
  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
    {chatMessages.map((msg, index) => (
      <div
        key={index}
        style={{
          marginBottom: '5px',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        <strong>{msg.nickname}:</strong> {msg.message}
      </div>
    ))}
    <div ref={chatEndRef} />
  </div>
  {/* Chat Input */}
  <input
    type="text"
    value={currentMessage}
    onChange={(e) => setCurrentMessage(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Type a message..."
    style={{
      width: '100%',
      height: '30px',
      padding: '5px 10px',
      fontSize: '14px',
      borderRadius: '5px',
      border: 'none',
      outline: 'none',
    }}
  />
</div>

        </>
      )}
    </div>
  );
}

export default ExploreCanvas;
