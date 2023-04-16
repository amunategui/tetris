

// Global variables
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const blockSize = 30;
const numRows = 20;
const numCols = 10;
const playfield = Array.from({ length: numRows }, () => Array(numCols).fill(0));
let currentTetromino;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function initializeGame() {
    // Set up the canvas dimensions
    canvas.width = blockSize * numCols;
    canvas.height = blockSize * numRows;

    // Add event listeners for keyboard input
    document.addEventListener('keydown', handleInput);

    // Spawn the first Tetromino
    spawnTetromino();

    // Start the game loop
    startGame();
}

function startGame() {
    gameLoop();
}

function gameLoop(time = 0) {
    // Calculate time difference since last frame
    const deltaTime = time - lastTime;
    lastTime = time;

    // Update drop counter and move the Tetromino down if needed
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        moveTetromino(0, 1);
        dropCounter = 0;
    }

    // Update the game state
    update();

    // Render the game state
    render();

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}



function handleInput(event) {
    const keyCode = event.keyCode;

    if (keyCode === 37) { // Left arrow key
        moveTetromino(-1, 0);
    } else if (keyCode === 39) { // Right arrow key
        moveTetromino(1, 0);
    } else if (keyCode === 40) { // Down arrow key
        moveTetromino(0, 1);
    } else if (keyCode === 38) { // Up arrow key
        rotateTetromino();
    }
}

function update() {
    // This function will be responsible for updating the game state.
    // At the moment, we're handling Tetromino movement and rotation in their respective functions.
    // You may add additional game state updates here if needed.
}

function render() {
    // Clear the canvas
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Render the playfield
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (playfield[row][col]) {
                context.fillStyle = 'white'; // Change this to the desired color for your Tetromino blocks
                context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                context.strokeStyle = 'black'; // Change this to the desired border color for your Tetromino blocks
                context.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
            }
        }
    }

    // Render the current Tetromino (if it exists)
    if (currentTetromino) {
        currentTetromino.blocks.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    context.fillStyle = 'white'; // Change this to the desired color for your Tetromino blocks
                    context.fillRect((currentTetromino.x + j) * blockSize, (currentTetromino.y + i) * blockSize, blockSize, blockSize);
                    context.strokeStyle = 'black'; // Change this to the desired border color for your Tetromino blocks
                    context.strokeRect((currentTetromino.x + j) * blockSize, (currentTetromino.y + i) * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}


const tetrominoes = [
    // I
    [
        [1, 1, 1, 1]
    ],
    // O
    [
        [1, 1],
        [1, 1]
    ],
    // T
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // S
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // Z
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    // J
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    // L
    [
        [0, 0, 1],
        [1, 1, 1]
    ]
];



function moveTetromino(offsetX, offsetY) {
    currentTetromino.x += offsetX;
    currentTetromino.y += offsetY;

    if (checkCollision(currentTetromino)) {
        currentTetromino.x -= offsetX;
        currentTetromino.y -= offsetY;

        if (offsetY > 0) {
            mergeTetromino();
            spawnTetromino();
            clearLines();
        }
    }
}

function rotateTetromino() {
    const originalBlocks = currentTetromino.blocks;
    const rotatedBlocks = originalBlocks[0].map((_, index) => originalBlocks.map(row => row[originalBlocks.length - 1 - index]));

    currentTetromino.blocks = rotatedBlocks;

    if (checkCollision(currentTetromino)) {
        currentTetromino.blocks = originalBlocks;
    }
}


function checkCollision(tetromino) {
    for (let row = 0; row < tetromino.blocks.length; row++) {
        for (let col = 0; col < tetromino.blocks[row].length; col++) {
            if (tetromino.blocks[row][col] &&
                (playfield[tetromino.y + row] === undefined || playfield[tetromino.y + row][tetromino.x + col] === undefined || playfield[tetromino.y + row][tetromino.x + col])) {
                return true;
            }
        }
    }
    return false;
}

function mergeTetromino() {
    for (let row = 0; row < currentTetromino.blocks.length; row++) {
        for (let col = 0; col < currentTetromino.blocks[row].length; col++) {
            if (currentTetromino.blocks[row][col]) {
                playfield[currentTetromino.y + row][currentTetromino.x + col] = 1;
            }
        }
    }
}

function clearLines() {
    outer: for (let row = numRows - 1; row >= 0; ) {
        for (let col = 0; col < numCols; col++) {
            if (!playfield[row][col]) {
                continue outer;
            }
        }

        playfield.splice(row, 1);
        playfield.unshift(Array(numCols).fill(0));
        updateScore();
    }
}

function gameOver() {
    // Reset the playfield
    playfield.forEach(row => row.fill(0));

    // Show a game over message or screen
    alert('Game Over!');

    // Reset the score and level
    // Assuming you have implemented updateScore() and updateLevelAndSpeed() functions
    updateScore(true);
    updateLevelAndSpeed(true);
}


let score = 0;
let level = 1;
const linesPerLevel = 10;
let linesCleared = 0;
const nextTetrominoCanvas = document.getElementById('nextTetrominoCanvas');
const nextTetrominoContext = nextTetrominoCanvas.getContext('2d');
let nextTetromino;

function updateScore(reset = false) {
    if (reset) {
        score = 0;
    } else {
        score += 100;
        linesCleared++;

        if (linesCleared % linesPerLevel === 0) {
            updateLevelAndSpeed();
        }
    }

    document.getElementById('score').innerText = score;
}

function renderNextTetromino() {
    // Clear the next Tetromino canvas
    nextTetrominoContext.fillStyle = 'black';
    nextTetrominoContext.fillRect(0, 0, nextTetrominoCanvas.width, nextTetrominoCanvas.height);

    // Render the next Tetromino
    if (nextTetromino) {
        const blockSize = 30;
        nextTetromino.blocks.forEach((row, i) => {
            row.forEach((value, j) => {
                if (value) {
                    nextTetrominoContext.fillStyle = 'white'; // Change this to the desired color for your Tetromino blocks
                    nextTetrominoContext.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
                    nextTetrominoContext.strokeStyle = 'black'; // Change this to the desired border color for your Tetromino blocks
                    nextTetrominoContext.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}

function updateLevelAndSpeed(reset = false) {
    if (reset) {
        level = 1;
        dropInterval = 1000;
    } else {
        level++;
        dropInterval -= 50;
    }

    document.getElementById('level').innerText = level;
}

function spawnTetromino() {
    const index = nextTetromino ? tetrominoes.indexOf(nextTetromino.blocks) : Math.floor(Math.random() * tetrominoes.length);
    nextTetromino = {
        blocks: tetrominoes[Math.floor(Math.random() * tetrominoes.length)]
    };

    currentTetromino = {
        x: Math.floor(numCols / 2) - Math.ceil(nextTetromino.blocks[0].length / 2),
        y: 0,
        blocks: nextTetromino.blocks
    };

    renderNextTetromino();

    // Check for game over
    if (checkCollision(currentTetromino)) {
        gameOver();
    }
}


initializeGame();

