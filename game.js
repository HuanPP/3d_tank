// ========================================================
// 钢甲狂潮 (Steel Torrent) - 3D 第一人称战术坦克模拟器
// Core Physics & 3D WebGL (Three.js) Render Pipeline
// ========================================================

// 2D 向量工具类
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    clone() {
        return new Vector2D(this.x, this.y);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const m = this.magnitude();
        if (m > 0) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    }
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
}

// 模拟音效合成器引擎 (Web Audio API)
class SoundEngine {
    constructor() {
        this.ctx = null;
    }
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    playShoot() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }
    playShotgun() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
        
        // 混入金属噪声
        const noise = this.ctx.createOscillator();
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(600, now);
        noise.frequency.linearRampToValueAtTime(100, now + 0.1);
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        noise.connect(noiseGain);
        
        gain.connect(this.ctx.destination);
        noiseGain.connect(this.ctx.destination);
        
        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.25);
        noise.stop(now + 0.1);
    }
    playLaser() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.35);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(400, now);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }
    playExplosion() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // 模拟白噪声缓冲
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
    }
    playHit() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }
    playSelect() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
}

const audio = new SoundEngine();

// 常量定义
const GRID_CELL_SIZE = 50;
const MAP_COLS = 16;
const MAP_ROWS = 16;
const TANK_SIZE = 30;

// 地图区块枚举
const TileType = {
    EMPTY: 0,
    BRICK: 1,  // 可破坏
    STEEL: 2,  // 不可破坏
    GRASS: 3,  // 可穿过
    WATER: 4   // 不可穿过，子弹可穿过
};

// 战术关卡蓝图库
const StageBlueprints = [
    // 第一关：教学战役
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,0,3,3,0,0,4,4,0,1,1,0,2],
        [2,0,1,2,0,3,3,0,0,4,4,0,2,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,0,2,2,0,0,2,2,0,1,1,0,2],
        [2,0,3,3,0,2,0,0,0,0,2,0,3,3,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,3,3,0,2,0,0,0,0,2,0,3,3,0,2],
        [2,0,1,1,0,2,2,2,2,2,2,0,1,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,2,0,4,4,0,0,3,3,0,2,1,0,2],
        [2,0,1,1,0,4,4,0,0,3,3,0,1,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    // 第二关：丛林死战
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,3,3,0,0,0,0,0,0,3,3,0,0,2],
        [2,0,2,2,1,1,0,4,4,0,1,1,2,2,0,2],
        [2,3,2,2,0,0,0,4,4,0,0,0,2,2,3,2],
        [2,3,1,0,0,1,1,0,0,1,1,0,0,1,3,2],
        [2,0,0,0,2,2,3,3,3,3,2,2,0,0,0,2],
        [2,0,4,4,2,2,0,0,0,0,2,2,4,4,0,2],
        [2,0,4,4,0,0,0,0,0,0,0,0,4,4,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,2,2,0,0,0,0,2,2,1,1,0,2],
        [2,0,1,1,2,2,3,3,3,3,2,2,1,1,0,2],
        [2,3,0,0,0,1,1,0,0,1,1,0,0,0,3,2],
        [2,3,2,2,0,0,0,4,4,0,0,0,2,2,3,2],
        [2,0,2,2,1,1,0,4,4,0,1,1,2,2,0,2],
        [2,0,0,3,3,0,0,0,0,0,0,3,3,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    // 第三关：钢铁堡垒
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,2,2,0,0,2,2,0,0,0,0,2],
        [2,0,1,1,0,2,2,0,0,2,2,0,1,1,0,2],
        [2,0,1,1,0,0,0,0,0,0,0,0,1,1,0,2],
        [2,0,0,0,0,4,4,4,4,4,4,0,0,0,0,2],
        [2,2,2,0,0,4,4,4,4,4,4,0,0,2,2,2],
        [2,0,0,0,0,0,0,3,3,0,0,0,0,0,0,2],
        [2,0,1,1,2,2,0,3,3,0,2,2,1,1,0,2],
        [2,0,1,1,2,2,0,0,0,0,2,2,1,1,0,2],
        [2,0,0,0,0,0,0,3,3,0,0,0,0,0,0,2],
        [2,2,2,0,0,4,4,4,4,4,4,0,0,2,2,2],
        [2,0,0,0,0,4,4,4,4,4,4,0,0,0,0,2],
        [2,0,1,1,0,0,0,0,0,0,0,0,1,1,0,2],
        [2,0,1,1,0,2,2,0,0,2,2,0,1,1,0,2],
        [2,0,0,0,0,2,2,0,0,2,2,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ]
];

// 2D 爆炸粒子 (用于 3D 摄像机投影渲染)
class Particle {
    constructor(x, y, color) {
        this.pos = new Vector2D(x, y);
        this.z = 8 + Math.random() * 12; // 粒子高度
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 100;
        this.vel = new Vector2D(Math.cos(angle), Math.sin(angle)).multiply(speed);
        this.velZ = (Math.random() - 0.3) * 60; // Z 轴弹力
        this.color = color;
        this.life = 0.5 + Math.random() * 0.4;
        this.maxLife = this.life;
        this.size = 3 + Math.random() * 4;
    }
    update(dt) {
        this.pos.add(this.vel.clone().multiply(dt));
        this.z += this.velZ * dt;
        this.velZ -= 100 * dt; // 重力模拟
        if (this.z < 1) {
            this.z = 1;
            this.velZ *= -0.3; // 触地反弹
        }
        this.life -= dt;
    }
}

// 基础弹药实体类
class Bullet {
    constructor(x, y, angle, speed, damage, isPlayerOwned) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(Math.cos(angle), Math.sin(angle)).multiply(speed);
        this.angle = angle;
        this.radius = 4;
        this.damage = damage;
        this.isPlayerOwned = isPlayerOwned;
        this.shouldDestroy = false;
        this.trail = [];
    }

    update(map, dt) {
        this.trail.push(this.pos.clone());
        if (this.trail.length > 4) this.trail.shift();

        const nextPos = this.pos.clone().add(this.vel.clone().multiply(dt));
        
        const cellX = Math.floor(nextPos.x / GRID_CELL_SIZE);
        const cellY = Math.floor(nextPos.y / GRID_CELL_SIZE);

        if (cellX >= 0 && cellX < MAP_COLS && cellY >= 0 && cellY < MAP_ROWS) {
            const tile = map[cellY][cellX];
            if (tile === TileType.BRICK) {
                // 碰撞砖墙，砖墙被毁
                map[cellY][cellX] = TileType.EMPTY;
                this.shouldDestroy = true;
                audio.playHit();
                
                // 触发 3D 地图块移除事件
                if (game) game.onBrickDestroyed(cellX, cellY);
                return;
            } else if (tile === TileType.STEEL) {
                this.shouldDestroy = true;
                audio.playHit();
                return;
            }
        } else {
            this.shouldDestroy = true;
            return;
        }

        this.pos.copy(nextPos);
    }
}

// 磁暴休眠雷
class EMPMine {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.radius = 12;
        this.pulseTime = 0;
        this.shouldDestroy = false;
        this.isTriggered = false;
    }
    update(dt) {
        this.pulseTime += dt * 8;
    }
    trigger(enemies, gameInstance) {
        this.isTriggered = true;
        this.shouldDestroy = true;
        audio.playExplosion();
        gameInstance.screenShake = 10;
        
        // 粒子溅射
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const p = new Particle(this.pos.x, this.pos.y, '#00f0ff');
            p.vel.set(Math.cos(angle) * 160, Math.sin(angle) * 160);
            p.maxLife = 0.55;
            p.life = 0.55;
            gameInstance.particles.push(p);
        }
        
        // 磁暴电感伤害判定
        enemies.forEach(enemy => {
            if (this.pos.distanceTo(enemy.pos) < 140) {
                enemy.takeDamage(20);
                enemy.stunTimer = 4.0; // 强行瘫痪 4 秒
            }
        });
    }
}

