import React, { useEffect, useRef, useState } from 'react';

function Canvas({ selectedPng, stats }) {
  const canvasRef = useRef(null);
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const [activeStats, setActiveStats] = useState(null);
  const [pngPosition, setPngPosition] = useState({
    x: Math.random() * (canvasWidth - 50),
    y: Math.random() * (canvasHeight - 50),
    width: 50,
    height: 50,
    speedX: 0.2 + Math.random() * 0.1, // Slower speed
    speedY: 0.2 + Math.random() * 0.1, // Slower speed
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx || !selectedPng) return;

    const background = new Image();
    background.src = '/msbg.jpg';

    const pngImage = new Image();
    pngImage.src = selectedPng;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (
        mouseX >= pngPosition.x &&
        mouseX <= pngPosition.x + pngPosition.width &&
        mouseY >= pngPosition.y &&
        mouseY <= pngPosition.y + pngPosition.height
      ) {
        setActiveStats({
          message: 'Stats of Mushroom Coin!',
          stats,
        });
      }
    };

    canvas.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // Update PNG position
      pngPosition.x += pngPosition.speedX;
      pngPosition.y += pngPosition.speedY;

      // Bounce the PNG off the canvas edges
      if (pngPosition.x <= 0 || pngPosition.x + pngPosition.width >= canvasWidth) pngPosition.speedX *= -1;
      if (pngPosition.y <= 0 || pngPosition.y + pngPosition.height >= canvasHeight) pngPosition.speedY *= -1;

      ctx.drawImage(pngImage, pngPosition.x, pngPosition.y, pngPosition.width, pngPosition.height);

      // Draw the stats box if it's active
      if (activeStats) {
        const statsPosition = {
          x: pngPosition.x + pngPosition.width + 10, // Position stats to the right of PNG
          y: pngPosition.y - 10, // Position stats above PNG
        };

        // Draw the stats background box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(statsPosition.x, statsPosition.y, 200, 120);

        // Draw the stats text inside the box
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(activeStats.message, statsPosition.x + 10, statsPosition.y + 20);
        ctx.fillText(`Level: ${activeStats.stats.level}`, statsPosition.x + 10, statsPosition.y + 40);
        ctx.fillText(`HP: ${activeStats.stats.hp} / ${activeStats.stats.maxHp}`, statsPosition.x + 10, statsPosition.y + 60);
        ctx.fillText(`Attack: ${activeStats.stats.attack}`, statsPosition.x + 10, statsPosition.y + 80);
        ctx.fillText(`Defense: ${activeStats.stats.defense}`, statsPosition.x + 10, statsPosition.y + 100);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [selectedPng, pngPosition, stats, activeStats]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      <div className="absolute top-4 right-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Change Selection
        </button>
      </div>
    </div>
  );
}

export default Canvas;
