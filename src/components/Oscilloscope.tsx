import React, { useEffect, useRef } from 'react';
import { OscilloscopeRenderer } from './OscilloscopeRenderer.ts';
import { ZxLoader } from '../ZxLoader.ts';

interface OscilloscopeProps {
  loader: ZxLoader;
  width?: number;
  height?: number;
}

export const Oscilloscope = ({
  loader,
  width = 1024,
  height = 400,
}: OscilloscopeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const renderer = new OscilloscopeRenderer(canvasElement);

    return loader.onQuantum((quantum) => {
      renderer.clear();
      renderer.drawGrid();
      renderer.drawSamples(quantum);
    });

  }, [loader]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
};
