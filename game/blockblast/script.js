const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');

canvas.width = 400;
canvas.height = 400;

const gridSize = 8;
const blockSize = canvas.width / gridSize;
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
let grid = [];
let score = 0;
let selectedBlock = null;

function initGrid() {
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.floor(Math.random() * colors.length);
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] !== null) {
                ctx.fillStyle = colors[grid[i][j]];
                ctx.fillRect(j * blockSize, i * blockSize, blockSize - 2, blockSize - 2);
            }
        }
    }
}

function getBlockAt(x, y) {
    const row = Math.floor(y / blockSize);
    const col = Math.floor(x / blockSize);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return { row, col };
    }
    return null;
}

function findConnectedBlocks(row, col, color, visited) {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || grid[row][col] !== color || visited[row][col]) {
        return [];
    }
    visited[row][col] = true;
    const blocks = [{ row, col }];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dr, dc] of directions) {
        blocks.push(...findConnectedBlocks(row + dr, col + dc, color, visited));
    }
    return blocks;
}

function clearBlocks(blocks) {
    for (let { row, col } of blocks) {
        grid[row][col] = null;
    }
    score += blocks.length * 10;
    scoreElement.textContent = score;
}

function collapseGrid() {
    for (let col = 0; col < gridSize; col++) {
        let emptyRow = gridSize - 1;
        for (let row = gridSize - 1; row >= 0; row--) {
            if (grid[row][col] !== null) {
                grid[emptyRow][col] = grid[row][col];
                if (emptyRow !== row) {
                    grid[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
    for (let col = 0; col < gridSize; col++) {
        if (grid[gridSize - 1][col] === null) {
            for (let row = 0; row < gridSize; row++) {
                if (grid[row][col] === null) {
                    grid[row][col] = Math.floor(Math.random() * colors.length);
                }
            }
        }
    }
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const block = getBlockAt(x, y);
    if (block) {
        const { row, col } = block;
        if (grid[row][col] !== null) {
            const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
            const connectedBlocks = findConnectedBlocks(row, col, grid[row][col], visited);
            if (connectedBlocks.length >= 2) {
                clearBlocks(connectedBlocks);
                collapseGrid();
                drawGrid();
            }
        }
    }
});

function gameLoop() {
    drawGrid();
    requestAnimationFrame(gameLoop);
}

initGrid();
gameLoop();