// 纳米激光线段实体
class LaserBeam {
    constructor(x1, y1, x2, y2) {
        this.p1 = new Vector2D(x1, y1);
        this.p2 = new Vector2D(x2, y2);
        this.life = 0.25; // 持续时间较短的闪烁轨迹
        this.maxLife = 0.25;
    }
    update(dt) {
        this.life -= dt;
    }
}

// 坦克核心抽象基类 (处理 2D 物理碰撞与核心状态)
class BaseTank {
    constructor(x, y, color, isPlayer = false) {
        this.pos = new Vector2D(x, y);
        this.angle = 0; // 底盘旋转角
        this.turretAngle = 0; // 炮塔旋转角
        this.speed = 0;
        this.maxSpeed = 120;
        this.rotationSpeed = 2.0; // 履带转向速度
        this.color = color;
        this.isPlayer = isPlayer;
        this.width = TANK_SIZE;
        this.height = TANK_SIZE;
        
        this.health = 100;
        this.maxHealth = 100;
        
        this.shootCooldown = 0.45;
        this.shootTimer = 0;
        this.isShielded = false;
        this.shieldTimer = 0;
    }

    checkTileCollision(nextPos, map) {
        if (this.isPlayer) {
            // 对玩家取消常规碰撞体积以保证顺滑度，但需防止其驶出地图最外圈钢墙边界导致逻辑异常
            const radius = 10; 
            const checkPoints = [
                new Vector2D(nextPos.x - radius, nextPos.y - radius),
                new Vector2D(nextPos.x + radius, nextPos.y - radius),
                new Vector2D(nextPos.x - radius, nextPos.y + radius),
                new Vector2D(nextPos.x + radius, nextPos.y + radius)
            ];
            for (let pt of checkPoints) {
                const cellX = Math.floor(pt.x / GRID_CELL_SIZE);
                const cellY = Math.floor(pt.y / GRID_CELL_SIZE);
                if (cellX < 1 || cellX >= MAP_COLS - 1 || cellY < 1 || cellY >= MAP_ROWS - 1) {
                    return true; // 越界/触碰最外圈钢墙边界
                }
            }
            return false;
        }

        const radius = this.width / 2;
        const checkPoints = [
            new Vector2D(nextPos.x - radius, nextPos.y - radius),
            new Vector2D(nextPos.x + radius, nextPos.y - radius),
            new Vector2D(nextPos.x - radius, nextPos.y + radius),
            new Vector2D(nextPos.x + radius, nextPos.y + radius)
        ];

        for (let pt of checkPoints) {
            const cellX = Math.floor(pt.x / GRID_CELL_SIZE);
            const cellY = Math.floor(pt.y / GRID_CELL_SIZE);

            if (cellX < 0 || cellX >= MAP_COLS || cellY < 0 || cellY >= MAP_ROWS) {
                return true; // 越界
            }

            const tile = map[cellY][cellX];
            if (tile === TileType.BRICK || tile === TileType.STEEL || tile === TileType.WATER) {
                return true; // 阻挡
            }
        }
        return false;
    }

    takeDamage(amount) {
        if (this.isShielded) return;
        if (this.isPlayer) {
            this.shieldRechargeTimer = 3.0; // 3秒内未受伤害才开始恢复护盾
            const absorb = Math.min(this.shield, amount * 0.7); // 护盾吸收70%伤害
            this.shield -= absorb;
            const remaining = amount - absorb;
            this.health = Math.max(0, this.health - remaining);
        } else {
            this.health = Math.max(0, this.health - amount);
        }
        audio.playHit();
    }
}

// 玩家控制的 3D 坦克核心逻辑
class PlayerTank extends BaseTank {
    constructor(x, y) {
        super(x, y, '#00f0ff', true);
        this.activeWeapon = 'standard';
        this.ammoScatter = 15;
        this.ammoLaser = 8;
        this.ammoMine = 3;
        this.ammoAirstrike = 1;
        
        this.isRamming = false;
        this.ramTimer = 0;
        this.ramDirection = new Vector2D(0, 0);
        this.ramCooldownTimer = 0;
        this.ramCooldown = 3.0;
        
        this.maxSpeed = 160;
        this.rotationSpeed = 3.5; // 3D 底盘转向速度
        
        // 纳米护盾物理充能系统
        this.maxShield = 100;
        this.shield = 100;
        this.shieldRechargeTimer = 0;
    }

