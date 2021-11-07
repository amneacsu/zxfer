export class Oscilloscope {
  zoom = .5;
  width = 1024;
  height = 256;
  drawContext: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = this.width;
    canvas.height = this.height;
    this.drawContext = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    
    canvas.addEventListener('mousewheel', this.handleZoom);
  }
  
  handleZoom = (event: WheelEvent) => {
    const step = 1000;
    const nextZoom = this.zoom - event.deltaY / step;
    this.zoom = Math.min(Math.max(nextZoom, 0.1), 1);
  };
  
  clear = () => {
    this.drawContext.clearRect(0, 0, this.width, this.height);
  };

  drawVerticalLine = (x: number, color: string) => {
    this.drawContext.beginPath();
    this.drawContext.strokeStyle = color;
    this.drawContext.moveTo(x, 0);
    this.drawContext.lineTo(x, this.height);
    this.drawContext.stroke();
  };

  drawGrid = () => {
    this.drawContext.beginPath();
    this.drawContext.strokeStyle = '#777';
    this.drawContext.moveTo(0, this.height / 2);
    this.drawContext.lineTo(this.width, this.height / 2);
    this.drawContext.stroke();
  };

  drawEdges = (edges: number[]) => {
    edges.forEach((edge) => {
      this.drawVerticalLine(edge * 2 * this.zoom, '#00f');
    });
  };

  drawSamples = (renderQuantums: Float32Array[]) => {
    this.drawContext.strokeStyle = '#0f0';
    this.drawContext.beginPath();
    let x = 0;

    renderQuantums.forEach((samples) => {
      samples.forEach((sample) => {
        const y = this.height / 2 - sample * this.height / 2;
        this.drawContext.lineTo(x, y);
        x += 2 * this.zoom;
      });
    });

    this.drawContext.stroke();
  };
}
