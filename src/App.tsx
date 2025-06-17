import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Oscilloscope } from './components/Oscilloscope.tsx';

const src = '/audio/Manic_Miner.wav';
// const src = '/audio/Jetpac.wav';
// const src = '/audio/1.wav';

export const App = () => {
  const dataRef = useRef<HTMLPreElement>(null);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [bits, setBits] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const run = useCallback(async () => {
    const audioElement = audioRef.current;
    const dataElement = dataRef.current;
    if (!audioElement) return;
    const _loader = new ZxLoader({
      audio: audioElement,
    });
    setLoader(_loader);

    _loader.onStateChange((newState) => {
      setDecoderState(newState);
    });

    _loader.onBit((bit) => {
      setBits((prev) => [...prev, bit]);
      if (dataElement) {
        dataElement.scrollTop = dataElement.scrollHeight;
      }
    });

    _loader.onReset(() => {
      setDecoderState(_loader.state);
    });

    await _loader.main();
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const data = useMemo(() => {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      const x = bits.slice(i, i + 8).join('');
      bytes.push(parseInt(x, 2));
    }

    return String.fromCharCode(...bytes);
  }, [bits]);

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        controls
      />
      <div>
        {loader && (
          <Oscilloscope
            loader={loader}
          />
        )}
      </div>
      <pre>
        {JSON.stringify({
          state: decoderState,
          bitLen: bits.length,
        }, null, 2)}
      </pre>
      <pre id="data" ref={dataRef}>
        {data.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200F\u2028\u2029\u2060\uFEFF]/g, '.')}
      </pre>
    </div>
  );
};
