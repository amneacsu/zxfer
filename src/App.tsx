import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { HexView } from './components/HexView.tsx';

const src = './audio/Manic_Miner.wav';
// const src = './audio/Jetpac.wav';
// const src = './audio/1.wav';

export const App = () => {
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [bits, setBits] = useState<number[]>([]);

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

    _loader.onBit((bit) => {
      setBits((prev) => [...prev, bit]);
    });

    _loader.onReset(() => {
      setDecoderState(_loader.state);
    });

    await _loader.main();
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const bytes = useMemo(() => {
    const _bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      const x = bits.slice(i, i + 8).join('');
      _bytes.push(parseInt(x, 2));
    }
    return _bytes;
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
            width={640}
            height={400}
          />
        )}
      </div>
      <pre>
        {JSON.stringify({
          state: decoderState,
          bitLen: bits.length,
        }, null, 2)}
      </pre>
      <HexView bytes={bytes} />
    </div>
  );
};
