import React, { useEffect, useRef } from 'react';
import { ZxLoader } from '../ZxLoader.ts';

import { LoadingBarRenderer } from './LoadingBarRenderer.ts';

interface LoadingBarProps {
  loader: ZxLoader;
  width?: number;
  height?: number;
}

export const LoadingBars = ({
  loader,
  height = 400,
}: LoadingBarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const renderer = new LoadingBarRenderer(canvasElement);

    return loader.onQuantum((quantum) => {
      renderer.clear();
      renderer.drawSamples(quantum);
    });

  }, [loader]);

  return (
    <canvas
      ref={canvasRef}
      id="loadingBars"
      height={height}
    />
  );
};