    update(keys, mousePos, map, dt) {
        if (this.shootTimer > 0) this.shootTimer -= dt;
        if (this.shieldTimer > 0) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) this.isShielded = false;
        }
        if (this.ramCooldownTimer > 0) this.ramCooldownTimer -= dt;

        // 纳米能量护盾自动充能逻辑
        if (this.shieldRechargeTimer > 0) {
            this.shieldRechargeTimer -= dt;
        } else if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + 15 * dt); // 每秒自动恢复 15 点
        }

        // 1. 等离子冲撞逻辑
        if (this.isRamming) {
            this.ramTimer -= dt;
            if (this.ramTimer <= 0) {
                this.isRamming = false;
            }
            
            const ramSpeed = this.maxSpeed * 3.8;
            const nextPos = this.pos.clone().add(this.ramDirection.clone().multiply(ramSpeed * dt));
            
            // 冲撞破坏墙壁
            const cellX = Math.floor(nextPos.x / GRID_CELL_SIZE);
            const cellY = Math.floor(nextPos.y / GRID_CELL_SIZE);
            
            if (cellX >= 0 && cellX < MAP_COLS && cellY >= 0 && cellY < MAP_ROWS) {
                const tile = map[cellY][cellX];
                if (tile === TileType.BRICK) {
                    map[cellY][cellX] = TileType.EMPTY;
                    audio.playHit();
                    if (game) game.onBrickDestroyed(cellX, cellY);
                } else if (tile === TileType.STEEL) {
                    this.isRamming = false;
                    if (game) game.screenShake = 14;
                    audio.playHit();
                    return;
                }
            }
            
            if (!this.checkTileCollision(nextPos, map)) {
                this.pos.copy(nextPos);
            }
            
            // 伤害撞击到的敌人
            if (game && game.enemies) {
                game.enemies.forEach(enemy => {
                    if (this.pos.distanceTo(enemy.pos) < TANK_SIZE * 0.95) {
                        enemy.takeDamage(90);
                        enemy.pos.add(this.ramDirection.clone().multiply(45));
                        game.createExplosionParticles(enemy.pos.x, enemy.pos.y, 'var(--primary)');
                        audio.playExplosion();
                        game.screenShake = 12;
                    }
                });
            }
            return;
        }

        // 2. 第一人称 FPS 视线移动驱动 (WASD 基于当前主炮视线 turretAngle 进行前后左右平移)
        let moveX = 0;
        let moveY = 0;
        
        if (keys['w'] || keys['arrowup']) {
            moveX += Math.cos(this.turretAngle);
            moveY += Math.sin(this.turretAngle);
        }
        if (keys['s'] || keys['arrowdown']) {
            moveX -= Math.cos(this.turretAngle);
            moveY -= Math.sin(this.turretAngle);
        }
        if (keys['a'] || keys['arrowleft']) {
            // 视线方向逆时针旋转 90 度为左
            moveX += Math.cos(this.turretAngle - Math.PI / 2);
            moveY += Math.sin(this.turretAngle - Math.PI / 2);
        }
        if (keys['d'] || keys['arrowright']) {
            // 视线方向顺时针旋转 90 度为右
            moveX += Math.cos(this.turretAngle + Math.PI / 2);
            moveY += Math.sin(this.turretAngle + Math.PI / 2);
        }
        
        let moveVector = new Vector2D(moveX, moveY);
        if (moveVector.magnitude() > 0) {
            moveVector.normalize();
            const movement = moveVector.multiply(this.maxSpeed * dt);
            const nextPos = this.pos.clone().add(movement);
            
            if (!this.checkTileCollision(nextPos, map)) {
                this.pos.copy(nextPos);
            } else {
                // 滑动物理碰撞检测：分别对 X 和 Y 轴单独尝试移动，防止擦墙时产生完全卡滞
                const nextPosX = new Vector2D(this.pos.x + movement.x, this.pos.y);
                if (!this.checkTileCollision(nextPosX, map)) {
                    this.pos.x = nextPosX.x;
                }
                const nextPosY = new Vector2D(this.pos.x, this.pos.y + movement.y);
                if (!this.checkTileCollision(nextPosY, map)) {
                    this.pos.y = nextPosY.y;
                }
            }
            
            // 自动将底盘面向角度 angle 对齐到移动方向，保持逻辑一致
            this.angle = Math.atan2(moveVector.y, moveVector.x);
        }
    }

    fire() {
        if (this.isRamming) return null;
        if (this.shootTimer > 0) return null;

        const spawnDist = this.width * 0.7;
        const startX = this.pos.x + Math.cos(this.turretAngle) * spawnDist;
        const startY = this.pos.y + Math.sin(this.turretAngle) * spawnDist;

        if (this.activeWeapon === 'standard') {
            this.shootTimer = this.shootCooldown;
            audio.playShoot();
            return new Bullet(startX, startY, this.turretAngle, 380, 25, true);
        } else if (this.activeWeapon === 'scatter') {
            if (this.ammoScatter > 0) {
                this.ammoScatter--;
                this.shootTimer = 0.5;
                audio.playShotgun();

                const bullets = [];
                const spreads = [-0.22, -0.11, 0, 0.11, 0.22];
                spreads.forEach(offset => {
                    bullets.push(new Bullet(startX, startY, this.turretAngle + offset, 400, 18, true));
                });
                return bullets;
            } else {
                audio.playHit();
                return null;
            }
        } else if (this.activeWeapon === 'laser') {
            if (this.ammoLaser > 0) {
                this.ammoLaser--;
                this.shootTimer = 0.65;
                audio.playLaser();

                const dir = new Vector2D(Math.cos(this.turretAngle), Math.sin(this.turretAngle));
                let endX = startX;
                let endY = startY;

                // 激光探测
                for (let d = 0; d < 1000; d += 10) {
                    const checkX = startX + dir.x * d;
                    const checkY = startY + dir.y * d;

                    const cellX = Math.floor(checkX / GRID_CELL_SIZE);
                    const cellY = Math.floor(checkY / GRID_CELL_SIZE);

                    if (cellX < 0 || cellX >= MAP_COLS || cellY < 0 || cellY >= MAP_ROWS) {
                        endX = checkX;
                        endY = checkY;
                        break;
                    }

                    const tile = game.map[cellY][cellX];
                    if (tile === TileType.STEEL) {
                        endX = checkX;
                        endY = checkY;
                        break;
                    } else if (tile === TileType.BRICK) {
                        game.map[cellY][cellX] = TileType.EMPTY;
                        game.onBrickDestroyed(cellX, cellY);
                        game.createExplosionParticles(checkX, checkY, '#ff4400');
                    }
                    endX = checkX;
                    endY = checkY;
                }

                // 伤害判定
                if (game && game.enemies) {
                    game.enemies.forEach(enemy => {
                        for (let d = 0; d < 1000; d += 20) {
                            const checkX = startX + dir.x * d;
                            const checkY = startY + dir.y * d;
                            if (enemy.pos.distanceTo(new Vector2D(checkX, checkY)) < TANK_SIZE * 0.7) {
                                enemy.takeDamage(55);
                                game.createExplosionParticles(enemy.pos.x, enemy.pos.y, '#00f0ff');
                                break;
                            }
                        }
                    });
                }

                if (game && game.lasers) {
                    game.lasers.push(new LaserBeam(startX, startY, endX, endY));
                }
                return null;
            } else {
                audio.playHit();
                return null;
            }
        } else if (this.activeWeapon === 'mine') {
            if (this.ammoMine > 0) {
                this.ammoMine--;
                this.shootTimer = 0.35;
                audio.playSelect();
                if (game && game.mines) {
                    game.mines.push(new EMPMine(this.pos.x, this.pos.y));
                }
                return null;
            } else {
                audio.playHit();
                return null;
            }
        } else if (this.activeWeapon === 'ram') {
            if (this.ramCooldownTimer <= 0) {
                this.ramCooldownTimer = this.ramCooldown;
                this.isRamming = true;
                this.ramTimer = 0.35;
                this.isShielded = true;
                this.shieldTimer = 0.35;
                
                audio.playExplosion();
                if (game) game.screenShake = 10;
                
                // 指向性判定
                this.ramDirection = new Vector2D(Math.cos(this.angle), Math.sin(this.angle)).normalize();
                
                // 粒子溅射
                for (let i = 0; i < 20; i++) {
                    const p = new Particle(this.pos.x, this.pos.y, '#00f0ff');
                    p.vel.set(-this.ramDirection.x * 150 + (Math.random()-0.5)*50, -this.ramDirection.y * 150 + (Math.random()-0.5)*50);
                    game.particles.push(p);
                }
            } else {
                audio.playHit();
            }
            return null;
        }
        return null;
    }
}

// AI 控制的敌人坦克类
class EnemyTank extends BaseTank {
    constructor(x, y, level = 1) {
        const colors = ['#ff3333', '#ff8800', '#ff00aa'];
        super(x, y, colors[Math.min(level - 1, colors.length - 1)], false);
        this.level = level;
        this.maxSpeed = 55 + level * 12;
        this.health = 25 * level;
        this.maxHealth = this.health;
        
        this.decisionTimer = 0;
        this.decisionInterval = 1.0 + Math.random() * 0.8;
        this.moveVector = new Vector2D(0, 0);
        this.stunTimer = 0;
    }

    update(playerPos, map, dt) {
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            this.shootTimer = 0.8;
            if (Math.random() < 0.22 && game) {
                const p = new Particle(this.pos.x + (Math.random()-0.5)*15, this.pos.y + (Math.random()-0.5)*15, '#00f0ff');
                p.vel.set((Math.random()-0.5)*50, (Math.random()-0.5)*50);
                p.z = 15;
                game.particles.push(p);
            }
            return;
        }

        if (this.shootTimer > 0) this.shootTimer -= dt;
        this.decisionTimer += dt;

        if (this.decisionTimer >= this.decisionInterval) {
            this.decisionTimer = 0;
            const dist = this.pos.distanceTo(playerPos);
            
            // 智能移动/射击决策
            if (this.level >= 2 && dist < 280 && Math.random() < 0.7) {
                this.moveVector = playerPos.clone().subtract(this.pos).normalize();
            } else {
                const a = Math.random() * Math.PI * 2;
                this.moveVector.set(Math.cos(a), Math.sin(a));
            }

            if (dist < 400 && Math.random() < 0.8) {
                this.shootRequested = true;
            }
        }

        if (this.moveVector.magnitude() > 0) {
            this.angle = Math.atan2(this.moveVector.y, this.moveVector.x);
            this.turretAngle = Math.atan2(playerPos.y - this.pos.y, playerPos.x - this.pos.x);

            const nextPos = this.pos.clone().add(this.moveVector.clone().multiply(this.maxSpeed * dt));
            if (!this.checkTileCollision(nextPos, map)) {
                this.pos.copy(nextPos);
            } else {
                this.decisionTimer = this.decisionInterval; // 阻挡时强制重新思考
            }
        }
    }

    fire() {
        if (this.stunTimer > 0) return null;
        if (this.shootTimer <= 0) {
            this.shootTimer = 1.9 - this.level * 0.25;
            audio.playShoot();
            const spawnDist = this.width * 0.7;
            const startX = this.pos.x + Math.cos(this.turretAngle) * spawnDist;
            const startY = this.pos.y + Math.sin(this.turretAngle) * spawnDist;
            return new Bullet(startX, startY, this.turretAngle, 210 + this.level * 20, 12 * this.level, false);
        }
        return null;
    }
}

// 补给物资箱
class PowerUp {
    constructor(x, y, type) {
        this.pos = new Vector2D(x, y);
        this.type = type; // 'health' | 'shield'
        this.radius = 12;
        this.shouldDestroy = false;
        this.pulseTime = 0;
    }
    update(dt) {
        this.pulseTime += dt * 4.5;
    }
}

