const gameBoard = document.getElementById("game-board");

// Initialize the game board
function createBoard() {
  for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    gameBoard.appendChild(cell);
  }
}


const tetrominoes = [
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'cyan'
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'red'
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'blue'
  },
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'yellow'
  },
  {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    color: 'purple'
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'green'
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'orange'
  }
];


let currentTetromino = null;
let currentPosition = { x: 0, y: 0 };

function drawTetromino() {
  for (let y = 0; y < currentTetromino.shape.length; y++) {
    for (let x = 0; x < currentTetromino.shape[y].length; x++) {
      if (currentTetromino.shape[y][x]) {
        const cell = gameBoard.children[(currentPosition.y + y) * 10 + currentPosition.x + x];
        cell.style.backgroundColor = currentTetromino.color;
      }
    }
  }
}

function eraseTetromino() {
  for (let y = 0; y < currentTetromino.shape.length; y++) {
    for (let x = 0; x < currentTetromino.shape[y].length; x++) {
      if (currentTetromino.shape[y][x]) {
        const cell = gameBoard.children[(currentPosition.y + y) * 10 + currentPosition.x + x];
        cell.style.backgroundColor = '';
      }
    }
  }
}

function spawnTetromino() {
  // Select a random Tetromino shape
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  currentTetromino = JSON.parse(JSON.stringify(tetrominoes[randomIndex]));

  // Set the initial position at the top of the game board
  currentPosition.x = Math.floor(gameBoard.children.length / 20 / 2) - Math.ceil(currentTetromino.shape[0] / 2);
  currentPosition.y = 0;

  // Draw the Tetromino on the game board
  drawTetromino();
}

 

function rotateMatrix(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );
  return result;
}

function isValidMove(newPosition, newShape) {
  for (let y = 0; y < newShape.length; y++) {
    for (let x = 0; x < newShape[y].length; x++) {
      if (newShape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;

        if (newX < 0 || newX >= 10 || newY >= 20) {
          return false;
        }

        const cell = gameBoard.children[newY * 10 + newX];
        if (cell.style.backgroundColor) {
          return false;
        }
      }
    }
  }

  return true;
}

function rotateTetromino() {
  eraseTetromino();

  const newShape = rotateMatrix(currentTetromino.shape);

  if (isValidMove(currentPosition, newShape)) {
    currentTetromino.shape = newShape;
  }

  drawTetromino();
}

// Create a function to move a Tetromino
function moveTetromino(dx, dy) {
  eraseTetromino();

  const newPosition = { x: currentPosition.x + dx, y: currentPosition.y + dy };

  if (isValidMove(newPosition, currentTetromino.shape)) {
    currentPosition = newPosition;
  } else if (dy > 0) {
    // If the move is invalid due to a downward movement,
    // lock the Tetromino and return false to indicate a collision
    lockTetromino();
    return false;
  }

  drawTetromino();
  return true;
}

// Create a function to handle user input
function handleUserInput(event) {
  switch (event.key) {
    case 'ArrowUp':
      rotateTetromino();
      break;
    case 'ArrowRight':
      moveTetromino(1, 0);
      break;
    case 'ArrowDown':
      moveTetromino(0, 1);
      break;
    case 'ArrowLeft':
      moveTetromino(-1, 0);
      break;
  }
}

// Create a function to check for collisions
function checkCollision() {
  const newPosition = { x: currentPosition.x, y: currentPosition.y + 1 };

  return !isValidMove(newPosition, currentTetromino.shape);
}

// Create a function to lock the Tetromino in place
function lockTetromino() {
  for (let y = 0; y < currentTetromino.shape.length; y++) {
    for (let x = 0; x < currentTetromino.shape[y].length; x++) {
      if (currentTetromino.shape[y][x]) {
        const cell = gameBoard.children[(currentPosition.y + y) * 10 + currentPosition.x + x];
        cell.style.backgroundColor = currentTetromino.color;
      }
    }
  }
}

// Create a function to clear completed lines
function clearLines() {
  for (let y = 0; y < 20; y++) {
    const row = Array.from({ length: 10 }, (_, x) => gameBoard.children[y * 10 + x]);
    const isRowComplete = row.every(cell => cell.style.backgroundColor);

    if (isRowComplete) {
      row.forEach(cell => cell.style.backgroundColor = '');
      const cellsAbove = Array.from({ length: y * 10 }, (_, i) => gameBoard.children[i]);
      cellsAbove.reverse().forEach(cell => cell.style.backgroundColor = cell.nextSibling.style.backgroundColor);
    }
  }
}

function isGameOver() {
  for (let x = 0; x < 10; x++) {
    const cell = gameBoard.children[x];
    if (cell.style.backgroundColor) {
      return true;
    }
  }
  return false;
}

function gameLoop() {
  spawnTetromino();

  document.addEventListener('keydown', handleUserInput);

  const gameInterval = setInterval(() => {
    if (!checkCollision()) {
      moveTetromino(0, 1);
    } else {
      lockTetromino();
      clearLines();

      if (isGameOver()) {
        clearInterval(gameInterval);
        alert('Game over!');
      } else {
        spawnTetromino();
      }
    }
  }, 500);
}





createBoard();
gameLoop();


