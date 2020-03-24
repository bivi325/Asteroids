// adding the game to the page
gameDiv = document.getElementById("asteroids");
canvas = document.createElement("canvas");
gameDiv.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const ctx = canvas.getContext("2d");

const fontSize = Math.floor(canvas.width / 10);
const newGame = "New Game";
const newGamePosX = (canvas.width - (fontSize * newGame.length) / 2 - 20) / 2;
const newGamePosY = (canvas.height + fontSize) / 2;
let requestID;
let score = 21000;

const spaceship = {
  color: "white",
  shape: [
    { x: canvas.height / 60, y: 0 },
    { x: -canvas.height / 60, y: -canvas.height / 80 },
    { x: -canvas.height / 80, y: 0 },
    { x: -canvas.height / 60, y: canvas.height / 80 }
  ],
  position: {
    x: canvas.width / 2,
    y: canvas.height / 2
  },
  angle: Math.floor(Math.random() * Math.floor(degToRad(360))),
  speed: 3
};

const commands = {};

function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function textDraw(text, posX, posY, fontSize) {
  ctx.font = `${fontSize}px Aria`;
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, posX, posY);
}

function degToRad(angle) {
  return (3.1415926 * angle) / 180;
}

function rotX(x, y, angle) {
  return x * Math.cos(angle) - y * Math.sin(angle);
}

function rotY(x, y, angle) {
  return x * Math.sin(angle) + y * Math.cos(angle);
}

function drawSpaceship() {
  let x, y;
  let i = 0;

  ctx.beginPath();

  x =
    rotX(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
    spaceship.position.x;
  y =
    rotY(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
    spaceship.position.y;
  ctx.moveTo(x, y);

  for (i = 1; i < spaceship.shape.length; i++) {
    x =
      rotX(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
      spaceship.position.x;
    y =
      rotY(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
      spaceship.position.y;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = spaceship.color;
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function livesDraw() {}

function spaceshipDraw() {
  drawSpaceship();
}

function loadGame() {
  textDraw(newGame, newGamePosX, newGamePosY, fontSize);
  canvas.addEventListener("click", newGameMouseDown);
}

function newGameMouseDown(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  const relativeY = e.clientY - canvas.offsetTop;
  if (
    relativeX > newGamePosX &&
    relativeX < (canvas.width + (fontSize * newGame.length) / 2) / 2
  ) {
    if (relativeY > (canvas.height - fontSize) / 2 && relativeY < newGamePosY) {
      canvas.removeEventListener("click", newGameMouseDown);
      canvas.style.cursor = 'none'
      startNewGame();
    }
  }
}

function keyUpHandler(event) {
  commands[event.key] = false;
}

function keyDownHandler(event) {
  commands[event.key] = true;
}

function startNewGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.addEventListener("keyup", keyUpHandler);
  document.addEventListener("keydown", keyDownHandler);
  requestID = gameLoop();
}

function gameLoop() {
  update();
  draw();
  window.requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  textDraw(score, 10, 40, 30);
  livesDraw();
  spaceshipDraw();
}

function update() {
  console.log(commands);
  if (commands["w"] == true) {
    spaceship.position.x = spaceship.position.x + spaceship.speed * Math.cos(spaceship.angle);
    spaceship.position.y = spaceship.position.y + spaceship.speed * Math.sin(spaceship.angle);
  }
  if (commands["s"] == true) {
    spaceship.position.x = spaceship.position.x + spaceship.speed * Math.cos(-spaceship.angle);
    spaceship.position.y = spaceship.position.y + spaceship.speed * Math.sin(-spaceship.angle);
  }
  if (commands["a"] == true) {
    spaceship.angle -= degToRad(5);
  }
  if (commands["d"] == true) {
    spaceship.angle += degToRad(5);
  }
}

loadGame();