// ========================================================
// 钢甲狂潮 3D 第一人称主游戏引擎类
// ========================================================
class SteelTorrentGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.hudCanvas = document.getElementById('hud-canvas');
        this.ctx = this.hudCanvas.getContext('2d');
        
        this.gameState = 'START';
        this.difficulty = 1;
        this.score = 0;
        this.stage = 1;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];
        this.lasers = [];
        this.mines = [];
        
        this.map = [];
        this.keys = {};
        
        // 炮塔绝对弧度，用于控制第一人称视线
        this.mousePos = new Vector2D(0, 0); 
        this.isPointerLocked = false;
        
        this.screenShake = 0;
        
        // ==============================
        // Three.js WebGL 3D 渲染核心组装
        // ==============================
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.headlight = null;
        this.floor = null;
        
        // 3D 缓存映射字典，避免每帧重复创建 Mesh 降低垃圾回收频率
        this.wallMeshes = {};
        this.enemyMeshes = new Map();
        this.bulletMeshes = new Map();
        this.powerUpMeshes = new Map();
        this.mineMeshes = new Map();
        this.laserMeshes = new Map();
        
        this.initWebGL();
        this.setupEventListeners();
        this.resizeViewport();
        
        window.addEventListener('resize', () => this.resizeViewport());
    }

    // 初始化 Three.js WebGL 环境
    initWebGL() {
        // 创建 Scene，添加迷幻黑色电子赛博浓雾
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0d14);
        this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.002);

        // 创建 PerspectiveCamera (视角：65，视距：1 到 3000 像素)
        this.camera = new THREE.PerspectiveCamera(65, this.canvas.width / this.canvas.height, 1, 3000);
        
        // 初始化 WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 添加氛围环境光源 (深蓝极光色)
        const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
        this.scene.add(ambientLight);

        // 添加机载前大灯 (跟随玩家镜头)
        this.headlight = new THREE.SpotLight(0x00f0ff, 4.0, 500, Math.PI / 4.5, 0.4, 1);
        this.scene.add(this.headlight);
        this.scene.add(this.headlight.target);

        // 创建 procedural 网格纹理
        const gridTex = this.createGridTexture();
        gridTex.wrapS = THREE.RepeatWrapping;
        gridTex.wrapT = THREE.RepeatWrapping;
        gridTex.repeat.set(80, 80);

        const floorGeo = new THREE.PlaneGeometry(4000, 4000);
        const floorMat = new THREE.MeshStandardMaterial({
            map: gridTex,
            roughness: 0.8,
            metalness: 0.2
        });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.scene.add(this.floor);
    }

    // 动态调整 3D Canvas 与 2D HUD 画布视口大小
    resizeViewport() {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.hudCanvas.width = width;
        this.hudCanvas.height = height;
        
        if (this.camera && this.renderer) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    // 绘制 procedural 霓虹网格纹理
    createGridTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, 64, 64);
        ctx.strokeStyle = '#005577';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 64, 64);
        
        // 核心发光边缘
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.strokeRect(0, 0, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    }

    // 监听输入
    setupEventListeners() {
        // Pointer Lock 鼠标锁定
        this.hudCanvas.addEventListener('click', () => {
            if (this.gameState === 'PLAYING') {
                this.hudCanvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = (document.pointerLockElement === this.hudCanvas);
        });

        // 捕获鼠标平移以驱动第一人称主炮转向视线
        window.addEventListener('mousemove', (e) => {
            if (this.gameState === 'PLAYING' && this.isPointerLocked && this.player) {
                // 平滑改变玩家炮塔相对角度
                this.player.turretAngle += e.movementX * 0.0022;
            }
        });

        // 键盘逻辑
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ' && this.gameState === 'PLAYING') {
                e.preventDefault();
                this.triggerAirstrike();
            }
            if ((e.key === 'p' || e.key === 'Escape') && (this.gameState === 'PLAYING' || this.gameState === 'PAUSED')) {
                this.togglePause();
            }
            const weaponsMap = { '1': 'standard', '2': 'scatter', '3': 'laser', '4': 'mine', '5': 'ram' };
            if (weaponsMap[e.key] && this.gameState === 'PLAYING') {
                this.player.activeWeapon = weaponsMap[e.key];
                this.updateHUD();
                audio.playSelect();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        window.addEventListener('wheel', (e) => {
            if (this.gameState === 'PLAYING') {
                e.preventDefault();
                const weaponsList = ['standard', 'scatter', 'laser', 'mine', 'ram'];
                let idx = weaponsList.indexOf(this.player.activeWeapon);
                if (e.deltaY > 0) {
                    idx = (idx + 1) % weaponsList.length;
                } else {
                    idx = (idx - 1 + weaponsList.length) % weaponsList.length;
                }
                this.player.activeWeapon = weaponsList[idx];
                this.updateHUD();
                audio.playSelect();
            }
        }, { passive: false });

        // 发射弹药
        this.hudCanvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.gameState === 'PLAYING' && this.isPointerLocked && this.player) {
                const newBullets = this.player.fire();
                if (newBullets) {
                    if (Array.isArray(newBullets)) {
                        this.bullets.push(...newBullets);
                    } else {
                        this.bullets.push(newBullets);
                    }
                }
            }
        });

        // 触屏滑动旋转视角 (支持移动端双指操作)
        let lastTouchX = 0;
        this.hudCanvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (touch) {
                lastTouchX = touch.clientX;
            }
        }, { passive: true });

        this.hudCanvas.addEventListener('touchmove', (e) => {
            if (this.gameState !== 'PLAYING' || !this.player) return;
            const touch = e.touches[0];
            if (!touch) return;
            
            const rect = this.hudCanvas.getBoundingClientRect();
            // 防误触判定：忽略虚拟摇杆所在左下角区域
            if (touch.clientX - rect.left < rect.width * 0.35 && touch.clientY - rect.top > rect.height * 0.6) {
                return;
            }
            
            const dx = touch.clientX - lastTouchX;
            lastTouchX = touch.clientX;
            
            // 将平移增量映射为炮塔转角
            this.player.turretAngle += dx * 0.007;
        }, { passive: true });

        // 难度选择与开始按钮绑定
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = parseInt(e.target.dataset.level);
                audio.playSelect();
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());

        // 手机端虚拟摇杆机动绑定
        const knob = document.getElementById('joystick-knob');
        const joyContainer = document.getElementById('joystick-container');
        if (joyContainer && knob) {
            let joyStartX = 0, joyStartY = 0;
            let isJoyActive = false;
            
            const handleJoyStart = (e) => {
                const touch = e.touches[0];
                if (!touch) return;
                isJoyActive = true;
                const r = joyContainer.getBoundingClientRect();
                joyStartX = r.left + r.width / 2;
                joyStartY = r.top + r.height / 2;
                knob.style.transition = 'none';
            };
            
            const handleJoyMove = (e) => {
                if (!isJoyActive) return;
                const touch = e.touches[0];
                if (!touch) return;
                
                let dx = touch.clientX - joyStartX;
                let dy = touch.clientY - joyStartY;
                
                const maxD = 35;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > maxD) {
                    dx = (dx / dist) * maxD;
                    dy = (dy / dist) * maxD;
                }
                knob.style.transform = `translate(${dx}px, ${dy}px)`;
                
                const dxNorm = dx / maxD;
                const dyNorm = dy / maxD;
                
                // 虚拟映射 W/A/S/D 按键指令
                this.keys['w'] = dyNorm < -0.3;
                this.keys['s'] = dyNorm > 0.3;
                this.keys['a'] = dxNorm < -0.3;
                this.keys['d'] = dxNorm > 0.3;
                
                if (e.cancelable) e.preventDefault();
            };
            
            const handleJoyEnd = () => {
                if (!isJoyActive) return;
                isJoyActive = false;
                knob.style.transition = 'transform 0.15s ease-out';
                knob.style.transform = 'translate(0,0)';
                
                this.keys['w'] = this.keys['s'] = this.keys['a'] = this.keys['d'] = false;
            };
            
            joyContainer.addEventListener('touchstart', handleJoyStart, { passive: true });
            window.addEventListener('touchmove', handleJoyMove, { passive: false });
            window.addEventListener('touchend', handleJoyEnd, { passive: true });
        }

        // 手机端动作按键
        const btnFire = document.getElementById('m-btn-fire');
        if (btnFire) {
            btnFire.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameState === 'PLAYING' && this.player) {
                    const newBullets = this.player.fire();
                    if (newBullets) {
                        if (Array.isArray(newBullets)) {
                            this.bullets.push(...newBullets);
                        } else {
                            this.bullets.push(newBullets);
                        }
                    }
                }
            });
        }

        const btnAir = document.getElementById('m-btn-airstrike');
        if (btnAir) {
            btnAir.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameState === 'PLAYING') {
                    this.triggerAirstrike();
                }
            });
        }

        document.querySelectorAll('.m-wep-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameState === 'PLAYING' && this.player) {
                    this.player.activeWeapon = e.currentTarget.dataset.wep;
                    this.updateHUD();
                    audio.playSelect();
                }
            });
        });
        
        // 动态唤醒手机控制界面类
        const initTouch = () => {
            document.body.classList.add('touch-controls-active');
            window.removeEventListener('touchstart', initTouch);
        };
        window.addEventListener('touchstart', initTouch, { passive: true });
    }

    startGame() {
        audio.init();
        audio.playSelect();
        
        this.score = 0;
        this.stage = 1;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];
        this.lasers = [];
        this.mines = [];
        
        this.loadStage(1);
        
        this.gameState = 'PLAYING';
        
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        
        // 引导玩家点击锁定指针
        if (!this.isPointerLocked && !('ontouchstart' in window)) {
            this.hudCanvas.requestPointerLock();
        }
    }

    // 重构 3D 地图网格加载与清空机制
    loadStage(stageNum) {
        this.stage = stageNum;
        this.lasers = [];
        this.mines = [];
        this.bullets = [];
        
        // 1. 从 3D scene 中彻底移除所有已存在物块
        for (let key in this.wallMeshes) {
            this.scene.remove(this.wallMeshes[key]);
        }
        this.wallMeshes = {};
        
        // 2. 清除并释放敌人 3D 模型
        this.enemyMeshes.forEach(mesh => this.scene.remove(mesh));
        this.enemyMeshes.clear();
        
        // 3. 清除补给箱和地雷 3D 模型
        this.powerUpMeshes.forEach(mesh => this.scene.remove(mesh));
        this.powerUpMeshes.clear();
        this.mineMeshes.forEach(mesh => this.scene.remove(mesh));
        this.mineMeshes.clear();

        // 4. 拷贝关卡二维网格数据
        const blueprint = StageBlueprints[Math.min(stageNum - 1, StageBlueprints.length - 1)];
        this.map = JSON.parse(JSON.stringify(blueprint));

        // 5. 扫描地图，添加 3D 几何物块
        const brickGeo = new THREE.BoxGeometry(50, 48, 50);
        const brickMat = new THREE.MeshPhongMaterial({
            color: 0xe1523c,
            shininess: 15,
            flatShading: true
        });

        const steelGeo = new THREE.BoxGeometry(50, 58, 50);
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0x5b6b7c,
            roughness: 0.1,
            metalness: 0.9,
        });

        const waterGeo = new THREE.BoxGeometry(50, 8, 50);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0066aa,
            roughness: 0.1,
            metalness: 0.7,
            transparent: true,
            opacity: 0.65
        });

        const grassGeo = new THREE.BoxGeometry(46, 35, 46);
        const grassMat = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });

        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                const tile = this.map[r][c];
                if (tile === TileType.EMPTY) continue;

                let mesh = null;
                const px = c * GRID_CELL_SIZE + 25;
                const pz = r * GRID_CELL_SIZE + 25;

                if (tile === TileType.BRICK) {
                    mesh = new THREE.Mesh(brickGeo, brickMat);
                    mesh.position.set(px, 24, pz);
                } else if (tile === TileType.STEEL) {
                    mesh = new THREE.Mesh(steelGeo, steelMat);
                    mesh.position.set(px, 29, pz);
                    
                    // 增加闪耀的赛博边缘线框
                    const edgeGeo = new THREE.EdgesGeometry(steelGeo);
                    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff });
                    const wire = new THREE.LineSegments(edgeGeo, edgeMat);
                    mesh.add(wire);
                } else if (tile === TileType.WATER) {
                    mesh = new THREE.Mesh(waterGeo, waterMat);
                    mesh.position.set(px, 4, pz);
                } else if (tile === TileType.GRASS) {
                    mesh = new THREE.Mesh(grassGeo, grassMat);
                    mesh.position.set(px, 17.5, pz);
                }

                if (mesh) {
                    this.scene.add(mesh);
                    this.wallMeshes[c + '_' + r] = mesh;
                }
            }
        }

        // 6. 初始化玩家坦克（放在地图中央安全区域）
        this.player = new PlayerTank(400, 400);
        this.player.health = 100;
        
        // 7. 部署本关敌人坦克
        const enemyCount = 4 + this.stage * 2;
        this.spawnEnemies(enemyCount);

        this.updateHUD();
    }

    // 砖墙被轰碎时触发 3D 清理
    onBrickDestroyed(col, row) {
        const key = col + '_' + row;
        const mesh = this.wallMeshes[key];
        if (mesh) {
            // 播放轰碎火花
            this.createExplosionParticles(col * GRID_CELL_SIZE + 25, row * GRID_CELL_SIZE + 25, '#e1523c');
            this.scene.remove(mesh);
            delete this.wallMeshes[key];
        }
    }

    // 生成敌军，防卡死判定
    spawnEnemies(count) {
        let spawned = 0;
        let attempts = 0;

        while (spawned < count && attempts < 100) {
            attempts++;
            const gridX = Math.floor(1 + Math.random() * (MAP_COLS - 2));
            const gridY = Math.floor(1 + Math.random() * (MAP_ROWS - 2));

            // 不能放在出生点太近
            const px = gridX * GRID_CELL_SIZE + 25;
            const py = gridY * GRID_CELL_SIZE + 25;
            const distToPlayer = Math.hypot(px - 400, py - 400);

            if (this.map[gridY][gridX] === TileType.EMPTY && distToPlayer > 200) {
                const enemyLevel = Math.random() < 0.65 ? 1 : (Math.random() < 0.85 ? 2 : 3);
                const enemy = new EnemyTank(px, py, enemyLevel);
                this.enemies.push(enemy);
                spawned++;
            }
        }
    }

    // 3D 复合坦克 Mesh 模型拼装
    createTank3D(color, isPlayer = false) {
        const group = new THREE.Group();

        // 底盘 Box
        const chassisGeo = new THREE.BoxGeometry(28, 9, 28);
        const chassisMat = new THREE.MeshPhongMaterial({ color: color, shininess: 40 });
        const chassis = new THREE.Mesh(chassisGeo, chassisMat);
        chassis.position.y = 4.5;
        group.add(chassis);

        // 黑色运动履带
        const trackGeo = new THREE.BoxGeometry(6, 11, 32);
        const trackMat = new THREE.MeshPhongMaterial({ color: 0x1c1e24 });
        const leftTrack = new THREE.Mesh(trackGeo, trackMat);
        leftTrack.position.set(-14, 5.5, 0);
        const rightTrack = leftTrack.clone();
        rightTrack.position.x = 14;
        group.add(leftTrack);
        group.add(rightTrack);

        // 独立炮塔组
        const turretGroup = new THREE.Group();
        turretGroup.name = 'turretGroup';
        turretGroup.position.y = 11.5;

        const turretGeo = new THREE.BoxGeometry(18, 7, 18);
        const turretMat = new THREE.MeshPhongMaterial({ 
            color: color, 
            emissive: isPlayer ? 0x004444 : 0x440000,
            shininess: 60 
        });
        const turret = new THREE.Mesh(turretGeo, turretMat);
        turretGroup.add(turret);

        // 悬空炮管
        const barrelGeo = new THREE.CylinderGeometry(2, 2, 22, 8);
        barrelGeo.rotateX(Math.PI / 2); // 转向前方 Z
        const barrelMat = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.set(0, 0, 11);
        turretGroup.add(barrel);

        group.add(turretGroup);
        return group;
    }

    // 随机部署纳米补给箱
    spawnPowerUp(x, y) {
        const type = Math.random() < 0.5 ? 'health' : 'shield';
        const p = new PowerUp(x, y, type);
        this.powerUps.push(p);
    }

    // 部署呼叫战术大范围空袭
    triggerAirstrike() {
        if (!this.player || this.player.ammoAirstrike <= 0) {
            audio.playHit();
            return;
        }

        this.player.ammoAirstrike--;
        this.updateHUD();
        audio.playExplosion();
        this.screenShake = 16;

        // 空袭导弹范围洗地，瞬间打爆多名敌机，清扫废墟砖块
        const targetDir = new Vector2D(Math.cos(this.player.turretAngle), Math.sin(this.player.turretAngle));
        const startDist = 120;
        const strikeCenterX = this.player.pos.x + targetDir.x * startDist;
        const strikeCenterY = this.player.pos.y + targetDir.y * startDist;

        // 洗地范围内所有的实体
        setTimeout(() => {
            audio.playExplosion();
            
            // 轰碎砖块
            for (let r = 0; r < MAP_ROWS; r++) {
                for (let c = 0; c < MAP_COLS; c++) {
                    const tx = c * GRID_CELL_SIZE + 25;
                    const ty = r * GRID_CELL_SIZE + 25;
                    const dist = Math.hypot(tx - strikeCenterX, ty - strikeCenterY);
                    if (dist < 180 && this.map[r][c] === TileType.BRICK) {
                        this.map[r][c] = TileType.EMPTY;
                        this.onBrickDestroyed(c, r);
                    }
                }
            }

            // 范围重创敌人
            this.enemies.forEach(enemy => {
                const dist = enemy.pos.distanceTo(new Vector2D(strikeCenterX, strikeCenterY));
                if (dist < 180) {
                    enemy.takeDamage(100);
                    this.createExplosionParticles(enemy.pos.x, enemy.pos.y, '#ff8800');
                }
            });

            // 喷涌壮观的导弹烟花火焰粒子
            for (let i = 0; i < 40; i++) {
                const p = new Particle(strikeCenterX + (Math.random()-0.5)*80, strikeCenterY + (Math.random()-0.5)*80, '#ff4400');
                p.vel.multiply(1.5);
                this.particles.push(p);
            }
        }, 300);
    }

    // 触发粒子火花溅射
    createExplosionParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    // 主物理时钟更新
    update(dt) {
        if (this.gameState !== 'PLAYING') return;

        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt * 30);
        }

        // 1. 物理机动机件更新
        if (this.player) {
            this.player.update(this.keys, this.mousePos, this.map, dt);
            
            // 如果玩家跌落死亡
            if (this.player.health <= 0) {
                this.gameState = 'GAMEOVER';
                audio.playExplosion();
                document.getElementById('gameover-screen').classList.remove('hidden');
                document.exitPointerLock();
            }
        }

        // 2. 敌机决策循环
        this.enemies.forEach(enemy => {
            enemy.update(this.player.pos, this.map, dt);
            
            // 自动开火决策
            if (enemy.shootRequested) {
                enemy.shootRequested = false;
                const newB = enemy.fire();
                if (newB) this.bullets.push(newB);
            }
        });

        // 3. 弹药飞行轨迹与碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(this.map, dt);

            // 坦克和子弹的包围盒判定
            if (b.isPlayerOwned) {
                this.enemies.forEach(enemy => {
                    if (!b.shouldDestroy && b.pos.distanceTo(enemy.pos) < TANK_SIZE * 0.7) {
                        enemy.takeDamage(b.damage);
                        b.shouldDestroy = true;
                        this.createExplosionParticles(b.pos.x, b.pos.y, 'var(--primary)');
                    }
                });
            } else {
                if (this.player && !b.shouldDestroy && b.pos.distanceTo(this.player.pos) < TANK_SIZE * 0.7) {
                    this.player.takeDamage(b.damage);
                    b.shouldDestroy = true;
                    this.createExplosionParticles(b.pos.x, b.pos.y, 'var(--enemy)');
                    this.updateHUD();
                }
            }

            if (b.shouldDestroy) {
                this.bullets.splice(i, 1);
            }
        }

        // 4. 清理阵亡敌人，掉落积分和纳米箱
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.health <= 0) {
                this.createExplosionParticles(enemy.pos.x, enemy.pos.y, '#ff3333');
                audio.playExplosion();
                this.score += enemy.level * 100;
                
                // 掉落几率
                if (Math.random() < 0.45) {
                    this.spawnPowerUp(enemy.pos.x, enemy.pos.y);
                }
                
                // 从 Scene 中解构移除它的 3D 模型
                const mesh = this.enemyMeshes.get(enemy);
                if (mesh) {
                    this.scene.remove(mesh);
                    this.enemyMeshes.delete(enemy);
                }

                this.enemies.splice(i, 1);
                this.updateHUD();
            }
        }

        // 5. 纳米补给箱拾取
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.update(dt);

            if (this.player && this.player.pos.distanceTo(p.pos) < TANK_SIZE) {
                if (p.type === 'health') {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + 35);
                } else if (p.type === 'shield') {
                    this.player.isShielded = true;
                    this.player.shieldTimer = 6.0; // 纳米阻波盾，持续 6 秒无敌
                    this.player.shield = this.player.maxShield; // 立即充能恢复满常态护盾
                }
                audio.playSelect();
                p.shouldDestroy = true;
                
                const mesh = this.powerUpMeshes.get(p);
                if (mesh) {
                    this.scene.remove(mesh);
                    this.powerUpMeshes.delete(p);
                }
                
                this.powerUps.splice(i, 1);
                this.updateHUD();
            }
        }

        // 6. 磁暴休眠雷触发判定
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const mine = this.mines[i];
            mine.update(dt);

            this.enemies.forEach(enemy => {
                if (!mine.isTriggered && mine.pos.distanceTo(enemy.pos) < 55) {
                    mine.trigger(this.enemies, this);
                }
            });

            if (mine.shouldDestroy) {
                const mesh = this.mineMeshes.get(mine);
                if (mesh) {
                    this.scene.remove(mesh);
                    this.mineMeshes.delete(mine);
                }
                this.mines.splice(i, 1);
            }
        }

        // 7. 激光线段自毁时钟
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.update(dt);
            if (laser.life <= 0) {
                const mesh = this.laserMeshes.get(laser);
                if (mesh) {
                    this.scene.remove(mesh);
                    this.laserMeshes.delete(laser);
                }
                this.lasers.splice(i, 1);
            }
        }

        // 8. HUD 烟花火星碎屑粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 9. 判定通关，进入下一关或循环胜利
        if (this.enemies.length === 0) {
            audio.playSelect();
            this.loadStage(this.stage + 1);
        }
    }

    // 3D 渲染绘制管线
    draw() {
        // A. WebGL 3D 变换渲染
        if (this.player && this.gameState === 'PLAYING') {
            const cameraHeight = 13.5;
            
            // 设定第一人称相机的坐标
            this.camera.position.set(this.player.pos.x, cameraHeight, this.player.pos.y);
            
            // 将相机焦点对准玩家炮塔的绝对弧度前方
            const lookVectorX = Math.cos(this.player.turretAngle);
            const lookVectorY = Math.sin(this.player.turretAngle);
            const focusTarget = new THREE.Vector3(
                this.player.pos.x + lookVectorX * 100, 
                cameraHeight + (this.screenShake > 0 ? (Math.random()-0.5)*this.screenShake*0.1 : 0), 
                this.player.pos.y + lookVectorY * 100
            );
            this.camera.lookAt(focusTarget);

            // 前大灯光源追踪对齐
            this.headlight.position.copy(this.camera.position);
            this.headlight.target.position.copy(focusTarget);
        }

        // A2. 增量渲染敌机 3D 实体模型
        this.enemies.forEach(enemy => {
            let mesh = this.enemyMeshes.get(enemy);
            if (!mesh) {
                mesh = this.createTank3D(enemy.color);
                this.scene.add(mesh);
                this.enemyMeshes.set(enemy, mesh);
            }
            mesh.position.set(enemy.pos.x, 0, enemy.pos.y);
            mesh.rotation.y = -enemy.angle - Math.PI / 2;
            
            // 独立更新敌人炮塔相对朝向
            const turretMesh = mesh.getObjectByName('turretGroup');
            if (turretMesh) {
                turretMesh.rotation.y = -(enemy.turretAngle - enemy.angle);
            }
        });

        // A3. 增量渲染子弹 3D 实体
        const bulletGeo = new THREE.SphereGeometry(2, 6, 6);
        const playerBulMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const enemyBulMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });

        this.bullets.forEach(b => {
            let mesh = this.bulletMeshes.get(b);
            if (!mesh) {
                mesh = new THREE.Mesh(bulletGeo, b.isPlayerOwned ? playerBulMat : enemyBulMat);
                this.scene.add(mesh);
                this.bulletMeshes.set(b, mesh);
            }
            mesh.position.set(b.pos.x, 11, b.pos.y);
        });

        // 移除失效的子弹 3D meshes
        this.bulletMeshes.forEach((mesh, b) => {
            if (!this.bullets.includes(b)) {
                this.scene.remove(mesh);
                this.bulletMeshes.delete(b);
            }
        });

        // A4. 增量渲染补给箱
        this.powerUps.forEach(p => {
            let mesh = this.powerUpMeshes.get(p);
            if (!mesh) {
                const boxGeo = new THREE.BoxGeometry(10, 10, 10);
                const boxMat = new THREE.MeshPhongMaterial({
                    color: p.type === 'health' ? 0x10b981 : 0x00d2ff,
                    emissive: p.type === 'health' ? 0x023311 : 0x002233
                });
                mesh = new THREE.Mesh(boxGeo, boxMat);
                
                // 发光外边线
                const wireGeo = new THREE.EdgesGeometry(boxGeo);
                const wireMat = new THREE.LineBasicMaterial({ color: p.type === 'health' ? 0x10b981 : 0x00d2ff });
                mesh.add(new THREE.LineSegments(wireGeo, wireMat));
                
                this.scene.add(mesh);
                this.powerUpMeshes.set(p, mesh);
            }
            // 飘浮旋转动画
            mesh.position.set(p.pos.x, 10 + Math.sin(p.pulseTime) * 2, p.pos.y);
            mesh.rotation.y = p.pulseTime * 0.8;
            mesh.rotation.x = p.pulseTime * 0.4;
        });

        // A5. 渲染磁暴休眠雷 3D 盘
        this.mines.forEach(m => {
            let mesh = this.mineMeshes.get(m);
            if (!mesh) {
                const mineGeo = new THREE.CylinderGeometry(8, 8, 2, 8);
                const mineMat = new THREE.MeshPhongMaterial({ color: 0x00d2ff, emissive: 0x002233 });
                mesh = new THREE.Mesh(mineGeo, mineMat);
                mesh.position.y = 1;
                this.scene.add(mesh);
                this.mineMeshes.set(m, mesh);
            }
            mesh.position.set(m.pos.x, 1, m.pos.y);
            mesh.scale.set(1 + Math.sin(m.pulseTime)*0.1, 1, 1 + Math.sin(m.pulseTime)*0.1);
        });

        // A6. 渲染穿透激光
        this.lasers.forEach(l => {
            let mesh = this.laserMeshes.get(l);
            if (!mesh) {
                const distance = l.p1.distanceTo(l.p2);
                const lGeo = new THREE.CylinderGeometry(2, 2, distance, 8);
                lGeo.rotateX(Math.PI / 2);
                const lMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true });
                mesh = new THREE.Mesh(lGeo, lMat);
                
                // 将圆柱体放置到两点中心，并指向终点
                const midX = (l.p1.x + l.p2.x) / 2;
                const midY = (l.p1.y + l.p2.y) / 2;
                mesh.position.set(midX, 11.5, midY);
                
                const angle = Math.atan2(l.p2.y - l.p1.y, l.p2.x - l.p1.x);
                mesh.rotation.y = -angle + Math.PI / 2;
                
                this.scene.add(mesh);
                this.laserMeshes.set(l, mesh);
            }
            // 激光材质生命衰弱渐隐
            mesh.material.opacity = l.life / l.maxLife;
        });

        // 提交 WebGL 3D 渲染画面
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // ==============================================
        // B. 2D HUD 绘图叠层 (座舱轮廓、瞄准镜、粒子、雷达 minimap)
        // ==============================================
        const canvas = this.hudCanvas;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 如果在游戏运行状态，绘制全套高阶第一人称 HUD
        if (this.gameState === 'PLAYING' && this.player) {
            ctx.save();
            if (this.screenShake > 0) {
                // 震屏视觉效果
                ctx.translate((Math.random()-0.5)*this.screenShake, (Math.random()-0.5)*this.screenShake);
            }

            // B1. 绘制纳米火星粒子碎片
            this.particles.forEach(p => {
                // 将 3D 位置投影到 2D HUD 画布上
                const p3d = new THREE.Vector3(p.pos.x, p.z, p.pos.y);
                p3d.project(this.camera);
                
                // 仅渲染屏幕前半球可见的粒子
                if (p3d.z <= 1) {
                    const screenX = (p3d.x * 0.5 + 0.5) * canvas.width;
                    const screenY = (-p3d.y * 0.5 + 0.5) * canvas.height;
                    
                    const lifeRatio = Math.max(0, p.life / p.maxLife);
                    ctx.save();
                    ctx.globalAlpha = lifeRatio;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, p.size * (0.5 + lifeRatio * 0.5), 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 6;
                    ctx.fill();
                    ctx.restore();
                }
            });

            // B2. 绘制高科技座舱装甲 HUD 框线
            this.drawCockpitHUD(ctx, canvas);

            // B3. 绘制旋转的战术雷达 Minimap
            this.drawRadar(ctx, canvas, this.player);

            // B3.1 绘制屏幕边缘后方/侧方威胁警报指示器
            this.drawThreatIndicators(ctx, canvas);

            // B4. 非指针锁定时绘制激活指针提示
            if (!this.isPointerLocked && !('ontouchstart' in window)) {
                ctx.fillStyle = 'rgba(10, 13, 20, 0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#00f0ff';
                ctx.font = 'bold 1.1rem Outfit';
                ctx.textAlign = 'center';
                ctx.fillText('点击战术屏激活第一人称鼠标锁定', canvas.width / 2, canvas.height / 2 - 10);
                
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '0.85rem Fira Code';
                ctx.fillText('[ 按 ESC 解锁鼠标 ]', canvas.width / 2, canvas.height / 2 + 20);
            }
            ctx.restore();
        }
    }

    // 第一人称科幻机甲座舱大围框 HUD
    drawCockpitHUD(ctx, canvas) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // 1. 核心瞄准准星
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        // 中心圆环
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        // 十字刻度线
        ctx.moveTo(cx - 36, cy); ctx.lineTo(cx - 22, cy);
        ctx.moveTo(cx + 22, cy); ctx.lineTo(cx + 36, cy);
        ctx.moveTo(cx, cy - 36); ctx.lineTo(cx, cy - 22);
        ctx.moveTo(cx, cy + 22); ctx.lineTo(cx, cy + 36);
        ctx.stroke();

        // 准星外侧的测距折线
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy - 10); ctx.lineTo(cx - 70, cy + 10); ctx.lineTo(cx - 60, cy + 10);
        ctx.moveTo(cx + 70, cy - 10); ctx.lineTo(cx + 70, cy + 10); ctx.lineTo(cx + 60, cy + 10);
        ctx.stroke();

        // 2. 屏幕左右两侧的弧形电子状态刻度仪
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx - 160, cy, 140, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx + 160, cy, 140, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        // 3. 纳米护盾物理激活的量子滤镜闪烁
        if (this.player.isShielded) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.lineWidth = 4;
            ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
            
            ctx.fillStyle = 'rgba(0, 240, 255, 0.02)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 4. 双联电荷槽装弹读条 (环形)
        if (this.player.shootTimer > 0) {
            const reloadProgress = 1 - (this.player.shootTimer / this.player.shootCooldown);
            ctx.strokeStyle = 'rgba(255, 190, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 32, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * reloadProgress));
            ctx.stroke();
        }
    }

    // 旋转式高精战术 minimap 雷达系统
    drawRadar(ctx, canvas, player) {
        const rx = canvas.width - 100;
        const ry = canvas.height - 100;
        const radius = 70;

        ctx.save();
        
        // 1. 雷达圆形暗面背景
        ctx.fillStyle = 'rgba(10, 13, 20, 0.85)';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rx, ry, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. 内部同心圆网线
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(rx, ry, radius * 0.4, 0, Math.PI * 2);
        ctx.arc(rx, ry, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // 十字极坐标参考刻度
        ctx.beginPath();
        ctx.moveTo(rx - radius, ry); ctx.lineTo(rx + radius, ry);
        ctx.moveTo(rx, ry - radius); ctx.lineTo(rx, ry + radius);
        ctx.stroke();

        // 3. 扫描辉光带
        const sweepAngle = (performance.now() / 320) % (Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.arc(rx, ry, radius, sweepAngle, sweepAngle + 0.35);
        ctx.closePath();
        ctx.fill();

        // 4. 将 2D 实体位置换算投影到旋转坐标上
        const scale = 0.16; // 1像素的物理范围缩放到 0.16雷达像素
        
        // Bricks and Steel Blocks
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                const tile = this.map[r][c];
                if (tile === TileType.BRICK || tile === TileType.STEEL) {
                    const tx = c * GRID_CELL_SIZE + 25;
                    const ty = r * GRID_CELL_SIZE + 25;
                    
                    const dx = tx - player.pos.x;
                    const dy = ty - player.pos.y;
                    
                    // 以玩家炮塔转向视角逆向旋转整个雷达图 (实现主视角永远朝上)
                    const rotX = dx * Math.cos(-player.turretAngle - Math.PI/2) - dy * Math.sin(-player.turretAngle - Math.PI/2);
                    const rotY = dx * Math.sin(-player.turretAngle - Math.PI/2) + dy * Math.cos(-player.turretAngle - Math.PI/2);
                    
                    const px = rx + rotX * scale;
                    const py = ry + rotY * scale;

                    if (Math.hypot(px - rx, py - ry) < radius - 2) {
                        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
                    }
                }
            }
        }

        // Enemies
        const flash = Math.sin(performance.now() / 90) > 0;
        this.enemies.forEach(enemy => {
            const dx = enemy.pos.x - player.pos.x;
            const dy = enemy.pos.y - player.pos.y;
            
            const rotX = dx * Math.cos(-player.turretAngle - Math.PI/2) - dy * Math.sin(-player.turretAngle - Math.PI/2);
            const rotY = dx * Math.sin(-player.turretAngle - Math.PI/2) + dy * Math.cos(-player.turretAngle - Math.PI/2);
            
            const px = rx + rotX * scale;
            const py = ry + rotY * scale;

            if (Math.hypot(px - rx, py - ry) < radius - 2) {
                ctx.fillStyle = flash ? '#ff3333' : '#880000';
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 5. 玩家箭头标志在雷达中央指向头前 (第一视角直接恒定向正前)
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(rx, ry - 6);
        ctx.lineTo(rx - 4.5, ry + 4.5);
        ctx.lineTo(rx + 4.5, ry + 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // 屏幕边缘侧后方威胁雷达预警指示器
    drawThreatIndicators(ctx, canvas) {
        if (!this.player || this.enemies.length === 0) return;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.42;

        this.enemies.forEach(enemy => {
            const toEnemy = enemy.pos.clone().subtract(this.player.pos);
            const dist = toEnemy.magnitude();
            const enemyAngle = Math.atan2(toEnemy.y, toEnemy.x);
            
            let relAngle = enemyAngle - this.player.turretAngle;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;

            // 如果敌人在玩家视野外（左右大于 55 度）
            if (Math.abs(relAngle) > 55 * Math.PI / 180) {
                const angleOnScreen = relAngle - Math.PI / 2;
                const drawX = cx + Math.cos(angleOnScreen) * radius;
                const drawY = cy + Math.sin(angleOnScreen) * radius;

                // 距离越近，警报红色越强烈，并带呼吸灯效果
                const intensity = Math.max(0.1, Math.min(1.0, 1 - dist / 500));
                
                ctx.save();
                ctx.translate(drawX, drawY);
                ctx.rotate(angleOnScreen);

                // 绘制红色警报指示箭头
                ctx.fillStyle = `rgba(255, 30, 30, ${intensity * (0.6 + 0.4 * Math.sin(performance.now() / 100))})`;
                ctx.shadowColor = '#ff1e1e';
                ctx.shadowBlur = 8;
                
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-6, 4);
                ctx.lineTo(6, 4);
                ctx.closePath();
                ctx.fill();

                // 绘制距离提示文本
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = '8px Fira Code';
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.floor(dist)}m`, 0, 16);

                ctx.restore();
            }
        });
    }

    updateHUD() {
        if (!this.player) return;
        
        document.getElementById('score-display').innerText = String(this.score).padStart(5, '0');
        document.getElementById('stage-display').innerText = String(this.stage).padStart(2, '0');
        document.getElementById('enemies-left-display').innerText = String(this.enemies.length).padStart(2, '0');
        
        const hpPercent = Math.max(0, (this.player.health / this.player.maxHealth) * 100);
        document.getElementById('health-bar').style.width = `${hpPercent}%`;

        const shPercent = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
        document.getElementById('shield-bar').style.width = `${shPercent}%`;

        if (document.getElementById('scatter-ammo')) document.getElementById('scatter-ammo').innerText = String(this.player.ammoScatter).padStart(2, '0');
        if (document.getElementById('laser-ammo')) document.getElementById('laser-ammo').innerText = String(this.player.ammoLaser).padStart(2, '0');
        if (document.getElementById('mine-ammo')) document.getElementById('mine-ammo').innerText = String(this.player.ammoMine).padStart(2, '0');
        if (document.getElementById('airstrike-ammo')) document.getElementById('airstrike-ammo').innerText = String(this.player.ammoAirstrike).padStart(2, '0');
        
        const ramEl = document.getElementById('ram-cooldown');
        if (ramEl) {
            if (this.player.ramCooldownTimer <= 0) {
                ramEl.innerText = 'READY';
                ramEl.style.color = 'var(--primary)';
            } else {
                ramEl.innerText = `${this.player.ramCooldownTimer.toFixed(1)}S`;
                ramEl.style.color = '#ff4444';
            }
        }

        // 高亮侧边栏武器状态
        const sidebarWeps = {
            'standard': document.getElementById('weapon-standard'),
            'scatter': document.getElementById('weapon-scatter'),
            'laser': document.getElementById('weapon-laser'),
            'mine': document.getElementById('weapon-mine'),
            'ram': document.getElementById('weapon-ram')
        };
        for (let t in sidebarWeps) {
            const el = sidebarWeps[t];
            if (el) {
                if (this.player.activeWeapon === t) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        }

        // 高亮触屏虚拟面板切换状态
        document.querySelectorAll('.m-wep-btn').forEach(btn => {
            if (btn.dataset.wep === this.player.activeWeapon) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            document.getElementById('pause-screen').classList.remove('hidden');
            document.exitPointerLock();
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            document.getElementById('pause-screen').classList.add('hidden');
            if (!('ontouchstart' in window)) {
                this.hudCanvas.requestPointerLock();
            }
        }
    }
}

// 统一循环引擎初始化
const game = new SteelTorrentGame();
let lastTime = performance.now();

function gameLoop(currentTime) {
    const dt = Math.min(0.08, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    game.update(dt);
    game.draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
