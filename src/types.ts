export type DecoderState = 'WAITPILOT' | 'PILOT' | 'PROG';

export type MarkerByte = 0x00 | 0xFF;

export type BlockData = {
  marker: MarkerByte;
  bytes: number[];
};

export const isHeaderBlock = (block: BlockData) => block.marker === 0x00;
export const isDataBlock = (block: BlockData) => block.marker === 0xFF;

export type DecoderMessage = (
  | {
    type: 'statechange';
    payload: DecoderState;
  }
  | {
    type: 'quantum';
    payload: Float32Array<ArrayBufferLike>;
  }
  | {
    type: 'byte';
    payload: number;
  }
  | {
    type: 'init';
    payload?: never;
  }
  | {
    type: 'block';
    payload: BlockData;
  }
);

export type DecoderListener = (
  | {
    type: 'statechange';
    handler: (payload: DecoderState) => void;
  }
  | {
    type: 'quantum';
    handler: (payload: Float32Array<ArrayBufferLike>) => void;
  }
  | {
    type: 'byte';
    handler: (payload: number) => void;
  }
  | {
    type: 'init';
    handler: () => void;
  }
  | {
    type: 'block';
    handler: (payload: BlockData) => void;
  }
);
