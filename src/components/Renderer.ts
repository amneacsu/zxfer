export class Renderer {
  drawContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(element: HTMLCanvasElement) {
    this.canvas = element;
    this.drawContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }
}
