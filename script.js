const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 480;

// スコア
let score = 0;
let gameStarted = false;

// パドル
const paddleWidth = 75;
const paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

// ボール
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 2;
let ballDY = -2;

// ブロック
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let bricks = [];

// 敵（ボーナス）
const enemyRowCount = 2;
const enemyColumnCount = 5;
const enemyWidth = brickWidth;
const enemyHeight = brickHeight;
let enemies = [];
let enemyDX = 2; // 敵の移動速度

// パドルの動き
let rightPressed = false;
let leftPressed = false;

// 効果音
const breakSound = document.getElementById("break-sound");
const gameOverSound = document.getElementById("game-over-sound");

// BGN（バックグラウンド音楽）
const backgroundMusic = document.getElementById("background-music");

// キーのイベントリスナー
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// キーが押されたとき
function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    } else if (e.key == " " && !gameStarted) {
        gameStarted = true;
        startGame();
    }
}

// キーが離されたとき
function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

// ブロックと敵の初期化
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function initEnemies() {
    for (let c = 0; c < enemyColumnCount; c++) {
        enemies[c] = [];
        for (let r = 0; r < enemyRowCount; r++) {
            enemies[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// スコアを更新する関数
function updateScore() {
    document.getElementById("score").textContent = `スコア: ${score}`;
}

// 描画関数
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

// ブロックの描画
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 敵の描画
function drawEnemies() {
    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            if (enemies[c][r].status == 1) {
                const enemyX = c * (enemyWidth + brickPadding) + brickOffsetLeft;
                const enemyY = r * (enemyHeight + brickPadding) + brickOffsetTop;
                enemies[c][r].x = enemyX;
                enemies[c][r].y = enemyY;
                ctx.beginPath();
                ctx.rect(enemyX, enemyY, enemyWidth, enemyHeight);
                ctx.fillStyle = "red";  // 敵は赤色
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 敵の移動
function moveEnemies() {
    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            const e = enemies[c][r];
            if (e.status == 1) {
                e.x += enemyDX;
                if (e.x + enemyWidth > canvas.width || e.x < 0) {
                    enemyDX = -enemyDX;
                    // 敵の位置を下に下げて反転させる
                    for (let i = 0; i < enemyColumnCount; i++) {
                        enemies[i][r].y += 10; // 敵を下に移動
                    }
                }
            }
        }
    }
}

// 衝突検出
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballDY = -ballDY;
                    b.status = 0;
                    score++;
                    updateScore();
                    breakSound.play();  // 効果音再生
                }
            }
        }
    }

    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            const e = enemies[c][r];
            if (e.status == 1) {
                if (ballX > e.x && ballX < e.x + enemyWidth && ballY > e.y && ballY < e.y + enemyHeight) {
                    ballDY = -ballDY;
                    e.status = 0;
                    score += 2;  // 敵を倒すと2ポイント
                    updateScore();
                }
            }
        }
    }
}

// ボールの移動
function moveBall() {
    ballX += ballDX;
    ballY += ballDY;

    // 左右の壁で反射
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    
    // 上壁で反射
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } 
    // 下壁で反射するのではなくゲームオーバーに
    else if (ballY + ballDY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            // ボールがパドルに触れる場合、パドルの中心で反射
            ballDY = -ballDY;
            const paddleCenter = paddleX + paddleWidth / 2;
            const ballDistanceFromCenter = ballX - paddleCenter;
            ballDX = 2 * ballDistanceFromCenter / paddleWidth; // ボールの速度をパドルの位置に応じて調整
        } else {
            gameOverSound.play();  // ゲームオーバー音を再生
            showGameOver();
        }
    }
}

function movePaddle() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

// ゲームの更新
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawEnemies();
    drawBall();
    drawPaddle();
    moveBall();
    movePaddle();
    moveEnemies();  // 敵の移動
    collisionDetection();

    if (isGameClear()) {
        showGameClear();
    } else if (gameStarted) {
        requestAnimationFrame(draw);
    }
}

// ゲームクリアの確認
function isGameClear() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                return false;
            }
        }
    }
    return true;
}

// ゲームスタート
function startGame() {
    // 初期状態に戻す
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 2;
    ballDY = -2;
    
    paddleX = (canvas.width - paddleWidth) / 2;

    initBricks();
    initEnemies();
    score = 0;
    updateScore();
    document.getElementById("game-over").classList.add("hidden");
    document.getElementById("game-clear").classList.add("hidden");
    gameStarted = true;

    backgroundMusic.play();  // ゲーム開始時にバックグラウンド音楽を再生
    draw();
}

// ゲームオーバー画面
function showGameOver() {
    document.getElementById("game-over").classList.remove("hidden");
    gameStarted = false;
    backgroundMusic.pause();  // ゲームオーバー時に音楽を停止
}

// ゲームクリア画面
function showGameClear() {
    document.getElementById("game-clear").classList.remove("hidden");
    gameStarted = false;
    backgroundMusic.pause();  // ゲームクリア時に音楽を停止
}
