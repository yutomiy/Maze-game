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
      noLoop();
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
        noLoop();
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

function createGrid() {
  grid = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j);
      grid.push(cell);
    }
  }
  current = grid[0];
  player = new Player(0, 0);
  goal = new Goal(cols - 1, rows - 1);
}

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}

function removeWalls(a, b) {
  let x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }

  let y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

function displayWinScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("ゴールしました！", width / 2, height / 3);

  let restartButton = createButton("もう一度遊ぶ");
  let homeButton = createButton("ホームに戻る");

  restartButton.position(width / 2 - 70, height / 2 + 20);
  homeButton.position(width / 2 - 70, height / 2 + 60);

  restartButton.mousePressed(() => {
    restartButton.remove();
    homeButton.remove();
    restartGame();
  });

  homeButton.mousePressed(() => {
    restartButton.remove();
    homeButton.remove();
    goHome();
  });
}

function displayGameOverScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("ゲームオーバー！", width / 2, height / 3);

  let restartButton = createButton("もう一度遊ぶ");
  restartButton.position(width / 2 - 70, height / 2 + 50);
  restartButton.mousePressed(() => {
    restartButton.remove();
    restartGame();
  });
}

function goHome() {
  isStarted = false;
  gameWon = false;
  gameOver = false;
  timerStarted = false;
  score = 0;
  
  grid = [];
  noLoop();

  for (let button of levelButtons) {
    button.show();
  }
}

function createLevelButtons() {
  let easyButton = createButton("イージー");
  let mediumButton = createButton("ミディアム");
  let hardButton = createButton("ハード");

  easyButton.position(width / 2 - 50, height / 2);
  mediumButton.position(width / 2 - 50, height / 2 + 50);
  hardButton.position(width / 2 - 50, height / 2 + 100);

  easyButton.mousePressed(() => startGame(1));
  mediumButton.mousePressed(() => startGame(2));
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
  loop();
}
