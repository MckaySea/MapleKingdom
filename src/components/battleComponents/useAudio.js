// useAudio.js
import { useRef, useEffect } from 'react';

function useAudio(src) {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(src);
  }, [src]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return play;
}

export default useAudio;
