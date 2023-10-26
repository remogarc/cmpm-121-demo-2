import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "🎨 Creative Canvas 🎨";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvasSize = 256;
const canvasSizeExport = 1024;
const origin = 0;

const div = document.createElement("div");
const div2 = document.createElement("div");
const div3 = document.createElement("div");
app.append(div);
app.append(div2);
app.append(div3);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
div.append(canvas);
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;

const commands: LineCommand[] = [];
const redoCommands: LineCommand[] = [];
const stickerList: string[] = [];
const redoStickers: string[] = [];
let stickerIndex = 0;

let toolCommand: ToolCommand | null = null;
let currentLineCommand: LineCommand | null = null;

const drawingChanged = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

canvas.addEventListener("drawing-changed", updateCanvas);
canvas.addEventListener("tool-moved", updateCanvas);

const thinMarker = 3;
const thickMarker = 10;
const stickerMarker = 0;
let currentSticker = "";
let currentMarker = 3;
const stickerFont = 40;
let strokeColor = randomColor();

class LineCommand {
  points: { x: number; y: number }[];
  marker: number = currentMarker;
  color: string = strokeColor;

  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.marker;
    ctx.beginPath();
    const { x, y } = this.points[origin];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    const offset = 1;
    if (stickerList.length) {
      if (this.points.length == offset && stickerList[stickerIndex]) {
        const offsetX = 26;
        const offsetY = 6;
        const { x, y } = this.points[origin];
        ctx.font = `${stickerFont}px monospace`;
        ctx.fillText(stickerList[stickerIndex], x - offsetX, y + offsetY);
      }
    }
  }
  grow(x: number, y: number) {
    this.points.push({ x, y });
  }
}

class ToolCommand {
  x: number;
  y: number;
  marker: number = currentMarker;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  display(ctx: CanvasRenderingContext2D) {
    if (currentMarker == stickerMarker) {
      const thinX = 26;
      const thinY = 6;
      ctx.font = `${stickerFont}px monospace`;
      ctx.fillText(currentSticker, this.x - thinX, this.y + thinY);
    } else {
      const startAngle = 0;
      const endAngle = 360;
      const resize = 2;
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.marker / resize, startAngle, endAngle);
      ctx.fill();
    }
  }
}

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
div2.append(clearButton);

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
div2.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
div2.append(redoButton);

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin";
div2.append(thinButton);

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick";
div2.append(thickButton);

const customButton = document.createElement("button");
customButton.innerHTML = `Custom</br>Sticker`;
app.append(customButton);

const exportButton = document.createElement("button");
exportButton.innerHTML = `Export</br>Canvas`;
app.append(exportButton);

interface Sticker {
  name: string;
  button: HTMLButtonElement;
}

const stickers: Sticker[] = [
  {
    name: "😛",
    button: document.createElement("button"),
  },
  {
    name: "🍓",
    button: document.createElement("button"),
  },
  {
    name: "🍕",
    button: document.createElement("button"),
  },
];

// Create stickers

stickers.forEach((sticker) => {
  sticker.button.addEventListener("click", () => {
    currentMarker = stickerMarker;
    currentSticker = sticker.name;
    canvas.dispatchEvent(toolMoved);
  });
  sticker.button.innerHTML = `${sticker.name}`;
  div3.append(sticker.button);
});

// Mouse events

// detect when mouse clicks on canvas
canvas.addEventListener("mousedown", (cursor) => {
  if (currentMarker != stickerMarker) {
    currentLineCommand = new LineCommand(cursor.offsetX, cursor.offsetY);
    commands.push(currentLineCommand);
    canvas.dispatchEvent(drawingChanged);
  }
  redoCommands.splice(origin, redoCommands.length);
  redoStickers.splice(origin, redoStickers.length);
});

