// CanvasRenderer.js
import React, { useRef, useEffect } from 'react';

function CanvasRenderer({ draw, width, height, ...rest }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      draw(context);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  return <canvas ref={canvasRef} width={width} height={height} {...rest} />;
}

export default CanvasRenderer;
