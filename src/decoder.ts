const polarity = (value: number) => {
  const threshold = 0.01;

  if (value > threshold) return 1;
  else if (value < -threshold) return -1;
  else return 0;
};

// Detect "zero crossing points"
const isEdge = (() => {
  let last: number;
  return (sample: number) => {
    if (Math.abs(sample) < 0.085) return false;
    const x = polarity(sample) !== polarity(last ?? sample);
    last = sample;
    return x;
  };
})();

class NoiseGenerator extends AudioWorkletProcessor {
  index = 0;
  
  constructor() {
    super();
  }

  process(inputs: Float32Array[][]) {
    this.port.postMessage({ type: 'quantum', payload: inputs[0][0] });
    const input = inputs[0];
    const samples = input[0];
    this.window1(samples);
    return this.index < 1024;
  }

  last = 0;

  window1(samples: Float32Array) {
    samples.forEach((sample, i) => {
      if (isEdge(sample)) {
        this.last = this.index + i;
        this.port.postMessage({ type: 'edge', payload: this.index + i });
      }
    });

    this.index += samples.length;
  }
}

registerProcessor('decoder', NoiseGenerator as any);