// detect when mouse moves on canvas, and watch for click to draw
canvas.addEventListener("mousemove", (cursor) => {
  const leftMouseButton = 1;
  toolCommand = new ToolCommand(cursor.offsetX, cursor.offsetY);
  canvas.dispatchEvent(toolMoved);
  if (currentMarker != stickerMarker) {
    if (cursor.buttons == leftMouseButton && currentLineCommand) {
      currentLineCommand.points.push({
        x: cursor.offsetX,
        y: cursor.offsetY,
      });
      canvas.dispatchEvent(drawingChanged);
    }
  }
});

// detect when click on canvas ends to stop drawing
canvas.addEventListener("mouseup", (cursor) => {
  if (currentMarker == stickerMarker) {
    // place currentSticker
    currentLineCommand = new LineCommand(cursor.offsetX, cursor.offsetY);
    commands.push(currentLineCommand);
    stickerList.push(currentSticker);
  } else {
    stickerList.push(" ");
  }
  currentLineCommand = null;
  canvas.dispatchEvent(drawingChanged);
});

// detect when mouse leaves canvas bounds
canvas.addEventListener("mouseout", () => {
  toolCommand = null;
  canvas.dispatchEvent(toolMoved);
});

function updateCanvas() {
  ctx.clearRect(origin, origin, canvasSize, canvasSize);
  ctx.fillStyle = "white";
  ctx.fillRect(origin, origin, canvasSize, canvasSize);
  ctx.fillStyle = strokeColor;

  stickerIndex = origin;
  commands.forEach((cmd) => {
    cmd.display(ctx);
    if (stickerList.length > stickerIndex) {
      stickerIndex++;
    }
  });

  if (toolCommand) {
    toolCommand.display(ctx);
  }
}

// Buttons

clearButton.addEventListener("click", () => {
  commands.splice(origin, commands.length);
  stickerList.splice(origin, stickerList.length);
  canvas.dispatchEvent(drawingChanged);
});

undoButton.addEventListener("click", () => {
  if (commands.length && stickerList.length) {
    const undoPoint = commands.pop()!;
    const undoSticker = stickerList.pop()!;
    redoCommands.push(undoPoint);
    redoStickers.push(undoSticker);
    canvas.dispatchEvent(drawingChanged);
  }
});

redoButton.addEventListener("click", () => {
  if (redoCommands.length && redoStickers.length) {
    const redoPoint = redoCommands.pop()!;
    const redoSticker = redoStickers.pop()!;
    commands.push(redoPoint);
    stickerList.push(redoSticker);
    canvas.dispatchEvent(drawingChanged);
  }
});

thinButton.addEventListener("click", () => {
  strokeColor = randomColor();
  currentMarker = thinMarker;
});

thickButton.addEventListener("click", () => {
  strokeColor = randomColor();
  currentMarker = thickMarker;
});

customButton.addEventListener("click", () => {
  const newSticker = prompt("Paste a custom sticker.", "");
  if (newSticker != "" && newSticker != null) {
    const newButton = document.createElement("button");
    newButton.addEventListener("click", () => {
      currentMarker = stickerMarker;
      currentSticker = newSticker!;
      canvas.dispatchEvent(toolMoved);
    });
    newButton.innerHTML = newSticker!;
    div3.append(newButton);
    currentMarker = stickerMarker;
    currentSticker = newSticker!;
  }
});

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  const exportctx = exportCanvas.getContext("2d")!;
  exportCanvas.width = canvasSizeExport;
  exportCanvas.height = canvasSizeExport;
  const scaleCanvas = 4;
  exportctx.scale(scaleCanvas, scaleCanvas);

  exportctx.fillStyle = "white";
  exportctx.fillRect(origin, origin, canvasSize, canvasSize);

  stickerIndex = origin;
  commands.forEach((cmd) => {
    cmd.display(exportctx);
    if (stickerList.length > stickerIndex) {
      stickerIndex++;
    }
  });

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "canvas.png";
  anchor.click();
});

function randomColor() {
  const colorRandomizer = 0xffffff;
  const hex = 16;
  return "#" + Math.floor(Math.random() * colorRandomizer).toString(hex);
}

function tick() {
  updateCanvas();
  requestAnimationFrame(tick);
}
tick();
