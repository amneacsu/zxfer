import './style.css';

const width = 40000;
const height = 1024;

const audioCtx = new AudioContext();
const audio = new Audio('Manic_Miner.wav');
const source = audioCtx.createMediaElementSource(audio);
const analyser = new AnalyserNode(audioCtx);
analyser.fftSize = 512;
analyser.smoothingTimeConstant = 0;

source.connect(analyser);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const drawContext = canvas.getContext('2d') as CanvasRenderingContext2D;

let x = 0;

const tick2 = () => {
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  drawContext.beginPath();

  for (let i = 0; i < data.length; i++) {
    const y = height / 2 + data[i] * 1.5 * height;

    if (i === 0) drawContext.moveTo(x, y);
    else drawContext.lineTo(x, y);

    x += 4;
  }
  drawContext.strokeStyle = '#FFF';
  drawContext.stroke();

  drawContext.beginPath();
  drawContext.moveTo(x, 0);
  drawContext.lineTo(x, height);
  drawContext.strokeStyle = '#0F0';
  drawContext.stroke();
};

console.log('audioCtx.sampleRate', audioCtx.sampleRate);
console.log('audioCtx.outputLatency', audioCtx.outputLatency);
console.log('audioCtx.baseLatency', audioCtx.baseLatency);
console.log('analyser.fftSize', analyser.fftSize);
const interval = analyser.fftSize / audioCtx.sampleRate * 1000;
console.log('interval', interval);

// let last = 0;

const tick = () => {
  drawContext.beginPath();
  tick2();
  // console.log(audioCtx.currentTime - last);
  // last = audioCtx.currentTime % interval;
  setTimeout(tick, interval);
};

audio.addEventListener('loadeddata', () => {
  audio.currentTime = audio.duration / 2;
  audio.play();
  tick();
});
