/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CanvasRenderer from './battleComponents/canvasRenderer';
import Cookies from 'js-cookie';

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
  const [goldCoins, setGoldCoins] = useState([]);

  const backgroundImage = useRef(new Image());
  const goldCoinImage = useRef(new Image());

  useEffect(() => {
    backgroundImage.current.src = '/msbg.jpg';
    backgroundImage.current.onload = () => {
      setBackgroundLoaded(true);
    };

    goldCoinImage.current.src = '/goldcoin.png';
  }, []);

  useEffect(() => {
    const preloadPlayerImages = () => {
      const images = {};
      Object.values(otherPlayers).forEach((player) => {
        if (!images[player.png]) {
          const img = new Image();
          img.src = player.png;
          images[player.png] = img;
        }
      });
      return images;
    };

    preloadPlayerImages();
  }, [otherPlayers]);

  useEffect(() => {
    const pngFromCookie = getCookie('selectedPng');
    setPlayerPng(pngFromCookie);

    if (!pngFromCookie) {
      console.error('No selectedPng found in cookies');
      return;
    }

    const ws = new WebSocket('wss://027d-2601-201-8a80-5780-d8d9-7bdc-8caa-a8f9.ngrok-free.app');

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
        setOtherPlayers((prev) => {
          if (prev[data.player.id]) return prev; // Prevent duplicates based on uuid
          return {
            ...prev,
            [data.player.id]: {
              ...data.player,
              x: Math.random() * canvasWidth,
              y: Math.random() * canvasHeight,
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
          if (acc[id]) return acc; // Prevent duplicates based on uuid
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

  const draw = useCallback(
    (ctx) => {
      if (!backgroundLoaded) return;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(backgroundImage.current, 0, 0, canvasWidth, canvasHeight);

      const playerImages = Object.values(otherPlayers).reduce((acc, player) => {
        if (!acc[player.png]) {
          const img = new Image();
          img.src = player.png;
          acc[player.png] = img;
        }
        return acc;
      }, {});

      Object.values(otherPlayers).forEach((player) => {
        let img = playerImages[player.png] || new Image();

        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, player.x, player.y, 100, 100);
        }

        ctx.fillStyle = 'red';
        ctx.font = '22px Arial';
        ctx.fillText(`Lv ${player.level}`, player.x + 50, player.y - 10);
      });

      goldCoins.forEach((coin) => {
        ctx.drawImage(goldCoinImage.current, coin.x, coin.y, 30, 30);
      });

      ctx.fillStyle = '#FF6347';
      ctx.fillRect(10, 10, 150, 40);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Back to Lobby', 85, 30);
    },
    [otherPlayers, goldCoins, canvasWidth, canvasHeight, backgroundLoaded]
  );

  const handleMouseClick = (e) => {
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

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
