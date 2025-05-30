import './style.css';
import { AudioWorkletUrl } from 'audio-worklet';

import { Oscilloscope } from './oscilloscope';
import wav from './data/Manic_Miner.wav';
import { DecoderState } from './types';
// import wav from './data/Jetpac.wav';

document.getElementById('play').addEventListener('click', async () => {
  const audioCtx = new AudioContext();

  await audioCtx.audioWorklet.addModule(
    new AudioWorkletUrl(new URL('./decoder.ts', import.meta.url)) as string,
  );

  const decoder = new AudioWorkletNode(audioCtx, 'decoder');
  // const audio = new Audio('Manic_Miner.wav');

  const polarities: { count: number; polarity: -1 | 1 }[] = [];
  const renderQuantums: Float32Array[] = [];
  const edges: number[] = [];
  let state: DecoderState = DecoderState.WAITLEAD;
  const bits: number[] = [];

  // Draw render quantum
  decoder.port.onmessage = (event) => {
    const { type, payload } = event.data;

    switch (type) {
      case 'newState':
        state = payload;
        break;
      case 'bit':
        bits.push(payload);
        break;
      case 'quantum': {
        renderQuantums.push(payload);
        break;
      }
      case 'polarity': {
        polarities.push(payload);
        break;
      }
      case 'edge':
        edges.push(payload);
        break;
    }

    const bytes = [];
    for (let i = 0; i < bits.length / 8; i += 1) {
      const x = bits.slice(i * 8, i * 8 + 8).join('');
      bytes.push(parseInt(x, 2));
    }

    document.getElementById('debug').innerHTML = `
render quantums: ${renderQuantums.length}
polarities: ${polarities.length}
edges: ${edges.length}
decoder state: ${state}
bits: ${bits.join('')}
`;

    // console.log(edges.map((edge, index) => {
    //   if (index === 0) return edge;
    //   return edge - edges[index - 1];
    // }));
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
  source.connect(audioCtx.destination);

  audio.addEventListener('loadeddata', () => {
    audio.currentTime = 4.9;
    audio.play();
    setInterval(tick, 1000 / 60);
  });

  audio.addEventListener('ended', () => {
    decoder.port.close();
  });
});
