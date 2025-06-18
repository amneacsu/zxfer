import { AudioWorkletUrl } from 'audio-worklet';

import { DecoderListener, DecoderMessage, DecoderState } from './types.ts';

interface ZxLoaderOptions {
  audio: HTMLAudioElement
}

export class ZxLoader {
  audio: HTMLAudioElement;
  audioCtx: AudioContext;
  state = DecoderState.WAITPILOT;
  listeners: DecoderListener[] = [];
  decoder?: AudioWorkletNode;

  constructor(opts: ZxLoaderOptions) {
    this.audio = opts.audio;
    this.audioCtx = new AudioContext();
  }

  reset() {
    this.setState(DecoderState.WAITPILOT);
    this.decoder?.port.postMessage('reset');
  }

  setState(newState: DecoderState) {
    this.state = newState;
    this.emit({ type: 'statechange', payload: this.state });
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
        case 'byte':
          if (listener.type === 'byte') listener.handler(event.payload);
          break;
        case 'quantum':
          if (listener.type === 'quantum') listener.handler(event.payload);
          break;
        case 'statechange':
          if (listener.type === 'statechange') listener.handler(event.payload);
          break;
        case 'init':
          if (listener.type === 'init') listener.handler();
          break;
        case 'block':
          if (listener.type === 'block') listener.handler(event.payload);
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

  onByte(handler: (bit: number) => void) {
    this.listen({ type: 'byte', handler });
  }

  onInit(handler: () => void) {
    this.listen({ type: 'init', handler });
  }

  onBlock(handler: (block: number[]) => void) {
    this.listen({ type: 'block', handler });
  }

  async init() {
    await this.audioCtx.audioWorklet.addModule(
      new AudioWorkletUrl(new URL('./decoder.ts', import.meta.url)) as string,
    );
    this.decoder = new AudioWorkletNode(this.audioCtx, 'decoder');
    this.decoder.port.onmessage = (event: MessageEvent<DecoderMessage>) => {
      this.emit(event.data);
    };
    const source = this.audioCtx.createMediaElementSource(this.audio);
    source.connect(this.decoder);
    source.connect(this.audioCtx.destination);

    // this.audio.addEventListener('ended', () => {
    //   decoder.port.close();
    // });

    this.audio.addEventListener('play', () => {
      this.audioCtx.resume();
    });

    this.emit({ type: 'init' });
  };
};
