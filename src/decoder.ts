import { DecoderState } from './types.ts';
import { polarity } from './utils/polarity.ts';

class Decoder extends AudioWorkletProcessor {
  polarity = -1;
  state = 'WAITPILOT';
  syncPulse1 = false;
  syncPulse2 = false;
  bitBuffer: (1 | 0)[] = [];
  byteBuffer: number[] = [];
  states = 0;
  highStates = 0;
  lowStates = 0;

  constructor() {
    super();

    this.port.start();

    this.port.addEventListener('message', (event) => {
      if (event.data === 'reset') this.reset();
    });
  }

  reset() {
    this.bitBuffer = [];
    this.byteBuffer = [];
    this.states = 0;
    this.lowStates = 0;
    this.highStates = 0;
    this.syncPulse1 = false;
    this.syncPulse2 = false;
    this.state = 'WAITPILOT';
    this.polarity = -1;
  }

  setState(newState: DecoderState) {
    console.log('statechange', newState);

    if (this.state !== newState) {
      this.port.postMessage({
        type: 'statechange',
        payload: newState,
      });
    }

    this.state = newState;
  }

  process(inputs: Float32Array[][]) {
    const input = inputs.at(0);
    const samples = input?.at(0);
    if (!samples) return false;

    this.port.postMessage({ type: 'quantum', payload: samples });

    samples.forEach((sample) => {
      const samplePolarity = polarity(sample);

      if (samplePolarity === this.polarity) {
        switch (samplePolarity) {
          case 1: this.highStates += 1; break;
          case -1: this.lowStates += 1; break;
          case 0: this.states += 1; break;
        }
      }

      const states = this.lowStates + this.highStates;
      const fullBit = this.lowStates > 0 && this.highStates > 0 && samplePolarity !== this.polarity;

      switch (this.state) {
        case 'WAITPILOT':
          if (this.lowStates > 25 && this.highStates > 25) {
            this.setState('PILOT');
            this.syncPulse1 = false;
            this.syncPulse2 = false;
            this.port.postMessage({
              type: 'block',
              payload: this.byteBuffer,
            });
            this.byteBuffer = [];
          }
          break;
        case 'PILOT':
          if (fullBit && states < 40) {
            if (!this.syncPulse1) {
              console.log('heard 1st pulse');
              this.syncPulse1 = true;
              break;
            }
            if (!this.syncPulse2) {
              console.log('heard 2nd pulse');
              this.syncPulse2 = true;
              // for some reason the 2 sync pulses count as the first bit:
              this.bitBuffer.push(0);
              this.setState('PROG');
              break;
            }
            console.warn('Received 3rd sync pulse in PILOT phase');
          }
          break;
        case 'PROG':
          if (this.states > 100 || states > 100) {
            this.setState('WAITPILOT');
            break;
          }
          if (!fullBit) break;

          const bit = states < 25 ? 0 : 1;

          this.bitBuffer.push(bit);
          if (this.bitBuffer.length === 8) {
            const byte = parseInt(this.bitBuffer.join(''), 2);
            this.byteBuffer.push(byte);

            this.port.postMessage({
              type: 'byte',
              payload: byte,
            });
            this.bitBuffer = [];
          }
          break;
      }

      if (this.polarity !== samplePolarity && this.lowStates > 0 && this.highStates > 0) {
        this.lowStates = 0;
        this.highStates = 0;
        this.states = 0;
      }
      this.polarity = samplePolarity;
    });

    return true;
  }
}

registerProcessor('decoder', Decoder as any);

/*

12/24
A '0' bit is encoded as 2 pulses of 855 T-states each.
A '1' bit is encoded as 2 pulses of 1710 T-states each.
x71.25
44100 Hz
*/
