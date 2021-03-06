if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("serviceWorker.js")
    .then(function() {
      return navigator.serviceWorker.ready;
    })
    .then(function() {})
    .catch(function() {});
}

// adding the game to the page
gameDiv = document.getElementById("asteroids");
canvas = document.createElement("canvas");
gameDiv.appendChild(canvas);
resizeCanvasToDisplaySize(canvas);

const ctx = canvas.getContext("2d");

const fontSize = Math.floor(canvas.width / 10);
const newGame = "New Game";
const signPosX = (canvas.width - (fontSize * newGame.length) / 2 - 20) / 2;
const signPosY = (canvas.height + fontSize) / 2;
let requestID;
let score = 0;

const game = {
  numberOfAsteroidClasses: 2,
  limit: 10
};

function smallAsteroid() {
  this.name = "small";
  (this.numberOfSides = 6),
    (this.size = canvas.width / 80),
    (this.posX = Math.floor(Math.random() * Math.floor(canvas.width / 3))),
    (this.posY = Math.floor((Math.random() * Math.floor(canvas.height)) / 3)),
    (this.angle = Math.floor(Math.random() * Math.floor(degToRad(360)))),
    (this.speed = 1);
  this.price = 100;
}

function mediumAsteroid() {
  this.name = "medium";
  (this.numberOfSides = 8),
    (this.size = canvas.width / 40),
    (this.posX = Math.floor(Math.random() * Math.floor(canvas.width / 3))),
    (this.posY = Math.floor(Math.random() * Math.floor(canvas.height / 3))),
    (this.angle = Math.floor(Math.random() * Math.floor(degToRad(360)))),
    (this.speed = 0.5);
  this.price = 400;
}

const spaceship = {
  color: "white",
  bulletColor: "Red",
  shape: [
    { x: canvas.height / 60, y: 0 },
    { x: -canvas.height / 60, y: -canvas.height / 80 },
    { x: -canvas.height / 80, y: 0 },
    { x: -canvas.height / 60, y: canvas.height / 80 }
  ],
  size: canvas.height / 60,
  posX: canvas.width / 2,
  posY: canvas.height / 2,
  angle: Math.floor(Math.random() * Math.floor(degToRad(360))),
  speed: 3,
  bulletsSpeed: 5,
  bulletSize: 2,
  lives: 3
};

const bullets = [];
const asteroids = [];

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

