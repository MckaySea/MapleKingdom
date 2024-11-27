// src/chatbox.js
import React, { useContext, useRef, useEffect, useState } from 'react';
import { WebSocketContext } from './WebSocketContext';
function ChatBox() {
  const { chatMessages, sendMessage } = useContext(WebSocketContext);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      sendMessage(currentMessage.trim());
      setCurrentMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent newline in the input
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '250px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        overflowY: 'hidden',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Chat Header */}
      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <strong>Chat</strong>
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '10px',
          paddingRight: '5px',
        }}
      >
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
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            height: '35px',
            padding: '5px 10px',
            fontSize: '14px',
            borderRadius: '5px 0 0 5px',
            border: 'none',
            outline: 'none',
            backgroundColor: '#333',
            color: 'white',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: '0 15px',
            height: '35px',
            border: 'none',
            borderRadius: '0 5px 5px 0',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
