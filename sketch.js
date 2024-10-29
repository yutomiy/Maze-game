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
let playerMoveDelay = 250; // プレイヤーの移動速度調整 (250ミリ秒ごとに移動)
let lastMoveTime = 0;
let timerStarted = false; // タイマーが開始されたかどうか
let playerMoved = false; // プレイヤーが移動したかどうかのフラグ
let gameWon = false; // ゲームに勝ったかどうかのフラグ

function setup() {
  createCanvas(400, 450); // キャンバスの高さを少し大きくして、テキスト表示領域を作る
  createLevelButtons();
}

function draw() {
  background(51);
  
  if (!isStarted) {
    // スタート画面とレベル選択
    showStartScreen();
  } else if (gameWon) {
    // ゴールに到達した場合の処理
    displayWinScreen();
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

    // プレイヤーの移動を遅くするために、タイマーに基づいて移動を制限
    if (!gameOver && millis() - lastMoveTime > playerMoveDelay) {
      playerMoved = player.move(); // プレイヤーの移動が行われたかを確認
      lastMoveTime = millis(); // 最後の移動タイムスタンプを更新

      // プレイヤーが動き始めたらタイマーをスタート
      if (playerMoved && !timerStarted) {
        startTime = millis();
        timerStarted = true;
      }
    }

    goal.show();

    // ゴールに到達
    if (player.i === goal.i && player.j === goal.j) {
      gameWon = true; // ゲームに勝ったフラグを立てる
      gameOver = true;
      noLoop(); // 描画を停止
    }

    if (timerStarted) {
      // タイマー表示
      let currentTime = millis() - startTime;
      timer = floor((maxTime - currentTime) / 1000);

      displayHUD(); // HUD（スコアやタイマー）をキャンバスの外に表示

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
  // スコアとタイマーを表示（キャンバスの上部、迷路に被らない）
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("スコア: " + score, 10, height - 50); // スコア表示を下部
  text("残り時間: " + timer, 200, height - 50); // タイマーも下部に配置
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

class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true]; // 上、右、下、左の壁
    this.visited = false;
  }

  checkNeighbors() {
    let neighbors = [];

    let top = grid[index(this.i, this.j - 1)];
    let right = grid[index(this.i + 1, this.j)];
    let bottom = grid[index(this.i, this.j + 1)];
    let left = grid[index(this.i - 1, this.j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      let r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }
  }

  highlight() {
    let x = this.i * w;
    let y = this.j * w;
    noStroke();
    fill(0, 255, 0, 100);
    rect(x, y, w, w);
  }

  show() {
    let x = this.i * w;
    let y = this.j * w;
    stroke(255);
    if (this.walls[0]) {
      line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      line(x + w, y, x + w, y + w);
    }
    if (this.walls[2]) {
      line(x + w, y + w, x, y + w);
    }
    if (this.walls[3]) {
      line(x, y + w, x, y);
    }

    if (this.visited) {
      noStroke();
      fill(255, 0, 255, 100);
      rect(x, y, w, w);
    }
  }
}

class Player {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }

  move() {
    let moved = false;
    if (keyIsDown(UP_ARROW) && !grid[index(this.i, this.j)].walls[0]) {
      this.j--;
      moved = true;
    }
    if (keyIsDown(RIGHT_ARROW) && !grid[index(this.i, this.j)].walls[1]) {
      this.i++;
      moved = true;
    }
    if (keyIsDown(DOWN_ARROW) && !grid[index(this.i, this.j)].walls[2]) {
      this.j++;
      moved = true;
    }
    if (keyIsDown(LEFT_ARROW) && !grid[index(this.i, this.j)].walls[3]) {
      this.i--;
      moved = true;
    }
    return moved; // 移動が行われたかを返す
  }

  show() {
    fill(0, 0, 255);
    noStroke();
    rect(this.i * w, this.j * w, w, w);
  }
}

class Goal {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    rect(this.i * w, this.j * w, w, w);
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
  text("レベルを選んでください", width / 2, height / 2 - 40); // レベル選択のメッセージを上に移動

  // ボタンを表示
  for (let button of levelButtons) {
    button.show();
  }
}

function displayWinScreen() {
  background(51);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("ゴールしました！", width / 2, height / 3);
  textSize(24);
  text("スコア: " + score, width / 2, height / 2);
  
  // やり直しボタンの表示
  let restartButton = createButton("もう一度遊ぶ");
  restartButton.position(width / 2 - 70, height / 2 + 50);
  restartButton.mousePressed(() => restartGame());
  restartButton.show();
}

function restartGame() {
  // 再スタートのための設定
  isStarted = false;
  gameOver = false;
  gameWon = false;
  timerStarted = false;
  timer = 0;
  score = 0;

  // スタート画面の要素を表示
  for (let button of levelButtons) {
    button.show();
  }
}
