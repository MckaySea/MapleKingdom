import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import Cookies from 'js-cookie';

// Utility function to get a cookie value by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

function ExploreCanvas({ playerId, playerLevel, onBackToLobby }) {
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const [otherPlayers, setOtherPlayers] = useState({});
  const [playerPng, setPlayerPng] = useState(null);

  const backgroundImage = useRef(new Image());

  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image: ${src}`);
      });
    };

    const loadBackgroundImage = async () => {
      try {
        backgroundImage.current = await preloadImage('/msbg.jpg');
        console.log('Background image loaded');
      } catch (err) {
        console.error(err);
      }
    };

    loadBackgroundImage();
  }, []);

  useEffect(() => {
    // Get the selected PNG from cookies
    const pngFromCookie = getCookie('selectedPng');
    setPlayerPng(pngFromCookie);

    if (!pngFromCookie) {
      console.error('No selectedPng found in cookies');
      return;
    }

    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          type: 'join',
          id: playerId,
          png: pngFromCookie,
          level: playerLevel,
          position: {
            x: Math.random() * (canvasWidth - 100),
            y: Math.random() * (canvasHeight - 100),
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'playerJoined' || data.type === 'playerUpdated') {
        setOtherPlayers((prev) => ({
          ...prev,
          [data.player.id]: {
            ...data.player,
            position: data.player.position || {
              x: Math.random() * (canvasWidth - 100),
              y: Math.random() * (canvasHeight - 100),
            },
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          },
        }));
        console.log('Player joined/updated:', data.player);
      }

      if (data.type === 'playerLeft') {
        setOtherPlayers((prev) => {
          const updatedPlayers = { ...prev };
          delete updatedPlayers[data.id];
          return updatedPlayers;
        });
        console.log(`Player left: ${data.id}`);
      }

      if (data.type === 'allPlayers') {
        const playersWithMovement = Object.keys(data.players).reduce((acc, id) => {
          acc[id] = {
            ...data.players[id],
            position: data.players[id].position || {
              x: Math.random() * (canvasWidth - 100),
              y: Math.random() * (canvasHeight - 100),
            },
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          };
          return acc;
        }, {});
        setOtherPlayers(playersWithMovement);
        console.log('All players received:', playersWithMovement);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [playerId, playerLevel, canvasWidth, canvasHeight]);

  // Update player positions at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherPlayers((prev) =>
        Object.keys(prev).reduce((acc, id) => {
          const player = prev[id];

          if (!player.position) {
            return acc; // Skip if position is undefined
          }

          let newX = player.position.x + player.dx;
          let newY = player.position.y + player.dy;

          // Bounce off canvas edges
          if (newX < 0 || newX > canvasWidth - 100) player.dx *= -1;
          if (newY < 0 || newY > canvasHeight - 100) player.dy *= -1;

          acc[id] = {
            ...player,
            position: {
              x: Math.max(0, Math.min(canvasWidth - 100, newX)),
              y: Math.max(0, Math.min(canvasHeight - 100, newY)),
            },
          };
          return acc;
        }, {})
      );
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [canvasWidth, canvasHeight]);

  const draw = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);

      // Render all other players' PNGs moving around the canvas
      Object.values(otherPlayers).forEach((player) => {
        if (!player.position || !player.png) return; // Skip if position or PNG is undefined

        const img = new Image();
        img.src = player.png; // Use the actual player.png sent from the server

        img.onload = () => {
          ctx.drawImage(img, player.position.x, player.position.y, 100, 100);
        };

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`Lv ${player.level}`, player.position.x + 50, player.position.y - 10);
      });

      // Draw the "Back to Lobby" button
      ctx.fillStyle = '#FF6347';
      ctx.fillRect(10, 10, 150, 40);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Back to Lobby', 85, 30);
    },
    [otherPlayers, canvasWidth, canvasHeight]
  );

  const handleMouseClick = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if the "Back to Lobby" button is clicked
    if (mouseX >= 10 && mouseX <= 160 && mouseY >= 10 && mouseY <= 50) {
      onBackToLobby();
    }
  };

  return (
    <CanvasRenderer
      draw={draw}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleMouseClick}
    />
  );
}

export default ExploreCanvas;
