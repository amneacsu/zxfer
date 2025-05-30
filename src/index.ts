import './style.css';
import { AudioWorkletUrl } from 'audio-worklet';

import { Oscilloscope } from './oscilloscope';
import wav from './data/Jetpac.wav';

document.getElementById('play').addEventListener('click', async () => {
  const audioCtx = new AudioContext();

  await audioCtx.audioWorklet.addModule(
    new AudioWorkletUrl(new URL('./decoder.ts', import.meta.url)) as string,
  );

  const decoder = new AudioWorkletNode(audioCtx, 'decoder');
  // const audio = new Audio('Manic_Miner.wav');

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

    document.getElementById('debug').innerHTML = `
render quantums: ${renderQuantums.length}
edges: ${edges.length}
`;
  };

  const viewer = new Oscilloscope();

  const tick = () => {
    viewer.clear();
    viewer.drawGrid();
    viewer.drawEdges(edges);
    viewer.drawSamples(renderQuantums);
  };

  const audio = new Audio(wav);
  audio.controls = true;
  document.body.appendChild(audio);
  const source = audioCtx.createMediaElementSource(audio);

  source.connect(decoder);
  // source.connect(audioCtx.destination);

  audio.addEventListener('loadeddata', () => {
    audio.currentTime = audio.duration / 2 + .33;
    audio.play();
    setInterval(tick, 1000 / 60);
  });

  audio.addEventListener('ended', () => {
    decoder.port.close();
  });
});
