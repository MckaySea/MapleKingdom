// src/contexts/WebSocketContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';

// Create the context
export const WebSocketContext = createContext();

// Provider component
export const WebSocketProvider = ({ children, playerId, nickname, selectedPng, stats }) => {
  const WS_URL = 'wss://cc20-2601-201-8a80-5780-f1a4-733b-b338-88f3.ngrok-free.app'; // Update to your server's URL
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
          atk: stats.atk,
          def: stats.def,
          dex: stats.dex,
          int: stats.int,
          agility: stats.agility,
          luck: stats.luck,
          nickname: nickname.trim(),
          position: { x: window.innerWidth / 2, y: window.innerHeight / 2 }, // Starting position
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'playerJoined':
          setPlayers((prev) => ({
            ...prev,
            [data.player.id]: {
              ...data.player,
              currentPosition: data.player.position,
              targetPosition: data.player.position,
            },
          }));
          break;

        case 'playerLeft':
          setPlayers((prev) => {
            const updatedPlayers = { ...prev };
            delete updatedPlayers[data.id];
            return updatedPlayers;
          });
          break;

        case 'allPlayers':
          const allPlayers = {};
          for (const id in data.players) {
            allPlayers[id] = {
              ...data.players[id],
              currentPosition: data.players[id].position,
              targetPosition: data.players[id].position,
            };
          }
          setPlayers(allPlayers);
          break;

        case 'playerMoved':
          setPlayers((prev) => ({
            ...prev,
            [data.player.id]: {
              ...prev[data.player.id],
              currentPosition: data.player.position,
              targetPosition: data.player.position,
            },
          }));
          break;

        case 'chatMessage':
          setChatMessages((prev) => [...prev, { nickname: data.nickname, message: data.message }]);
          break;

        case 'error':
          alert(data.message); // Display error message to the user
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chatMessage',
          playerId: playerId,
          message: message.trim(),
        })
      );
    } else {
      console.warn('WebSocket is not connected. Message not sent.');
    }
  };

  // Function to send movement updates
  const sendMove = (position) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'move',
          id: playerId,
          position: position,
        })
      );
    } else {
      console.warn('WebSocket is not connected. Move not sent.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ chatMessages, players, sendMessage, sendMove, isConnected, setPlayers }}>
      {children}
    </WebSocketContext.Provider>
  );
};
