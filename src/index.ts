import './style.css';
import { AudioWorkletUrl } from 'audio-worklet';

const width = 40000;
const height = 1024;

const audioCtx = new AudioContext();

await audioCtx.audioWorklet.addModule(
  new AudioWorkletUrl(
    new URL(
      './noise-generator.js',
      import.meta.url,
    ),
  ) as string,
);

const noiseGenerator = new AudioWorkletNode(audioCtx, 'noise-generator');
// noiseGenerator.connect(audioCtx.destination);

const audio = new Audio('Manic_Miner.wav');
const source = audioCtx.createMediaElementSource(audio);
const analyser = new AnalyserNode(audioCtx);
// analyser.fftSize = 512;
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
  // drawContext.beginPath();

  for (let i = 0; i < data.length; i++) {
    const y = height / 2 + data[i] * 1.5 * height;

    // if (i === 0) drawContext.moveTo(x, y);
    // else drawContext.lineTo(x, y);
    drawContext.lineTo(x, y);

    x += 4;
  }
  // drawContext.strokeStyle = '#FFF';
  // drawContext.stroke();

  // drawContext.beginPath();
  // drawContext.moveTo(x, 0);
  // drawContext.lineTo(x, height);
  // drawContext.strokeStyle = '#0F0';
  // drawContext.stroke();
};

console.log('audioCtx.sampleRate', audioCtx.sampleRate);
console.log('audioCtx.outputLatency', audioCtx.outputLatency);
console.log('audioCtx.baseLatency', audioCtx.baseLatency);
console.log('analyser.fftSize', analyser.fftSize);
const interval = analyser.fftSize / audioCtx.sampleRate * 1000;
console.log('interval', interval);

// let last = 0;

const colors = ['#f00', '#0f0', '#00f'];
let i = 0;
const tick = () => {
  drawContext.strokeStyle = colors[i % colors.length];
  drawContext.beginPath();
  tick2();
  drawContext.stroke();
  // console.log(audioCtx.currentTime - last);
  // last = audioCtx.currentTime % interval;
  i+=1;
  setTimeout(tick, interval);
};

audio.addEventListener('loadeddata', () => {
  audio.currentTime = audio.duration / 2;
  audio.play();
  tick();
});
