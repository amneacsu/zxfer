import React from 'react';
import { HexView } from './HexView.tsx';

interface DataBlockProps {
  index: number;
  data: number[];
}

export const DataBlock = ({
  index,
  data,
}: DataBlockProps) => {
  return (
    <>
      <h3>Block {index}</h3>
      <div>
        Size: {data.length} bytes
      </div>
      <HexView bytes={data} />
    </>
  );
};
