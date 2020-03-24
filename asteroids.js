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

function loadGame() {
  textDraw(newGame, newGamePosX, newGamePosY, fontSize);
  canvas.addEventListener("click", newGameMouseDown);
}

function newGameMouseDown(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  const relativeY = e.clientY - canvas.offsetTop;
  if (relativeX > newGamePosX && relativeX < (canvas.width + (fontSize * newGame.length) / 2) / 2) 
  {
    if (relativeY > (canvas.height - fontSize) / 2 && relativeY < newGamePosY)    
    {
        canvas.removeEventListener("click", newGameMouseDown)
        startNewGame();
    }      
  }
}

function startNewGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  
}

loadGame();
