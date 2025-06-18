export enum DecoderState {
  WAITLEAD = 'WAITLEAD',
  LEAD = 'LEAD',
  PROG = 'PROG',
}

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
    type: 'reset';
    payload?: never;
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
    type: 'reset';
    handler: () => void;
  }
);
