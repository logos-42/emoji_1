const GRID_SIZE = 10;
const INVENTORY_SIZE = 20;

const BIOMES = {
    FOREST: {
        name: '森林',
        color: '#2d5a27',
        emojis: ['🌳', '🍎', '🌿', '🍄', '🦊', '🦉'],
        description: '充满生机的森林'
    },
    MOUNTAIN: {
        name: '山脉',
        color: '#4a4a4a',
        emojis: ['⛰️', '🗻', '🦅', '💎', '❄️', '🏔️'],
        description: '陡峭的山脉'
    },
    DESERT: {
        name: '沙漠',
        color: '#c2b280',
        emojis: ['🏜️', '🌵', '🦂', '🐪', '🌞', '🏺'],
        description: '干燥的沙漠'
    },
    OCEAN: {
        name: '海洋',
        color: '#1e4d6d',
        emojis: ['🌊', '🐠', '🐋', '🐚', '🏊‍♂️', '⛵'],
        description: '神秘的海洋'
    },
    CASTLE: {
        name: '古堡',
        color: '#4a2b50',
        emojis: ['🏰', '👑', '🗝️', '📜', '⚔️', '🛡️'],
        description: '神秘的古堡'
    }
};

const DIFFICULTIES = ['简单', '中等', '困难'];
const TASKS = [
    '收集3个不同的水果emoji',
    '探索5个未知区域',
    '在一个回合内收集3个emoji',
    '连续3次移动不收集任何emoji',
    '收集一套完整的生物emoji（陆地、海洋和空中生物）'
];

let playerPosition = { x: 0, y: 0 };
let inventory = new Map();
let map = [];
let events = [];
let emojiCombination = [];
let difficulty = 0;
let energy = 100;
let health = 100;
let currentTask = '';

function generateMap() {
    for (let y = 0; y < GRID_SIZE; y++) {
        map[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const biomeKeys = Object.keys(BIOMES);
            const biome = BIOMES[biomeKeys[Math.floor(Math.random() * biomeKeys.length)]];
            map[y][x] = {
                biome,
                emoji: biome.emojis[Math.floor(Math.random() * biome.emojis.length)],
                discovered: false,
                collected: false,
                obstacle: Math.random() < 0.1,
                trap: Math.random() < 0.05
            };
        }
    }
}

function addToInventory(emoji) {
    inventory.set(emoji, (inventory.get(emoji) || 0) + 1);
    emojiCombination.push(emoji);
    if (emojiCombination.length > 3) {
        emojiCombination.shift();
    }
    if (emojiCombination.length === 3) {
        generateImage(emojiCombination);
    }
    updateInventoryDisplay();
    checkTaskCompletion();
}

function addEvent(message) {
    events.unshift(message);
    if (events.length > 10) events.pop();
    updateEventLog();
}

function move(dx, dy) {
    if (energy <= 0) {
        addEvent('你太累了，无法移动。休息一下恢复能量吧！');
        return;
    }

    const newX = Math.max(0, Math.min(GRID_SIZE - 1, playerPosition.x + dx));
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, playerPosition.y + dy));
    
    if (newX !== playerPosition.x || newY !== playerPosition.y) {
        const tile = map[newY][newX];

        if (tile.obstacle) {
            addEvent(`你遇到了障碍物，无法前进！`);
            return;
        }

        playerPosition = { x: newX, y: newY };
        energy -= 5 + difficulty * 2;
        tile.discovered = true;

        if (tile.trap) {
            const damage = 10 + difficulty * 5;
            health -= damage;
            addEvent(`你触发了陷阱！损失了${damage}点生命值。`);
        }

        if (tile.emoji && !tile.collected) {
            addToInventory(tile.emoji);
            addEvent(`发现了 ${tile.emoji} 在${tile.biome.name}中！`);
            tile.collected = true;
        }

        if (Math.random() < 0.1 + difficulty * 0.05) {
            startBattle();
        }

        updateMapDisplay();
        updatePlayerStats();
    }
}

function updateMapDisplay() {
    const mapGrid = document.getElementById('map-grid');
    mapGrid.innerHTML = '';
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tile = document.createElement('div');
            tile.className = 'map-tile';
            tile.style.backgroundColor = map[y][x].biome.color;
            if (map[y][x].discovered) {
                tile.style.opacity = '0.5';
                if (!map[y][x].collected) {
                    tile.textContent = map[y][x].emoji;
                }
                if (map[y][x].obstacle) {
                    tile.textContent = '🚫';
                }
                if (map[y][x].trap) {
                    tile.textContent = '⚠️';
                }
            } else {
                tile.style.opacity = '0.1';
            }
            if (x === playerPosition.x && y === playerPosition.y) {
                tile.textContent = '👤';
                tile.style.backgroundColor = 'yellow';
            }
            mapGrid.appendChild(tile);
        }
    }
}

