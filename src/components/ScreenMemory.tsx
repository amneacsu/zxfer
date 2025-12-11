import React, { useEffect, useRef } from 'react';
import { BlockData } from '../types.ts';

const coords = (addr: number) => {
  const x = (addr & 0b00000000_00011111) << 3;
  let y = (addr & 0b00011000_00000000) >> 5;
  y += (addr & 0b00000000_11100000) >> 2;
  y += (addr & 0b00000111_00000000) >> 8;

  return { x, y };
};

interface ScreenMemoryProps {
  block: BlockData;
}

export const ScreenMemory = ({
  block,
}: ScreenMemoryProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const image = new ImageData(256, 192);

    block.bytes.slice(0, 6144).forEach((byte, index) => {
      const bits = byte.toString(2).padStart(8, '0').split('');
      const { x, y } = coords(index);

      for (let j = 0; j < bits.length; j += 1) {
        const i = y * 256 + x + j;
        image.data[i * 4] = bits[j] === '1' ? 255 : 0;
        image.data[i * 4 + 1] = bits[j] === '1' ? 255 : 0;
        image.data[i * 4 + 2] = bits[j] === '1' ? 255 : 0;
        image.data[i * 4 + 3] = 255;
      }
    });

    const r = [0, 0, 255, 255, 0, 0, 255, 255];
    const g = [0, 0, 0, 0, 255, 255, 255, 255];
    const b = [0, 255, 0, 255, 0, 255, 0, 255];

    const setColors = (x: number, y: number, ink: number, paper: number) => {
      const i = y * 256 + x;
      const idx = image.data[i * 4] === 255 ? ink : paper;
      image.data[i * 4] = r[idx];
      image.data[i * 4 + 1] = g[idx];
      image.data[i * 4 + 2] = b[idx];
    };

    block.bytes.slice(6144).forEach((attr, index) => {
      const x1 = index % 32;
      const y1 = (index - x1) / 32;
      const x2 = x1 + 1;
      const y2 = y1 + 1;

      const ink = attr & 0b0000_0111;
      const paper = (attr & 0b0011_1000) >> 3;

      // 0 = black, 1 = blue, 2 = red, 3 = magenta, 4 = green, 5 = cyan, 6 = yellow, 7 = white).

      for (let y = y1 * 8; y < y2 * 8; y += 1) {
        for (let x = x1 * 8; x < x2 * 8; x += 1) {
          setColors(x, y, ink, paper);
        }
      }
    });

    ctx.putImageData(image, 0, 0);
  }, [block]);

  return (
    <canvas ref={canvasRef} width={256} height={192} />
  );
};
