import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { HexView } from './components/HexView.tsx';

// const src = './audio/Manic_Miner.wav';
// const src = './audio/Jetpac.wav';
// const src = './audio/1.wav';

const audioFiles = [
  './audio/Manic_Miner.wav',
  './audio/Jetpac.wav',
  './audio/1.wav',
];

export const App = () => {
  const [src, setSrc] = useState(audioFiles[0]);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [bytes, setBytes] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const run = useCallback(async () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    const _loader = new ZxLoader({
      audio: audioElement,
    });
    setLoader(_loader);

    _loader.onStateChange((newState) => {
      setDecoderState(newState);
    });

    _loader.onByte((byte) => {
      setBytes((prev) => [...prev, byte]);
    });

    _loader.onReset(() => {
      setDecoderState(_loader.state);
    });

    await _loader.main();
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <div>
      <div>
        <select value={src} onChange={(event) => {
          setSrc(event.target.value);
        }}>
          {audioFiles.map((audioFile, index) => (
            <option key={index} value={audioFile}>{audioFile}</option>
          ))}
        </select>
      </div>
      <br />
      <br />
      <audio
        ref={audioRef}
        src={src}
        controls
      />
      <div>
        {loader && (
          <Oscilloscope
            loader={loader}
            width={640}
            height={400}
          />
        )}
      </div>
      <pre>
        {JSON.stringify({
          state: decoderState,
          byteLen: bytes.length,
        }, null, 2)}
      </pre>
      <HexView bytes={bytes} />
      <button type="button" onClick={() => setBytes([])}>
        clear memory
      </button>
    </div>
  );
};
