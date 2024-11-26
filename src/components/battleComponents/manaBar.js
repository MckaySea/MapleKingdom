// Inside src/components/battleComponents/manaBar.js

import React from 'react';

function ManaBar({ mana, maxMana, x, y, width }) {
  const manaPercentage = (mana / maxMana) * 100;

  const containerStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
  };

  const barContainerStyle = {
    width: '100%',
    height: 10,
    backgroundColor: 'grey',
    position: 'relative',
    marginTop: 5, // Space between HP and Mana bars
  };

  const manaStyle = {
    width: `${manaPercentage}%`,
    height: '100%',
    backgroundColor: 'blue',
  };

  const textStyle = {
    marginTop: 2,
    color: 'blue',
    textAlign: 'center',
    fontSize: 12,
  };

  return (
    <div style={containerStyle}>
      <div style={barContainerStyle}>
        <div style={manaStyle}></div>
      </div>
      <div style={textStyle}>
        {mana} / {maxMana}
      </div>
    </div>
  );
}

export default ManaBar;
