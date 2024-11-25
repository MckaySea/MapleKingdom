// src/components/battleComponents/canvasRenderer.js

import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function CanvasRenderer({ draw, width, height, onMouseMove, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    let animationFrameId;

    const render = () => {
      if (typeof draw === 'function') {
        draw(context);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={onMouseMove}
      onClick={onClick}
      style={{ display: 'block' }}
    />
  );
}

CanvasRenderer.propTypes = {
  draw: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func,
};

export default CanvasRenderer;
