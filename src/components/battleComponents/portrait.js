// Portrait.js
import React from 'react';

function Portrait({ imageSrc, x, y, size }) {
  const style = {
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: 'cover',
  };

  return <div style={style}></div>;
}

export default Portrait;
