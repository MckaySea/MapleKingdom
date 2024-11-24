// SkillButton.js
import React, { useState } from 'react';
import useAudio from './useAudio';

function SkillButton({ skill, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const playHoverSound = useAudio('/sounds/hover.mp3');
  const playClickSound = useAudio('/sounds/clicker.mp3');

  const buttonStyle = {
    backgroundColor: isHovered ? '#5A9BD5' : '#4682B4',
    color: 'white',
    width: 150,
    height: 50,
    marginBottom: 10,
    textAlign: 'left',
    paddingLeft: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
  };

  const iconStyle = {
    marginRight: 10,
    width: 30,
    height: 30,
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
        onClick(skill.name);
      }}
    >
      <img src={skill.icon} alt={skill.name} style={iconStyle} />
      {skill.name}
    </div>
  );
}

export default SkillButton;
