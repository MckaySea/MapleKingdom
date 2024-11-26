import React, { useRef, useEffect } from 'react';

function ChatBox({ chatMessages, currentMessage, setCurrentMessage, onSendMessage }) {
  const chatEndRef = useRef(null);

  // Auto-scroll chat to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
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
  );
}

export default ChatBox;
