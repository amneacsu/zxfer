import { DecoderState } from './types.ts';
import { polarity } from './utils/polarity.ts';
import { nearest, samplesToStates, PULSE } from './utils/pulse.ts';

class EdgeDecoder extends AudioWorkletProcessor {
  polarity = 0;
  state = 'WAITPILOT';
  syncPulse1 = false;
  syncPulse2 = false;
  bitBuffer: (1 | 0)[] = [];
  byteBuffer: number[] = [];
  tStates = 0;
  bitPulses: number[] = [];
  dataLength = 0;
  speed = 1;

  constructor() {
    super();

    console.log(`Sample rate: ${sampleRate}.`);

    this.port.start();

    this.port.addEventListener('message', (event) => {
      if (event.data === 'reset') this.reset();
    });
  }

  reset() {
    this.bitBuffer = [];
    this.byteBuffer = [];
    this.tStates = 0;
    this.syncPulse1 = false;
    this.syncPulse2 = false;
    this.state = 'WAITPILOT';
    this.polarity = 0;
    this.bitPulses = [];
    this.dataLength = 0;
  }

  setState(newState: DecoderState) {
    if (this.state !== newState) {
      console.log('statechange', newState);
      this.port.postMessage({
        type: 'statechange',
        payload: newState,
      });
    }

    this.state = newState;
  }

  pushBit(bit: 0 | 1) {
    this.bitBuffer.push(bit);

    if (this.bitBuffer.length === 8) {
      this.pushByte();
      this.bitBuffer = [];
    }
  }

  check(data: number[], checksum: number) {
    const c = data.reduce((acc, byte, index) => {
      if (index === 0) return byte;

      return acc ^ byte;
    }, 0);

    return c === checksum;
  }

  pushBlock() {
    const checksum = this.byteBuffer.at(-1);
    if (checksum === undefined) throw new Error('No checksum.');
    const data = this.byteBuffer.slice(0, -1);
    if (!this.check(data, checksum)) {
      console.error('Checksum error.');
      // throw new Error('Checksum error.');
    }

    this.port.postMessage({
      type: 'block',
      payload: data,
    });

    this.byteBuffer = [];
    this.setState('WAITPILOT');
  }

  pushByte() {
    const byte = parseInt(this.bitBuffer.join(''), 2);
    this.byteBuffer.push(byte);

    this.port.postMessage({
      type: 'byte',
      payload: byte,
    });

    const [marker, ...data] = this.byteBuffer;
    switch (marker) {
      case 0x00:
        if (data.length < 18) break;
        this.dataLength = (data[12] << 8) | data[11];
        this.pushBlock();
        break;
      case 0xFF:
        if (data.length < this.dataLength + 1) break;
        this.pushBlock();
        break;
      default:
        break;
    }
  }

  pushPulse = (tStates: number) => {
    this.bitPulses.push(tStates);
    if (this.bitPulses.length < 2) return;

    const [p1, p2] = this.bitPulses;
    if (p1 !== p2) {
      console.error(`Mixed bit pulses ${JSON.stringify(this.bitPulses)}.`);
    }
    const bit = (p1 + p2) === PULSE.BIT_0 * this.speed * 2 ? 0 : 1;
    this.pushBit(bit);
    this.bitPulses = [];
  };

  handlePulse() {
    const states = samplesToStates(this.tStates);

    const pulse = nearest(this.state, states, this.speed);

    if (!pulse) {
      return;
    }

    if (pulse === PULSE.PILOT * this.speed) {
      if (this.state === 'PROG') {
        const diff = states - pulse;
        console.log({
          statesRaw: states,
          statesNormalized: pulse,
          diff,
          polarity: this.polarity,
        });
      }

      this.setState('PILOT');
      this.syncPulse1 = false;
      this.syncPulse2 = false;
      return;
    }

    if (!this.syncPulse1) {
      console.log(`Sync pulse 1 at ${pulse} T-states (normalized) - ${states} detected`);
      this.syncPulse1 = true;
      return;
    }

    if (!this.syncPulse2) {
      console.log(`Sync pulse 2 at ${pulse} T-states (normalized) - ${states} detected`);
      this.syncPulse2 = true;
      this.setState('PROG');
      return;
    }

    if (this.state !== 'PROG') {
      console.error('Was not expecting bit pulse outside of PROG state.');
    }

    this.pushPulse(pulse);
  }

  process(inputs: Float32Array[][]) {
    const input = inputs.at(0);
    const samples = input?.at(0);
    if (!samples) return false;

    this.port.postMessage({ type: 'quantum', payload: samples });

    samples.forEach((sample) => {
      const samplePolarity = polarity(sample);
      if (samplePolarity === 0) return;

      const isEdge = Math.abs(this.polarity - samplePolarity) === 2;

      if (isEdge) {
        this.handlePulse();
        this.tStates = 0;
      }

      this.polarity = samplePolarity;
      this.tStates += 1;
    });

    return true;
  }
}

registerProcessor('EdgeDecoder', EdgeDecoder as any);
