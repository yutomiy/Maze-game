let cols, rows;
let w;
let grid = [];
let current;
let stack = [];
let player;
let goal;
let gameOver = false;
let startTime;
let timer = 0;
let maxTime;
let level = 0;
let isStarted = false;
let levelButtons = [];
let score = 0;
let lives = 3;
let playerMoveDelay = 250;
let lastMoveTime = 0;
let timerStarted = false;
let playerMoved = false;
let gameWon = false;
let restartButton; // ホームに戻るボタン用のグローバル変数

function setup() {
  createCanvas(400, 450);
  createLevelButtons();
}

function draw() {
  background(51);
  
  if (!isStarted) {
    showStartScreen();
  } else if (gameWon) {
    displayWinScreen();
  } else if (gameOver) {
    displayGameOverScreen();
  } else {
    for (let i = 0; i < grid.length; i++) {
      grid[i].show();
    }

    current.visited = true;
    current.highlight();

    let next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }

    player.show();

    if (!gameOver && millis() - lastMoveTime > playerMoveDelay) {
      playerMoved = player.move();
      lastMoveTime = millis();
      if (playerMoved && !timerStarted) {
        startTime = millis();
        timerStarted = true;
      }
    }

    goal.show();

    if (player.i === goal.i && player.j === goal.j) {
      gameWon = true;
      gameOver = true;
    }

    if (timerStarted) {
      let currentTime = millis() - startTime;
      timer = floor((maxTime - currentTime) / 1000);
      displayHUD();
      if (timer <= 0 && !gameOver) {
        gameOver = true;
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("時間切れ！", width / 2, height / 2);
      }
    }
  }
}

function displayHUD() {
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("残り時間: " + timer, 200, height - 50);
}

function displayWinScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("ゴールしました！", width / 2, height / 3);

  if (restartButton) {
    restartButton.remove();
  }
  restartButton = createButton("ホームに戻る");
  restartButton.position(width / 2 - 70, height / 2 + 50);
  restartButton.mousePressed(() => restartGame());
}

function displayGameOverScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("ゲームオーバー！", width / 2, height / 3);

  if (restartButton) {
    restartButton.remove();
  }
  restartButton = createButton("ホームに戻る");
  restartButton.position(width / 2 - 70, height / 2 + 50);
  restartButton.mousePressed(() => restartGame());
}

function restartGame() {
  isStarted = false;
  gameOver = false;
  gameWon = false;
  timerStarted = false;
  timer = 0;
  score = 0;

  if (restartButton) {
    restartButton.remove();
    restartButton = null;
  }

  for (let button of levelButtons) {
    button.show();
  }
}

function createLevelButtons() {
  let easyButton = createButton("イージー");
  easyButton.position(width / 2 - 50, height / 2);
  easyButton.mousePressed(() => startGame(1));

  let mediumButton = createButton("ミディアム");
  mediumButton.position(width / 2 - 50, height / 2 + 50);
  mediumButton.mousePressed(() => startGame(2));

  let hardButton = createButton("ハード");
  hardButton.position(width / 2 - 50, height / 2 + 100);
  hardButton.mousePressed(() => startGame(3));

  levelButtons.push(easyButton, mediumButton, hardButton);
}

function showStartScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("迷路ゲーム", width / 2, height / 3);
  textSize(24);
  text("レベルを選んでください", width / 2, height / 2 - 40);

  for (let button of levelButtons) {
    button.show();
  }
}

function startGame(selectedLevel) {
  level = selectedLevel;

  if (level === 1) {
    cols = 10;
    rows = 10;
    maxTime = 60000;
  } else if (level === 2) {
    cols = 15;
    rows = 15;
    maxTime = 90000;
  } else if (level === 3) {
    cols = 20;
    rows = 20;
    maxTime = 120000;
  }
  
  w = width / cols;
  createGrid();
  isStarted = true;
}
