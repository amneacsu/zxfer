export class OscilloscopeRenderer {
  drawContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(element: HTMLCanvasElement) {
    this.canvas = element;
    this.drawContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.drawContext.lineWidth = 4;
    this.drawContext.shadowColor = '#0f0';
  }

  clear() {
    this.drawContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    this.drawContext.shadowBlur = 0;
    this.drawContext.beginPath();
    this.drawContext.strokeStyle = '#777';
    this.drawContext.moveTo(0, this.canvas.height / 2);
    this.drawContext.lineTo(this.canvas.width, this.canvas.height / 2);
    this.drawContext.stroke();
  }

  drawSamples(renderQuantum: Float32Array) {
    this.drawContext.shadowBlur = 10;
    this.drawContext.strokeStyle = '#0f0';
    this.drawContext.beginPath();
    let x = 0;
    const halfHeight = this.canvas.height / 2;
    const distanceBetweenSamples = this.canvas.width / renderQuantum.length;

    renderQuantum.forEach((sample) => {
      const y = halfHeight - sample * halfHeight;
      this.drawContext.lineTo(x, y);
      x += distanceBetweenSamples;
    });

    this.drawContext.stroke();
  }
}
