import { DecoderState } from './types.ts';

const polarity = (value: number) => {
  const threshold = 0.01;

  if (value > threshold) return 1;
  else if (value < -threshold) return -1;
  else return 0;
};

class Decoder extends AudioWorkletProcessor {
  polarity = -1;
  state = DecoderState.WAITLEAD;
  syncPulse1 = false;
  syncPulse2 = false;
  bitBuffer: (1 | 0)[] = [];
  byteBuffer: number[] = [];
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
    this.lowStates = 0;
    this.highStates = 0;
    this.syncPulse1 = false;
    this.syncPulse2 = false;
    this.state = DecoderState.WAITLEAD;
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
    this.port.postMessage({ type: 'quantum', payload: inputs[0][0] });
    const input = inputs[0];
    const samples = input[0];

    samples.forEach((sample) => {
      const samplePolarity = polarity(sample);

      if (samplePolarity === this.polarity) {
        switch (samplePolarity) {
          case 1: this.highStates += 1; break;
          case -1: this.lowStates += 1; break;
          case 0: break;
        }
      } else {
        if (this.lowStates > 0 && this.highStates > 0) {
          const states = this.lowStates + this.highStates;

          switch (this.state) {
            case DecoderState.WAITLEAD:
              if (states > 50) {
                this.setState(DecoderState.LEAD);
                this.syncPulse1 = false;
                this.syncPulse2 = false;
              }
              break;
            case DecoderState.LEAD:
              if (states < 40) {
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
                  this.setState(DecoderState.PROG);
                  break;
                }
                console.warn('Received 3rd sync pulse in lead phase');
              }
              break;
            case DecoderState.PROG:
              if (states > 2500) {
                this.port.postMessage({
                  type: 'block',
                  payload: this.byteBuffer,
                });
                this.byteBuffer = [];
                this.setState(DecoderState.WAITLEAD);
                break;
              }

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

          this.lowStates = 0;
          this.highStates = 0;
        }
        this.polarity = samplePolarity;
      }
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
