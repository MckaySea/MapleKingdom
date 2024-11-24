// HPBar.js
import React from 'react';

function HPBar({ hp, maxHP, x, y, width }) {
  const hpPercentage = (hp / maxHP) * 100;

  const containerStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width: width,
  };

  const barContainerStyle = {
    width: '100%',
    height: 15,
    backgroundColor: 'grey',
    position: 'relative',
  };

  const hpStyle = {
    width: `${hpPercentage}%`,
    height: '100%',
    backgroundColor: 'green',
  };

  const textStyle = {
    marginTop: 5,
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  };

  return (
    <div style={containerStyle}>
      <div style={barContainerStyle}>
        <div style={hpStyle}></div>
      </div>
      <div style={textStyle}>
        {hp} / {maxHP}
      </div>
    </div>
  );
}

export default HPBar;
