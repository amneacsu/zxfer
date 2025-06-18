import { AudioWorkletUrl } from 'audio-worklet';

import { DecoderListener, DecoderMessage, DecoderState } from './types.ts';

interface ZxLoaderOptions {
  audio: HTMLAudioElement
}

export class ZxLoader {
  audio: HTMLAudioElement;
  state = DecoderState.WAITLEAD;
  listeners: DecoderListener[] = [];

  constructor(opts: ZxLoaderOptions) {
    this.audio = opts.audio;
  }

  reset() {
    this.state = DecoderState.WAITLEAD;
    this.emit({ type: 'reset' });
  }

  private listen(listener: DecoderListener) {
    this.listeners.push(listener);
    return () => {
      // Remove the listener
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    };
  }

  private emit(event: DecoderMessage) {
    this.listeners.forEach((listener) => {
      switch (event.type) {
        case 'bit':
          if (listener.type === 'bit') listener.handler(event.payload);
          break;
        case 'quantum':
          if (listener.type === 'quantum') listener.handler(event.payload);
          break;
        case 'statechange':
          if (listener.type === 'statechange') listener.handler(event.payload);
          break;
      }
    });
  }

  onStateChange(handler: (newState: DecoderState) => void) {
    this.listen({ type: 'statechange', handler });
  }

  onQuantum(handler: (quantum: Float32Array<ArrayBufferLike>) => void) {
    this.listen({ type: 'quantum', handler });
  }

  onBit(handler: (bit: 1 | 0) => void) {
    this.listen({ type: 'bit', handler });
  }

  onReset(handler: () => void) {
    this.listen({ type: 'reset', handler });
  }

  async main() {
    const audioCtx = new AudioContext();
    await audioCtx.audioWorklet.addModule(
      new AudioWorkletUrl(new URL('./decoder.ts', import.meta.url)) as string,
    );

    const decoder = new AudioWorkletNode(audioCtx, 'decoder');

    decoder.port.onmessage = (event: MessageEvent<DecoderMessage>) => {
      this.emit(event.data);
    };

    const source = audioCtx.createMediaElementSource(this.audio);
    source.connect(decoder);
    // source.connect(audioCtx.destination);

    this.audio.addEventListener('ended', () => {
      decoder.port.close();
    });

    this.audio.addEventListener('play', () => {
      audioCtx.resume();
    });
  };
};
