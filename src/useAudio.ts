import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(.5);

  const handlePlay = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }, []);

  const handleRewind = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = 0;
    audioElement.pause();
  }, []);

  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    setVolume(parseFloat(event.currentTarget.value));
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.volume = volume;
  }, [volume]);

  return {
    audioRef,
    handlePlay,
    handleRewind,
    handleVolumeChange,
    volume,
  };
};
