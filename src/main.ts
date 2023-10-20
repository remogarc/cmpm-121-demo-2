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

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];

let toolCommand: ToolCommand | null = null;
let currentLineCommand: LineCommand | null = null;

const drawingChanged = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

canvas.addEventListener("drawing-changed", updateCanvas);
canvas.addEventListener("tool-moved", updateCanvas);

const thinMarker = 2;
const thickMarker = 8;
let currentMarker = 2;

class LineCommand {
  points: { x: number; y: number }[];
  marker: number = currentMarker;

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.marker;
    ctx.beginPath();
    const { x, y } = this.points[origin];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

class ToolCommand {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  display(ctx: CanvasRenderingContext2D) {
    if (currentMarker == thickMarker) {
      const thickX = 18;
      const thickY = 4;
      ctx.font = "64px monospace";
      ctx.fillText(".", this.x - thickX, this.y + thickY);
    } else {
      const thinX = 8;
      const thinY = 3;
      ctx.font = "32px monospace";
      ctx.fillText(".", this.x - thinX, this.y + thinY);
    }
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

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
app.append(thinButton);

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
app.append(thickButton);

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
  toolCommand = new ToolCommand(cursor.offsetX, cursor.offsetY);
  canvas.dispatchEvent(toolMoved);

  if (cursor.buttons == leftMouseButton) {
    if (currentLineCommand) {
      currentLineCommand.points.push({ x: cursor.offsetX, y: cursor.offsetY });
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

// detect when click on canvas ends to stop drawing
canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  canvas.dispatchEvent(drawingChanged);
});

// detect when mouse leaves canvas bounds
canvas.addEventListener("mouseout", () => {
  toolCommand = null;
  canvas.dispatchEvent(toolMoved);
});

canvas.addEventListener("mouseenter", (e) => {
  toolCommand = new ToolCommand(e.offsetX, e.offsetY);
  canvas.dispatchEvent(toolMoved);
});

function updateCanvas() {
  ctx.clearRect(origin, origin, canvasSize, canvasSize);
  ctx.fillStyle = "white";
  ctx.fillRect(origin, origin, canvasSize, canvasSize);
  ctx.fillStyle = "black";

  commands.forEach((cmd) => cmd.display(ctx));

  if (toolCommand) {
    toolCommand.display(ctx);
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

thinButton.addEventListener("click", () => {
  currentMarker = thinMarker;
});

thickButton.addEventListener("click", () => {
  currentMarker = thickMarker;
});

function tick() {
  updateCanvas();
  requestAnimationFrame(tick);
}
tick();
