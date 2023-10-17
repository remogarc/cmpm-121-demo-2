import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Creative Canvas";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvasSize = 256;
const origin = 0;

const div = document.createElement("div");
app.append(div);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
div.append(canvas);
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

ctx.fillStyle = "white";
ctx.fillRect(origin, origin, canvasSize, canvasSize);

const drawingChanged = new Event("drawing-changed");

interface Point {
  x: number;
  y: number;
}
let points: Point[][] = [];
let undoredoPoints: Point[][] = [];
undoredoPoints = [];

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
    points.forEach((point) => {
      ctx.beginPath();
      const [first, ...otherPoints]: Point[] = point;
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
  undoredoPoints = [];
  canvas.dispatchEvent(drawingChanged);
});

undoButton.addEventListener("click", () => {
  if (points.length) {
    const undoPoint = points.pop()!;
    undoredoPoints.push(undoPoint);
    canvas.dispatchEvent(drawingChanged);
  }
});

redoButton.addEventListener("click", () => {
  if (undoredoPoints.length) {
    const redoPoint = undoredoPoints.pop()!;
    points.push(redoPoint);
    canvas.dispatchEvent(drawingChanged);
  }
});
