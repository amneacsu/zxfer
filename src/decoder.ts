import { DecoderState } from './types.ts';

const polarity = (value: number) => {
  const threshold = 0.01;

  if (value > threshold) return 1;
  else if (value < -threshold) return -1;
  else return 0;
};

class Decoder extends AudioWorkletProcessor {
  index = 0;
  polarity = -1;
  count = 0;
  state = DecoderState.WAITLEAD;
  syncPulse1 = false;
  syncPulse2 = false;
  low = 0;
  high = 0;

  constructor() {
    super();
  }

  setState(newState: DecoderState) {
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

      if (samplePolarity !== this.polarity) {
        if (this.polarity !== 0 && this.count > 0) {
          if (this.count > 28) {
            this.setState(DecoderState.LEAD);
            this.syncPulse1 = false;
            this.syncPulse2 = false;
          }

          switch (this.state) {
            case DecoderState.WAITLEAD:
              if (this.count > 28) {
                this.setState(DecoderState.LEAD);
                this.syncPulse1 = false;
                this.syncPulse2 = false;
              }
              break;
            case DecoderState.LEAD:
              if (this.count < 20) {
                if (!this.syncPulse1) {
                  this.syncPulse1 = true;
                  break;
                }
                if (!this.syncPulse2) {
                  this.syncPulse2 = true;
                  this.setState(DecoderState.PROG);
                  break;
                }
                console.warn('Received 3rd sync pulse in lead phase');
              }
              break;
            case DecoderState.PROG:
              if (this.count < 15) {
                this.low += 1;
              } else {
                this.high += 1;
              }
              if (this.low === 2 || this.high === 2) {
                this.port.postMessage({
                  type: 'bit',
                  payload: this.low === 2 ? 0 : 1,
                });
                this.low = 0;
                this.high = 0;
              }
              break;
          }
        }

        // reset
        this.polarity = samplePolarity;
        this.count = 1;
      } else {
        this.count += 1;
      }
    });

    this.index += samples.length;

    // return this.index < 24096;
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
