import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Creative Canvas";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvasSize = 256;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
app.append(canvas);
ctx.canvas.width = canvasSize;
ctx.canvas.height = canvasSize;

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvasSize, canvasSize);

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  ctx.fillRect(0, 0, canvasSize, canvasSize);
});
