const audioCtx = new AudioContext();

const audio = new Audio('Manic_Miner.wav');
const source = audioCtx.createMediaElementSource(audio);
const analyser = new AnalyserNode(audioCtx);
const gainNode = audioCtx.createGain();
gainNode.gain.value = 0;

source.connect(analyser);
gainNode.connect(audioCtx.destination);
analyser.connect(gainNode);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 1000;
canvas.height = 255;
const drawContext = canvas.getContext('2d') as CanvasRenderingContext2D;

const width = canvas.width;
const height = canvas.height;
const frequencyBinCount = analyser.frequencyBinCount;

const tick2 = () => {
  const data = new Uint8Array(frequencyBinCount);
  analyser.getByteTimeDomainData(data);
  let x = 0;

  for (let i = 0; i < frequencyBinCount; i++) {
    const v = data[i] / 128.0;
    const y = v * height / 2;

    if (i === 0) drawContext.moveTo(x, y);
    else drawContext.lineTo(x, y);

    x += 1;
  }

  drawContext.lineTo(width, height / 2);
};

const tick = () => {
  drawContext.clearRect(0, 0, canvas.width, canvas.height);
  drawContext.beginPath();
  tick2();
  drawContext.stroke();
  window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);
audio.play();
