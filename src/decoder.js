const polarity = (value) => {
  const threshold = 0.01;

  if (value > threshold) return 1;
  else if (value < -threshold) return -1;
  else return 0;
};

// Detect "zero crossing points"
const isEdge = (() => {
  let last;
  return (sample) => {
    if (Math.abs(sample) < 0.085) return false;
    const x = polarity(sample) !== polarity(last ?? sample);
    last = sample;
    return x;
  };
})();

class NoiseGenerator extends AudioWorkletProcessor {
  index = 0;

  process(inputs) {
    this.port.postMessage({ type: 'quantum', payload: inputs[0][0] });
    const input = inputs[0];
    const samples = input[0];
    // console.group('process');
    this.window1(samples);
    // console.groupEnd();
    return this.index < 10000;
  }

  window1(samples) {
    samples.forEach((sample, i) => {
      if (isEdge(sample)) {
        this.port.postMessage({ type: 'edge', payload: this.index + i });
      }
    });

    this.index += samples.length;
  }
}

registerProcessor('decoder', NoiseGenerator);
