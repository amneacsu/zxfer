import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZxLoader } from './ZxLoader.ts';
import { Block } from './components/Block.tsx';
import { Oscilloscope } from './components/Oscilloscope.tsx';
import { LoadingBars } from './components/LoadingBars.tsx';
import { ScreenMemory } from './components/ScreenMemory.tsx';
import { Button, Checkbox, Range, Select } from './ui/index.ts';
import { BlockData, isHeaderBlock } from './types.ts';
import { useAudio } from './useAudio.ts';

const fileOptions = [
  {
    label: 'Digital reproduction',
    options: [
      {
        value: './audio/Jetpac.wav',
        label: 'Jetpac',
      },
      {
        value: './audio/Manic_Miner.wav',
        label: 'Manic Miner',
      },
      {
        value: './audio/Zynaps.wav',
        label: 'Zynaps',
      },
      {
        value: './audio/PinkPanther.wav',
        label: 'Pink Panther',
      },
    ],
  },
  {
    label: 'Analog audio',
    options: [
      {
        value: './audio/aliens8bitmono.wav',
        label: 'Aliens',
      },
      {
        value: './audio/ZXSPECTRUM_FORTH48-80.wav',
        label: 'Forth 48-80',
      },
      {
        value: './audio/bad.wav',
        label: 'Bad recording',
      },
    ],
  },
];

export const App = () => {
  const {audioRef, handlePlay, handleRewind, handleVolumeChange, volume} = useAudio();
  const dataViewRef = useRef<HTMLPreElement>(null);
  const [loadingBarsVisible, setLoadingBarsVisible] = useState(true);
  const [audioSinkActive, setAudioSinkActive] = useState(true);
  const [src, setSrc] = useState(fileOptions.flatMap((f) => f.options).at(0)?.value);
  const [loader, setLoader] = useState<ZxLoader>();
  const [decoderState, setDecoderState] = useState('');
  const [blocks, setBlocks] = useState<BlockData[]>([]);

  /** Clear memory. */
  const handleClear = useCallback(() => {
    loader?.reset();
    setBlocks([]);
  }, [loader]);

  /** Rewind and reset */
  const handleReset = useCallback(() => {
    handleClear();
    handleRewind();
  }, [handleClear, handleRewind]);

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
    _loader.sink(true);
    setLoader(_loader);
  }, [audioRef]);

  useEffect(() => {
    run();
  }, [run]);

  useEffect(() => {
    loader?.sink(audioSinkActive);
  }, [audioSinkActive, loader]);

  useEffect(() => {
    const dataViewElement = dataViewRef.current;
    if (!dataViewElement) return;

    dataViewElement.scrollTop = dataViewElement.scrollHeight;
  }, [blocks]);

  const screenBlock = useMemo(() => {
    const screenHeaderBlock = blocks.filter((b) => {
      return isHeaderBlock(b) && b.bytes.length > 12;
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
          <Select value={src} onChange={(event) => {
            setSrc(event.target.value);
            handleClear();
          }}>
            {fileOptions.map((group, index) => (
              <optgroup key={index} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))}
          </Select>

          <nav>
            <Button onClick={handlePlay}>
              Play / Pause
            </Button>

            <Button onClick={handleReset}>
              Reset
            </Button>
          </nav>

          <fieldset>
            <legend>Volume</legend>
            <Range
              max={1}
              min={0}
              onChange={handleVolumeChange}
              step={0.01}
              value={volume}
            />
          </fieldset>

          <fieldset>
            <Checkbox
              checked={audioSinkActive}
              label="Audio output"
              onChange={(event) => setAudioSinkActive(event.target.checked)}
            />
            <Checkbox
              checked={loadingBarsVisible}
              label="Loading bars"
              onChange={(event) => setLoadingBarsVisible(event.target.checked)}
            />
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
