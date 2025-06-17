export class OscilloscopeRenderer {
  zoom = .5;
  drawContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(element: HTMLCanvasElement) {
    this.canvas = element;
    this.drawContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.canvas.addEventListener('mousewheel', this.handleZoom);
  }

  handleZoom = (event: Event) => {
    const step = 100;
    const nextZoom = this.zoom - (event as WheelEvent).deltaY / step;
    this.zoom = Math.min(Math.max(nextZoom, 0.1), 4);
  };

  clear = () => {
    this.drawContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  drawGrid = () => {
    this.drawContext.beginPath();
    this.drawContext.strokeStyle = '#777';
    this.drawContext.moveTo(0, this.canvas.height / 2);
    this.drawContext.lineTo(this.canvas.width, this.canvas.height / 2);
    this.drawContext.stroke();
  };

  drawSamples = (renderQuantum: Float32Array) => {
    if (!renderQuantum) return;
    this.drawContext.strokeStyle = '#0f0';
    this.drawContext.lineWidth = 4;
    this.drawContext.beginPath();
    let x = 0;
    const distanceBetweenSamples = this.canvas.width / renderQuantum.length * 2;

    renderQuantum.forEach((sample) => {
      const y = this.canvas.height / 2 - sample * this.canvas.height / 2;
      this.drawContext.lineTo(x, y);
      x += distanceBetweenSamples * this.zoom;
    });

    this.drawContext.stroke();
  };
}
