/* eslint-disable no-unused-vars */
// src/contexts/WebSocketContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

// Create the context
export const WebSocketContext = createContext();

// Provider component
export const WebSocketProvider = ({ children, playerId, nickname, selectedPng, stats }) => {
  const WS_URL = 'wss://6778-2601-201-8a80-5780-4020-107-e3c2-d87.ngrok-free.app';
  const wsRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [players, setPlayers] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Ensure all necessary player information is available
    if (!playerId || !nickname || !selectedPng) {
      console.warn('Missing essential player information. WebSocket will not connect.');
      return;
    }

    // Initialize WebSocket connection
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: 'join',
          id: playerId,
          png: selectedPng,
          level: stats.level,
          maxHp: stats.maxHp,
          atk: stats.attack,
          def: stats.defense,
          dex: stats.dexterity,
          int: stats.intellect,
          agility: stats.agility,
          luck: stats.luck,
          nickname: nickname.trim(),
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'playerJoined':
          setPlayers((prev) => {
            if (prev[data.player.id]) return prev;
            return {
              ...prev,
              [data.player.id]: {
                ...data.player,
                x: Math.random() * (window.innerWidth - 100),
                y: Math.random() * (window.innerHeight - 100),
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
              },
            };
          });
          break;

        case 'playerLeft':
          setPlayers((prev) => {
            const updatedPlayers = { ...prev };
            delete updatedPlayers[data.id];
            return updatedPlayers;
          });
          break;

        case 'allPlayers':
          const playersWithMovement = Object.keys(data.players).reduce((acc, id) => {
            acc[id] = {
              ...data.players[id],
              x: Math.random() * (window.innerWidth - 100),
              y: Math.random() * (window.innerHeight - 100),
              dx: (Math.random() - 0.5) * 2,
              dy: (Math.random() - 0.5) * 2,
            };
            return acc;
          }, {});
          setPlayers(playersWithMovement);
          break;

        case 'playerMoved':
          setPlayers((prev) => {
            if (!prev[data.player.id]) return prev;
            return {
              ...prev,
              [data.player.id]: {
                ...prev[data.player.id],
                position: data.player.position,
              },
            };
          });
          break;

        case 'chatMessage':
          setChatMessages((prev) => [...prev, { nickname: data.nickname, message: data.message }]);
          break;

        default:
          console.warn('Unhandled message type:', data.type);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [playerId, nickname, selectedPng, stats]);

  // Function to send chat messages
  const sendMessage = (message) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chatMessage',
          playerId: playerId, // Include playerId
          message: message.trim(),
        })
      );
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ chatMessages, players, sendMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
