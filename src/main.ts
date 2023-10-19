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

const commands = [];
const redoCommands = [];

let cursorCommand = null;
let currentLineCommand = null;

const drawingChanged = new Event("drawing-changed");
const cursorChanged = new Event("cursor-changed");

canvas.addEventListener("drawing-changed", updateCanvas);
canvas.addEventListener("cursor-changed", updateCanvas);

class LineCommand {
  constructor(x, y) {
    this.points = [{ x, y }];
  }
  display(ctx) {
    // ctx.strokeStyle = "black";
    // ctx.lineWidth = 4;
    ctx.beginPath();
    const { x, y } = this.points[origin];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grow(x, y) {
    this.points.push({ x, y });
  }
}

class CursorCommand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  display(ctx) {
    const offsetX = 8;
    const offsetY = 16;
    ctx.font = "32px monospace";
    ctx.fillText("", this.x - offsetX, this.y + offsetY);
  }
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

// detect when mouse clicks on canvas
canvas.addEventListener("mousedown", (cursor) => {
  currentLineCommand = new LineCommand(cursor.offsetX, cursor.offsetY);
  commands.push(currentLineCommand);
  redoCommands.splice(origin, redoCommands.length);
  canvas.dispatchEvent(drawingChanged);
});

// detect when mouse moves on canvas, and watch for click to draw
canvas.addEventListener("mousemove", (cursor) => {
  const leftMouseButton = 1;
  cursorCommand = new CursorCommand(cursor.offsetX, cursor.offsetY);
  canvas.dispatchEvent(cursorChanged);

  if (cursor.buttons == leftMouseButton) {
    currentLineCommand.points.push({ x: cursor.offsetX, y: cursor.offsetY });
    canvas.dispatchEvent(drawingChanged);
  }
});

// detect when click on canvas ends to stop drawing
canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  canvas.dispatchEvent(drawingChanged);
});

// detect when mouse leaves canvas bounds
canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  canvas.dispatchEvent(cursorChanged);
});

function updateCanvas() {
  ctx.clearRect(origin, origin, canvasSize, canvasSize);
  ctx.fillStyle = "white";
  ctx.fillRect(origin, origin, canvasSize, canvasSize);

  commands.forEach((cmd) => cmd.display(ctx));

  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
}

clearButton.addEventListener("click", () => {
  commands.splice(origin, commands.length);
  canvas.dispatchEvent(drawingChanged);
});

undoButton.addEventListener("click", () => {
  if (commands.length) {
    const undoPoint = commands.pop()!;
    redoCommands.push(undoPoint);
    canvas.dispatchEvent(drawingChanged);
  }
});

redoButton.addEventListener("click", () => {
  if (redoCommands.length) {
    const redoPoint = redoCommands.pop()!;
    commands.push(redoPoint);
    canvas.dispatchEvent(drawingChanged);
  }
});

function tick() {
  updateCanvas();
  requestAnimationFrame(tick);
}
tick();