function updateInventoryDisplay() {
    const inventoryGrid = document.getElementById('inventory-grid');
    inventoryGrid.innerHTML = '';
    for (let i = 0; i < INVENTORY_SIZE; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        if (i < inventory.size) {
            const [emoji, count] = [...inventory][i];
            slot.textContent = emoji;
            const countElement = document.createElement('span');
            countElement.className = 'item-count';
            countElement.textContent = count;
            slot.appendChild(countElement);
        }
        inventoryGrid.appendChild(slot);
    }
    document.getElementById('inventory-count').textContent = `(${inventory.size}/${INVENTORY_SIZE})`;
}

function updateEventLog() {
    const eventLog = document.getElementById('event-log');
    eventLog.innerHTML = events.map(event => `<div class="event-message">${event}</div>`).join('');
}

function generateImage(emojis) {
    // 这里应该是调用实际的AI图片生成API
    // 为了演示，我们使用一个占位图像URL
    const imageUrl = `https://picsum.photos/seed/${emojis.join('')}/300/200`;
    document.getElementById('generated-image').src = imageUrl;
    document.getElementById('emoji-combination').textContent = `基于表情符号组合：${emojis.join(' ')}`;
    document.getElementById('image-dialog').style.display = 'block';
    addEvent(`生成了一张新图片，基于 ${emojis.join(' ')}！`);
}

function updatePlayerStats() {
    document.getElementById('difficulty-level').textContent = DIFFICULTIES[difficulty];
    document.getElementById('energy').textContent = energy;
    document.getElementById('health').textContent = health;
    document.getElementById('current-task').textContent = currentTask || '无';

    if (health <= 0) {
        alert('游戏结束！你的生命值耗尽了。');
        resetGame();
    }
}

function resetGame() {
    playerPosition = { x: 0, y: 0 };
    inventory = new Map();
    events = [];
    emojiCombination = [];
    energy = 100;
    health = 100;
    currentTask = '';
    generateMap();
    updateMapDisplay();
    updateInventoryDisplay();
    updateEventLog();
    updatePlayerStats();
    setNewTask();
}

function setNewTask() {
    currentTask = TASKS[Math.floor(Math.random() * TASKS.length)];
    addEvent(`新任务：${currentTask}`);
    updatePlayerStats();
}

function checkTaskCompletion() {
    // 这里应该根据currentTask的内容来检查任务是否完成
    // 为了演示，我们假设每次收集物品都有10%的概率完成任务
    if (Math.random() < 0.1) {
        addEvent(`恭喜！你完成了任务：${currentTask}`);
        difficulty = Math.min(difficulty + 1, DIFFICULTIES.length - 1);
        energy = Math.min(energy + 50, 100);
        health = Math.min(health + 20, 100);
        updatePlayerStats();
        setNewTask();
    }
}

function startBattle() {
    const enemy = ['🐺', '🐻', '🦁', '🐲'][Math.floor(Math.random() * 4)];
    document.getElementById('battle-description').textContent = `你遇到了一只${enemy}！准备战斗！`;
    document.getElementById('battle-dialog').style.display = 'block';
}

function endBattle(result) {
    if (result === 'win') {
        addEvent('你赢得了战斗！获得了一些奖励。');
        energy = Math.min(energy + 20, 100);
        addToInventory('🏆');
    } else if (result === 'lose') {
        addEvent('你在战斗中失败了，损失了一些生命值。');
        health -= 20;
    } else {
        addEvent('你成功逃脱了战斗，但损失了一些能量。');
        energy = Math.max(energy - 20, 0);
    }
    document.getElementById('battle-dialog').style.display = 'none';
    updatePlayerStats();
}

document.getElementById('move-up').addEventListener('click', () => move(0, -1));
document.getElementById('move-down').addEventListener('click', () => move(0, 1));
document.getElementById('move-left').addEventListener('click', () => move(-1, 0));
document.getElementById('move-right').addEventListener('click', () => move(1, 0));

document.getElementById('close-dialog').addEventListener('click', () => {
    document.getElementById('image-dialog').style.display = 'none';
});

document.getElementById('attack').addEventListener('click', () => endBattle(Math.random() < 0.6 ? 'win' : 'lose'));
document.getElementById('defend').addEventListener('click', () => endBattle(Math.random() < 0.8 ? 'win' : 'lose'));
document.getElementById('flee').addEventListener('click', () => endBattle('flee'));

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
});

// 初始化游戏
resetGame();