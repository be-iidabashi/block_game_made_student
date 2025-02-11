const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverMessage = document.getElementById('game-over-message');
const winMessage = document.getElementById('win-message');
const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');

canvas.width = 480;
canvas.height = 600;

const paddleWidth = 75;
const paddleHeight = 10;
const ballRadius = 8;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleSpeed = 7;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 4;  // ボールの速度を少し遅くする
let ballSpeedY = -4;  // ボールの速度を少し遅くする

let rightPressed = false;
let leftPressed = false;
let spacePressed = false;  // スペースキーを押したかどうか

let brickRowCount = 6;
let brickColumnCount = 6;
let brickWidth = 60;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
let score = 0;
let consecutiveHits = 0;
let lastHitTime = 0;
let startTime = Date.now();

const brickColors = [
  "#FF5733",
  "#FFBD33",
  "#33FF57",
  "#33A1FF",
  "#9B33FF",
  "#FF33A1",
];

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let enemies = [];
let items = [];
let enemySpeed = 2;

// アイテム効果のタイプ
const ITEM_TYPE = {
  EXTRA_LIFE: 0,
  SCORE_BOOST: 1,
};

function createEnemy() {
  const x = Math.random() * (canvas.width - 40);
  const y = Math.random() * (canvas.height - 40);
  const speedX = (Math.random() - 0.5) * 4;
  const speedY = (Math.random() - 0.5) * 4;
  enemies.push({ x, y, speedX, speedY });
}

function createItem(type) {
  const x = Math.random() * (canvas.width - 20);
  const y = Math.random() * (canvas.height - 20);
  items.push({ x, y, type });
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === " " && !spacePressed) {
    spacePressed = true;
    startGame(); // スペースキーでゲーム開始
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function collisionDetection() {
  let now = Date.now();
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
          ballSpeedY = -ballSpeedY;
          b.status = 0;
          score += 10;
          
          if (now - lastHitTime < 2000) {
            consecutiveHits++;
            score += consecutiveHits * 5;
          } else {
            consecutiveHits = 1;
          }
          lastHitTime = now;
        }
      }
    }
  }

  // 敵との衝突検出
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    if (ballX > enemy.x && ballX < enemy.x + 40 && ballY > enemy.y && ballY < enemy.y + 40) {
      // 敵に当たった場合、ボールの速度を反転
      ballSpeedX = -ballSpeedX;
      ballSpeedY = -ballSpeedY;
      enemies.splice(i, 1); // 敵を削除
      score += 50; // 敵に当たったらスコアを追加
    }
  }

  // アイテムとの衝突検出
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    if (ballX > item.x && ballX < item.x + 20 && ballY > item.y && ballY < item.y + 20) {
      if (item.type === ITEM_TYPE.EXTRA_LIFE) {
        score += 100;  // 余分なライフをゲットした場合、スコアを追加
        // ここにライフ追加の処理を入れることもできます
      } else if (item.type === ITEM_TYPE.SCORE_BOOST) {
        score += 200;  // スコアブーストアイテムを取るとスコアアップ
      }
      items.splice(i, 1); // アイテムを削除
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColors[r];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    ctx.beginPath();
    ctx.arc(enemy.x + 20, enemy.y + 20, 20, 0, Math.PI * 2);  // 敵を円形で描画
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

function drawItems() {
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    ctx.beginPath();
    if (item.type === ITEM_TYPE.EXTRA_LIFE) {
      ctx.arc(item.x + 10, item.y + 10, 10, 0, Math.PI * 2);  // 余分なライフアイテムを円形で描画
      ctx.fillStyle = "green";
    } else if (item.type === ITEM_TYPE.SCORE_BOOST) {
      ctx.rect(item.x, item.y, 20, 20);  // スコアブーストアイテムを四角形で描画
      ctx.fillStyle = "yellow";
    }
    ctx.fill();
    ctx.closePath();
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("スコア: " + score, 8, 20);
}

function drawTime() {
  let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("タイム: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds, canvas.width - 100, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawEnemies();
  drawItems();
  drawScore();
  drawTime();
  collisionDetection();

  if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      let paddleCenter = paddleX + paddleWidth / 2;
      let distanceFromCenter = ballX - paddleCenter;
      let angle = distanceFromCenter / (paddleWidth / 2);
      ballSpeedX = 4 * angle;
      ballSpeedY = -ballSpeedY;
    } else {
      gameOver();
      return;
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += paddleSpeed;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (isGameWon()) {
    showWinMessage();
    return;
  }

  // 敵を動かす
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    if (enemy.x < 0 || enemy.x + 40 > canvas.width) {
      enemy.speedX = -enemy.speedX;
    }
    if (enemy.y < 0 || enemy.y + 40 > canvas.height) {
      enemy.speedY = -enemy.speedY;
    }
  }

  // アイテムをランダムに生成
  if (Math.random() < 0.005) {  // アイテム生成確率を低くする
    createItem(Math.random() < 0.5 ? ITEM_TYPE.EXTRA_LIFE : ITEM_TYPE.SCORE_BOOST);
  }

  requestAnimationFrame(draw);
}

function isGameWon() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        return false;
      }
    }
  }
  return true;
}

function startGame() {
  gameOverMessage.style.display = 'none';
  winMessage.style.display = 'none';
  resetGame();
  draw();
}

function gameOver() {
  gameOverMessage.style.display = 'block';
  finalScore.textContent = score;
  let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  finalTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function showWinMessage() {
  winMessage.style.display = 'block';
  finalScore.textContent = score;
  let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  finalTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function resetGame() {
  score = 0;
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballSpeedX = 4;
  ballSpeedY = -4;
  paddleX = (canvas.width - paddleWidth) / 2;
  enemies = [];
  items = [];
  startTime = Date.now();
  for (let i = 0; i < 5; i++) {
    createEnemy();
  }
}

startGame();
