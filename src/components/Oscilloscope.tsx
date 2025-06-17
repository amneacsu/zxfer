import React, { useEffect, useRef } from 'react';
import { OscilloscopeRenderer } from './OscilloscopeRenderer.ts';
import { ZxLoader } from '../ZxLoader.ts';

export const Oscilloscope = ({
  loader,
}: {
  loader: ZxLoader;
}) => {
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
      width={1024}
      height={400}
    />
  );
};
