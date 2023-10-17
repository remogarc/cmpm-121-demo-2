import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Creative Canvas";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
app.append(canvas);
ctx.canvas.width = 256;
ctx.canvas.height = 256;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);
