import React, { useMemo } from 'react';
import { bytesToHex } from '../utils/byesToHex.ts';
import { BlockData } from '../types.ts';

interface BlockProps {
  block: BlockData;
  index: number;
}

export const Block = ({
  block,
  index,
}: BlockProps) => {
  const output = useMemo(() => {
    if (block.bytes.length === 0) return;
    const arr = new Uint8Array(block.bytes);
    const view = new DataView(arr.buffer);

    const rows: string[] = [
      `Block ${index} (${block.marker === 0 ? 'header' : 'data'})`,
      `Size: ${block.bytes.length} bytes`,
    ];

    if (block.marker === 0) {
      rows.push(
        `Data length: ${view.byteLength >= 13 ? view.getUint16(11, true) : ''}`,
        `Param 1: ${view.byteLength >= 15 ? view.getUint16(13, true) : ''}`,
        `Param 2: ${view.byteLength >= 17 ? view.getUint16(15, true) : ''}`,
      );
    }

    rows.push(
      '',
      bytesToHex(block.bytes, true, true),
      '',
    );

    return rows.join('\n');
  }, [index, block]);

  if (block.bytes.length === 0) return null;

  return (
    <React.Fragment>
      {output}
    </React.Fragment>
  );
};
