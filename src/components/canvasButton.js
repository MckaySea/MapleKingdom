function CanvasButton({ x, y, width, height, text, onClick }) {
    const draw = (ctx) => {
      ctx.fillStyle = '#FF6347';
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + width / 2, y + height / 2);
    };
  
    return { draw, onClick: (mouseX, mouseY) => mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height && onClick() };
  }
export default CanvasButton  