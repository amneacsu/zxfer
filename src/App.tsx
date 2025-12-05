import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { LoadingBars } from './components/LoadingBars.tsx';
import { bytesToHex } from './utils/byesToHex.ts';

const audioFiles = [
  './audio/Manic_Miner.wav',
  './audio/Jetpac.wav',
  './audio/Zynaps.wav',
  './audio/bad.wav',
];

export const App = () => {
  const dataViewRef = useRef<HTMLPreElement>(null);
  const [loadingBarsVisible, setLoadingBarsVisible] = useState(false);
  const [src, setSrc] = useState(audioFiles[0]);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [blocks, setBlocks] = useState<number[][]>([]);

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
    } else {
      audioElement.pause();
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

  useEffect(() => {
    const dataViewElement = dataViewRef.current;
    if (!dataViewElement) return;

    dataViewElement.scrollTop = dataViewElement.scrollHeight;
  }, [blocks]);

  return (
    <>
      <div id="ui">
        <div id="sidebar">
          <select value={src} onChange={(event) => {
            setSrc(event.target.value);
            handleClear();
          }}>
            {audioFiles.map((audioFile, index) => (
              <option key={index} value={audioFile}>{audioFile}</option>
            ))}
          </select>

          <nav>
            <button onClick={handlePlay} type="button">
              Play / Pause
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
          </nav>

          <fieldset>
            <label>
              <input
                type="checkbox"
                checked={loadingBarsVisible}
                onChange={(event) => {
                  setLoadingBarsVisible(event.target.checked);
                }}
              />
              Loading bars
            </label>
          </fieldset>

          <pre>
            state: {decoderState}
          </pre>

          {loader && (
            <Oscilloscope
              loader={loader}
              width={320}
              height={200}
            />
          )}
        </div>

        <pre id="debug" ref={dataViewRef}>
          {blocks.map((block, index) => {
            if (block.length === 0) return null;

            return (
              <React.Fragment key={index}>
                {[
                  `Block ${index}`,
                  `Size: ${block.slice(1, -1).length} bytes`,
                  '',
                  bytesToHex(block, true, true),
                  '',
                ].join('\n')}
              </React.Fragment>
            );
          })}
        </pre>
      </div>

      <audio
        hidden
        ref={audioRef}
        src={src}
        controls
      />

      {loader && loadingBarsVisible && (
        <LoadingBars
          loader={loader}
        />
      )}
    </>
  );
};
