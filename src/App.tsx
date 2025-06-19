import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { DataBlock } from './components/DataBlock.tsx';

const audioFiles = [
  './audio/Manic_Miner.wav',
  './audio/Jetpac.wav',
  './audio/Zynaps.wav',
  './audio/bad.wav',
];

export const App = () => {
  const [src, setSrc] = useState(audioFiles[0]);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [blocks, setBlocks] = useState<number[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClear = useCallback(() => {
    loader?.reset();
    setBlocks([]);
  }, [loader]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const run = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const _loader = new ZxLoader({
      audio: audioElement,
    });

    _loader.onStateChange((newState) => {
      setDecoderState(newState);
    });

    _loader.onByte((byte) => {
      setBlocks((prev) => {
        return [...prev.slice(0, -1), [...(prev.at(-1) ?? []), byte]];
      });
    });

    _loader.onBlock(() => {
      setBlocks((prev) => [...prev, []]);
    });

    _loader.onInit(() => {
      setDecoderState(_loader.state);
      console.log('loader initialized');
    });

    await _loader.init();
    setLoader(_loader);
  }, []);

  const handlePlay = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioElement.paused) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleRewind = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = 0;
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <>
      <nav>
        <select value={src} onChange={(event) => {
          setSrc(event.target.value);
          setIsPlaying(false);
          handleClear();
        }}>
          {audioFiles.map((audioFile, index) => (
            <option key={index} value={audioFile}>{audioFile}</option>
          ))}
        </select>

        <button onClick={handlePlay} type="button">
          {isPlaying ? 'Pause' : 'Play' }
        </button>

        <button onClick={handleRewind} type="button">
          Rewind
        </button>

        <button
          type="button"
          onClick={() => {
            handleClear();
          }}
        >
          Clear memory
        </button>

        <pre>
          state: {decoderState}
        </pre>
      </nav>

      <audio
        hidden
        ref={audioRef}
        src={src}
        controls
      />

      <br />

      {loader && (
        <Oscilloscope
          loader={loader}
          width={640}
          height={400}
        />
      )}

      {blocks.map((block, index) => (
        <DataBlock
          key={index}
          index={index}
          data={block}
        />
      ))}
    </>
  );
};
