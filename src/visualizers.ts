/*

// ??
const tick1 = () => {
  const sampleSize = 512;
  const data = new Uint8Array(sampleSize);
  analyser.getByteTimeDomainData(data);

  for (let i = 0; i < data.length; i += 1) {
    drawContext.moveTo(i, 255);
    drawContext.lineTo(i, data[i]);
  }
};

// spectrogram
const tick3 = () => {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const wx = Math.log(data.length / 1);

  for (let n = 0; n < data.length; n++) {
    const x = Math.log(n) / wx * width;
    const y = data[n] * height / 256;
    drawContext.lineTo(x, height - y);
  }
};

*/
