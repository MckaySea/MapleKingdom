/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  const backgroundImage = useRef(new Image());
  const imageCache = useRef({});

  useEffect(() => {
    // Load the background image
    backgroundImage.current.src = '/msbg.jpg';
  backgroundImage.current.onload = () => {
  console.log('Background image loaded');
  setBackgroundLoaded(true);
};
backgroundImage.current.onerror = () => {
  console.error('Failed to load background image');

    };
  }, []);

  useEffect(() => {
    const preloadPlayerImages = () => {
      const images = {};
      Object.values(otherPlayers).forEach((player) => {
        if (!images[player.png]) {
          const img = new Image();
          img.src = player.png; // Dynamically set sprite based on player.png
          images[player.png] = img;
        }
      });
      return images;
    };

    preloadPlayerImages();
  }, [otherPlayers]);

  useEffect(() => {
    // Get the selected PNG from cookies
    const pngFromCookie = getCookie('selectedPng');
    setPlayerPng(pngFromCookie);

    if (!pngFromCookie) {
      console.error('No selectedPng found in cookies');
      return;
    }

    const ws = new WebSocket('wss://027d-2601-201-8a80-5780-d8d9-7bdc-8caa-a8f9.ngrok-free.app:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(
        JSON.stringify({
          type: 'join',
          id: playerId,
          png: pngFromCookie,
          level: playerLevel,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'playerJoined') {
        setOtherPlayers((prev) => ({
          ...prev,
          [data.player.id]: {
            ...data.player,
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          },
        }));
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
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          };
          return acc;
        }, {});
        setOtherPlayers(playersWithMovement);
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
  }, [playerId, playerLevel]);

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

  const preloadPlayerImages = () => {
    const images = {};
    Object.values(otherPlayers).forEach((player) => {
      if (!images[player.png]) {
        const img = new Image();
        img.src = player.png;
        img.onload = () => console.log(`${player.png} loaded successfully`);
        img.onerror = () => console.error(`Failed to load ${player.png}`);
        images[player.png] = img;
      }
    });
    return images;
  };
  
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      if (imageCache.current[src]) {
        resolve(imageCache.current[src]);
      } else {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (img.complete && img.naturalWidth > 0) {
            imageCache.current[src] = img;
            resolve(img);
          } else {
            reject(new Error(`Image is invalid: ${src}`));
          }
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      }
    });
  };
  const draw = useCallback(
    async (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
      // Draw background
      if (backgroundImage.current.complete && backgroundImage.current.naturalWidth > 0) {
        ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);
      }
  
      // Draw players
      for (const player of Object.values(otherPlayers)) {
        if (!player.position || !player.png) continue;
  
        try {
          const img = imageCache.current[player.png] || (await preloadImage(player.png));
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, player.position.x, player.position.y, 100, 100);
          }
        } catch (err) {
          console.error('Skipping broken image:', err);
        }
      }
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