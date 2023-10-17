import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Creative Canvas";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvasSize = 256;
const origin = 0;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
app.append(canvas);
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

ctx.fillStyle = "white";
ctx.fillRect(origin, origin, canvasSize, canvasSize);

const drawingChanged = new Event("drawing-changed");

interface Point {
  x: number;
  y: number;
}
let points: Point[][] = [];

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("drawing-changed", () => {
  updateCanvas();
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  points.push([]);
  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    const offset = 1;
    const currentPoint: Point = { x: cursor.x, y: cursor.y };
    points[points.length - offset].push(currentPoint);
  }
  canvas.dispatchEvent(drawingChanged);
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

function updateCanvas() {
  ctx.clearRect(origin, origin, canvasSize, canvasSize);
  ctx.fillRect(origin, origin, canvasSize, canvasSize);

  if (points) {
    points.forEach((item) => {
      ctx.beginPath();
      const [first, ...otherPoints]: Point[] = item;
      if (first) {
        ctx.moveTo(first.x, first.y);
      }
      for (const { x, y } of otherPoints) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }
}

clearButton.addEventListener("click", () => {
  points = [];
  canvas.dispatchEvent(drawingChanged);
});
