// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverModal = document.getElementById('gameOverModal');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// 游戏配置
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 150; // 毫秒
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;

// 速度配置
const speedSettings = {
    1: { speed: 200, text: '慢速' },
    2: { speed: 175, text: '较慢' },
    3: { speed: 150, text: '中等' },
    4: { speed: 125, text: '较快' },
    5: { speed: 100, text: '快速' }
};

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // 生成食物
    generateFood();
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    
    // 绘制游戏
    drawGame();
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let foodX, foodY;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        foodX = Math.floor(Math.random() * gridWidth);
        foodY = Math.floor(Math.random() * gridHeight);
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = {x: foodX, y: foodY};
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头与身体颜色区分
        if (index === 0) {
            ctx.fillStyle = '#1976D2'; // 蛇头颜色 - 深蓝色
        } else {
            ctx.fillStyle = '#2196F3'; // 蛇身颜色 - 蓝色
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
    
    // 绘制食物
    ctx.fillStyle = '#F44336'; // 食物颜色
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新食物
        generateFood();
        
        // 不移除蛇尾，让蛇变长
    } else {
        // 移除蛇尾
        snake.pop();
    }
    
    // 检查游戏是否结束
    if (isGameOver(head)) {
        endGame();
        return;
    }
    
    // 添加新蛇头
    snake.unshift(head);
    
    // 绘制游戏
    drawGame();
}

// 检查游戏是否结束
function isGameOver(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        initGame();
        // 使用当前选择的速度设置
        const speedLevel = speedSlider.value;
        gameSpeed = speedSettings[speedLevel].speed;
        gameInterval = setInterval(moveSnake, gameSpeed);
    }
}

// 结束游戏
function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverModal.style.display = 'flex';
    restartBtn.style.display = 'inline-block';
}

// 重新开始游戏
function restartGame() {
    gameOverModal.style.display = 'none';
    startGame();
}

// 键盘控制
function handleKeyDown(e) {
    // 防止按键导致页面滚动
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
    }
    
    // 只有在游戏运行时才处理方向键
    if (!gameRunning) return;
    
    // 根据按键更新方向（防止180度转向）
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// 添加事件监听器
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeyDown);

// 速度滑块事件监听
speedSlider.addEventListener('input', updateSpeedDisplay);
speedSlider.addEventListener('change', updateGameSpeed);

// 更新速度显示
function updateSpeedDisplay() {
    const speedLevel = speedSlider.value;
    speedValue.textContent = speedSettings[speedLevel].text;
}

// 更新游戏速度
function updateGameSpeed() {
    const speedLevel = speedSlider.value;
    gameSpeed = speedSettings[speedLevel].speed;
    
    // 如果游戏正在运行，重新设置游戏间隔
    if (gameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, gameSpeed);
    }
}

// 初始化高分显示
highScoreElement.textContent = highScore;

// 初始化速度显示
updateSpeedDisplay();

// 初始绘制游戏界面
initGame();