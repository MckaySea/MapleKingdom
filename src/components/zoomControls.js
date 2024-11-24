import React from 'react';

const ZoomControls = ({ handleZoomIn, handleZoomOut }) => (
  <div className="absolute top-4 right-4 space-x-2 z-50">
    <button onClick={handleZoomIn} className="zoom-button">
      +
    </button>
    <button onClick={handleZoomOut} className="zoom-button">
      -
    </button>
  </div>
);

export default ZoomControls;
