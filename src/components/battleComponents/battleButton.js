// Button.js
import React, { useState } from 'react';
import useAudio from './useAudio';

function Button({ text, onClick, style }) {
  const [isHovered, setIsHovered] = useState(false);

  const playHoverSound = useAudio('/sounds/hover.mp3');
  const playClickSound = useAudio('/sounds/clicker.mp3');

  const buttonStyle = {
    backgroundColor: isHovered ? '#FF8261' : '#FF6347',
    color: 'white',
    width: 150,
    height: 40,
    cursor: 'pointer',
    textAlign: 'center',
    lineHeight: '40px',
    marginBottom: 10,
    userSelect: 'none',
    ...style,
  };

  return (
    <div
      style={buttonStyle}
      onMouseEnter={() => {
        setIsHovered(true);
        playHoverSound();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        playClickSound();
        onClick();
      }}
    >
      {text}
    </div>
  );
}

export default Button;
