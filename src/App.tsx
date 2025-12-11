import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Block } from './components/Block.tsx';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { LoadingBars } from './components/LoadingBars.tsx';
import { ScreenMemory } from './components/ScreenMemory.tsx';
import { BlockData } from './types.ts';

const audioFiles = [
  './audio/Jetpac.wav',
  './audio/Manic_Miner.wav',
  './audio/Zynaps.wav',
  './audio/aliens8bitmono.wav',
  './audio/bad.wav',
];

export const App = () => {
  const dataViewRef = useRef<HTMLPreElement>(null);
  const [loadingBarsVisible, setLoadingBarsVisible] = useState(false);
  const [src, setSrc] = useState(audioFiles[0]);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [blocks, setBlocks] = useState<BlockData[]>([]);

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
        const b = prev.at(-1);
        if (!b) return prev;

        return [
          ...prev.slice(0, -1),
          {
            ...b,
            bytes: [...b.bytes, byte],
          },
        ];
      });
    });

    _loader.onBlock((payload) => {
      setBlocks((prev) => [...prev, payload]);
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

  const screenBlock = useMemo(() => {
    const screenHeaderBlock = blocks.filter((b) => {
      return b.marker === 0 && b.bytes.length > 12;
    }).find((b) => {
      const arr = new Uint8Array(b.bytes);
      const view = new DataView(arr.buffer);
      const len = view.getUint16(11, true);
      return len === 6912;
    });

    if (!screenHeaderBlock) return;

    return blocks.at(blocks.indexOf(screenHeaderBlock) + 1);
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

          {screenBlock && (
            <ScreenMemory block={screenBlock} />
          )}
        </div>

        <pre id="debug" ref={dataViewRef}>
          {blocks.map((block, index) => {
            return (
              <Block key={index} index={index} block={block} />
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
