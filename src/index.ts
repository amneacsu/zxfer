import './style.css';
import { AudioWorkletUrl } from 'audio-worklet';

const width = 40000;
const height = 256;

const audioCtx = new AudioContext();

await audioCtx.audioWorklet.addModule(
  new AudioWorkletUrl(new URL('./decoder.js', import.meta.url)) as string,
);

const decoder = new AudioWorkletNode(audioCtx, 'decoder');
// const audio = new Audio('Manic_Miner.wav');
const audio = new Audio('1.wav');
const source = audioCtx.createMediaElementSource(audio);

source.connect(decoder);
// source.connect(audioCtx.destination);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const drawContext = canvas.getContext('2d') as CanvasRenderingContext2D;

let horizontalStep = 5;

const renderQuantums: Float32Array[] = [];
const edges: number[] = [];

// Draw render quantum
decoder.port.onmessage = (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'quantum': {
      renderQuantums.push(payload);
      break;
    }
    case 'edge':
      edges.push(payload);
      break;
  }
};

const clear = () => {
  drawContext.clearRect(0, 0, width, height);
};

const drawVerticalLine = (x: number, color: string) => {
  drawContext.beginPath();
  drawContext.strokeStyle = color;
  drawContext.moveTo(x, 0);
  drawContext.lineTo(x, height);
  drawContext.stroke();
};

const drawGrid = () => {
  drawContext.beginPath();
  drawContext.strokeStyle = '#777';
  drawContext.moveTo(0, height / 2);
  drawContext.lineTo(width, height / 2);
  drawContext.stroke();
};

const drawEdges = () => {
  edges.forEach((edge) => {
    drawVerticalLine(edge * horizontalStep, '#00f');
  });
};

const drawSamples = () => {
  drawContext.strokeStyle = '#0f0';
  drawContext.beginPath();
  let x = 0;

  renderQuantums.forEach((samples) => {
    samples.forEach((sample) => {
      const y = height / 2 - sample * height / 2;
      drawContext.lineTo(x, y);
      x += horizontalStep;
    });
  });

  drawContext.stroke();
};

const tick = () => {
  clear();
  drawGrid();
  drawEdges();
  drawSamples();
};

// Wait for audio data
audio.addEventListener('loadeddata', () => {
  audio.currentTime = audio.duration / 2 + .33;
  audio.play();
  setInterval(tick, 200);
});

document.querySelector('#scale').addEventListener('input', (event: Event) => {
  const target = event.target as HTMLInputElement;
  horizontalStep = target.valueAsNumber;
  tick();
});
