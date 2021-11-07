const width = 40000;
const height = 256;

let horizontalStep = 5;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const drawContext = canvas.getContext('2d') as CanvasRenderingContext2D;

export const clear = () => {
  drawContext.clearRect(0, 0, width, height);
};

const drawVerticalLine = (x: number, color: string) => {
  drawContext.beginPath();
  drawContext.strokeStyle = color;
  drawContext.moveTo(x, 0);
  drawContext.lineTo(x, height);
  drawContext.stroke();
};

export const drawGrid = () => {
  drawContext.beginPath();
  drawContext.strokeStyle = '#777';
  drawContext.moveTo(0, height / 2);
  drawContext.lineTo(width, height / 2);
  drawContext.stroke();
};

export const drawEdges = (edges: number[]) => {
  edges.forEach((edge) => {
    drawVerticalLine(edge * horizontalStep, '#00f');
  });
};

export const drawSamples = (renderQuantums: Float32Array[]) => {
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

document.querySelector('#scale').addEventListener('input', (event: Event) => {
  const target = event.target as HTMLInputElement;
  horizontalStep = target.valueAsNumber;
});