function drawText(text, posX, posY, fontSize) {
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
    spaceship.posX;
  y =
    rotY(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
    spaceship.posY;
  ctx.moveTo(x, y);

  for (i = 1; i < spaceship.shape.length; i++) {
    x =
      rotX(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
      spaceship.posX;
    y =
      rotY(spaceship.shape[i].x, spaceship.shape[i].y, spaceship.angle) +
      spaceship.posY;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = spaceship.color;
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Lives: " + spaceship.lives, canvas.width - 65, 20);
}

function drawBullets() {
  for (bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.posX, bullet.posY, spaceship.bulletSize, 0, Math.PI * 2);
    ctx.fillStyle = spaceship.bulletColor;
    ctx.fill();
    ctx.closePath();
  }
}

function drawAsteroids() {
  for (asteroid of asteroids) {
    ctx.beginPath();
    ctx.moveTo(
      asteroid.posX + asteroid.size * Math.cos(0),
      asteroid.posY + asteroid.size * Math.sin(0)
    );
    for (let i = 1; i <= asteroid.numberOfSides; i += 1) {
      ctx.lineTo(
        asteroid.posX +
          asteroid.size * Math.cos((i * 2 * Math.PI) / asteroid.numberOfSides),
        asteroid.posY +
          asteroid.size * Math.sin((i * 2 * Math.PI) / asteroid.numberOfSides)
      );
    }
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function loadGame() {
  drawText(newGame, signPosX, signPosY, fontSize);
  canvas.addEventListener("click", newGameMouseDown);
}

function newGameMouseDown(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  const relativeY = e.clientY - canvas.offsetTop;
  if (
    relativeX > signPosX &&
    relativeX < (canvas.width + (fontSize * newGame.length) / 2) / 2
  ) {
    if (relativeY > (canvas.height - fontSize) / 2 && relativeY < signPosY) {
      canvas.removeEventListener("click", newGameMouseDown);
      canvas.style.cursor = "none";
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

function clickHandler() {
  bullets.push({
    posX: spaceship.posX,
    posY: spaceship.posY,
    angle: spaceship.angle
  });
}

function startNewGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.addEventListener("keyup", keyUpHandler);
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("click", clickHandler);
  spaceship.lives = 3;
  score = 0;
  gameLoop();
}

function gameLoop() {
  update();
  draw();
  if (spaceship.lives > 0) {
    requestID = requestAnimationFrame(gameLoop);
  } else {
    gameEnd();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText(score, 10, 40, 30);
  drawLives();
  drawSpaceship();
  drawBullets();
  drawAsteroids();
}

function update() {
  if (commands["w"] == true) {
    spaceship.posX =
      spaceship.posX + spaceship.speed * Math.cos(spaceship.angle);
    spaceship.posY =
      spaceship.posY + spaceship.speed * Math.sin(spaceship.angle);
  }
  if (commands["s"] == true) {
    spaceship.posX =
      spaceship.posX + spaceship.speed * Math.cos(-spaceship.angle);
    spaceship.posY =
      spaceship.posY + spaceship.speed * Math.sin(-spaceship.angle);
  }
  if (commands["a"] == true) {
    spaceship.angle -= degToRad(5);
  }
  if (commands["d"] == true) {
    spaceship.angle += degToRad(5);
  }
  if (asteroids.length < game.limit) {
    whatWillItBe = Math.floor(Math.random() * game.numberOfAsteroidClasses * 4);
    if (whatWillItBe > 4) {
      asteroid = new mediumAsteroid();
    } else {
      asteroid = new smallAsteroid();
    }
    asteroids.push(asteroid);
  }

  checkBounds(spaceship);

  for (asteroid of asteroids) {
    asteroid.posX = asteroid.posX + asteroid.speed * Math.cos(asteroid.angle);
    asteroid.posY = asteroid.posY + asteroid.speed * Math.sin(asteroid.angle);

    checkBounds(asteroid);
  }

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].posX =
      bullets[i].posX + spaceship.bulletsSpeed * Math.cos(bullets[i].angle);
    bullets[i].posY =
      bullets[i].posY + spaceship.bulletsSpeed * Math.sin(bullets[i].angle);
    if (
      bullets[i].posX > canvas.width ||
      bullets[i].posX < 0 ||
      bullets[i].posY < 0 ||
      bullets.posY > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  }
  checkCollision();
}

function checkCollision() {
  for (let i = 0; i < asteroids.length; i++) {
    let dx = asteroids[i].posX - spaceship.posX;
    let dy = asteroids[i].posY - spaceship.posY;

    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < asteroids[i].size + spaceship.size) {
      spaceship.lives--;
      spaceship.posX = canvas.width / 2;
      spaceship.posY = canvas.height / 2;
    }
  }
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = 0; j < bullets.length; j++) {
      let dx = asteroids[i].posX - bullets[j].posX;
      let dy = asteroids[i].posY - bullets[j].posY;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < asteroids[i].size + spaceship.bulletSize) {
        bullets.splice(i, 1);
        score += asteroids[i].price;
        if (asteroids[i].name == "medium") {
          asteroid_1 = new smallAsteroid();
          asteroid_1.posX =
            asteroids[i].posX +
            asteroids[i].size * Math.cos(asteroids[i].angle);
          asteroid_1.posY =
            asteroids[i].posY +
            asteroids[i].size * Math.sin(asteroids[i].angle);
          asteroid_1.angle = asteroids[i].angle;
          asteroid_2 = new smallAsteroid();
          asteroid_2.posX =
            asteroids[i].posX +
            asteroids[i].size * Math.cos(asteroids[i].angle);
          asteroid_2.posY =
            asteroids[i].posY +
            asteroids[i].size * Math.sin(asteroids[i].angle);
          asteroid_2.angle = -asteroids[i].angle;
          asteroids.push(asteroid_1);
          asteroids.push(asteroid_2);
        }
        asteroids.splice(i, 1);
        return;
      }
    }
  }
}

function checkBounds(obj) {
  if (obj.posX > canvas.width) {
    obj.posX = 1;
  }
  if (obj.posX < 0) {
    obj.posX = canvas.width - 1;
  }
  if (obj.posY < 0) {
    obj.posY = canvas.height - 1;
  }
  if (obj.posY > canvas.height) {
    obj.posY = 1;
  }
}

function gameEnd() {
  cancelAnimationFrame(requestID);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.cursor = "auto";
  drawText(
    `Your score is ${score}`,
    signPosX - canvas.width / 6,
    signPosY - fontSize,
    fontSize
  );
  drawText("Try Again", signPosX, signPosY, fontSize);
  document.addEventListener("click", e => {
    const relativeX = e.clientX - canvas.offsetLeft;
    const relativeY = e.clientY - canvas.offsetTop;
    if (
      relativeX > signPosX &&
      relativeX < (canvas.width + (fontSize * newGame.length) / 2) / 2
    ) {
      if (relativeY > (canvas.height - fontSize) / 2 && relativeY < signPosY) {
        location.reload();
      }
    }
  });
}

loadGame();
