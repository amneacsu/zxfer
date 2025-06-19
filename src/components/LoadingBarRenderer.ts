import { polarity } from '../utils/polarity.ts';
import { Renderer } from './Renderer.ts';

export class LoadingBarRenderer extends Renderer {
  constructor(element: HTMLCanvasElement) {
    super(element);
  }

  clear() {}

  y = 0;

  drawSamples(renderQuantum: Float32Array) {
    renderQuantum.forEach((sample) => {
      const h = 1;
      this.y += h;
      this.drawContext.fillStyle = polarity(sample) > 0 ? '#ff0' : '#00f';
      this.drawContext.fillRect(0, this.y % this.canvas.height, this.canvas.width, h);
    });
  }
}
