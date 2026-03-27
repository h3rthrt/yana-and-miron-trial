"use strict";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CONFIG = {
  WIDTH: 480,
  HEIGHT: 720,

  GRAVITY: 0.45,
  FLAP_VELOCITY: -9.5,

  PIPE_WIDTH: 64,
  PIPE_GAP: 195,
  PIPE_SPEED: 3,
  PIPE_SPAWN_INTERVAL: 95,
  AUTO_SWITCH_EVERY: 5,

  CONFETTI_COUNT: 60,

  COLORS: {
    skyTop: "#c9e8ff",
    skyBottom: "#f0d9ff",
    ground: "#d4a4eb",

    yana: {
      body: "#f4a7b9",
      wing: "#f97ca0",
      beak: "#ff6b8a",
      eye: "#3d1f2d",
      blush: "#ffb3c6",
    },
    miron: {
      body: "#a8d8ea",
      wing: "#5bb5d5",
      beak: "#3a9fc4",
      eye: "#1a2a3d",
      blush: "#b8e8f8",
    },

    pipes: ["#ffb3ba", "#ffddb3", "#b3f0d4", "#b3d4ff", "#e8b3ff"],
    confetti: [
      "#ff8fab",
      "#ffb347",
      "#a8d8ea",
      "#c9b8f0",
      "#98d8a8",
      "#ffd166",
    ],
  },
};

// ─── CANVAS SETUP ─────────────────────────────────────────────────────────────

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = CONFIG.WIDTH;
canvas.height = CONFIG.HEIGHT;

function resizeCanvas() {
  const scaleX = window.innerWidth / CONFIG.WIDTH;
  const scaleY = window.innerHeight / CONFIG.HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  canvas.style.width = `${CONFIG.WIDTH * scale}px`;
  canvas.style.height = `${CONFIG.HEIGHT * scale}px`;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHeart(cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.25);
  ctx.bezierCurveTo(
    cx - size,
    cy - size * 0.4,
    cx - size * 1.4,
    cy + size * 0.5,
    cx,
    cy + size,
  );
  ctx.bezierCurveTo(
    cx + size * 1.4,
    cy + size * 0.5,
    cx + size,
    cy - size * 0.4,
    cx,
    cy + size * 0.25,
  );
  ctx.closePath();
}

function drawStar(cx, cy, size) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerA = (i * 4 * Math.PI) / 10 - Math.PI / 2;
    const innerA = outerA + Math.PI / 5;
    const ox = cx + Math.cos(outerA) * size;
    const oy = cy + Math.sin(outerA) * size;
    const ix = cx + Math.cos(innerA) * size * 0.4;
    const iy = cy + Math.sin(innerA) * size * 0.4;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
}

// ─── CHARACTER ────────────────────────────────────────────────────────────────

class Character {
  constructor(name, colors, image) {
    this.name = name;
    this.colors = colors;
    this.image = image;
    this.reset();
  }

  reset() {
    this.x = 110;
    this.y = CONFIG.HEIGHT / 2;
    this.vy = 0;
    this.angle = 0;
    this.alive = true;
  }

  flap() {
    this.vy = CONFIG.FLAP_VELOCITY;
  }

  update() {
    this.vy += CONFIG.GRAVITY;
    this.y += this.vy;
    this.angle = Math.atan2(this.vy * 0.09, 1);

    if (this.y < 18 || this.y > CONFIG.HEIGHT - 18) {
      this.alive = false;
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, r: 20 };
  }

  draw(wingAngle) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    this._drawBody(wingAngle);
    ctx.restore();
  }

  _drawBody() {
    const c = this.colors;
    const r = 30;

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(4, r + 8, r * 0.8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Colored ring border
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = c.body;
    ctx.fill();

    // White inner border
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // Photo clipped to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    if (this.image && this.image.complete && this.image.naturalWidth > 0) {
      const s = r * 2;
      const aspect = this.image.naturalHeight / this.image.naturalWidth;
      const imgH = s * aspect;
      ctx.drawImage(this.image, -s / 2, -imgH * 0.44, s, imgH);
    } else {
      ctx.fillStyle = c.body;
      ctx.fill();
    }
    ctx.restore();

    // Kawaii blush overlays
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = c.blush;
    ctx.beginPath();
    ctx.ellipse(-r * 0.62, r * 0.42, 9, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.62, r * 0.42, 9, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── PIPE ─────────────────────────────────────────────────────────────────────

class Pipe {
  constructor() {
    this.x = CONFIG.WIDTH + 30;
    this.gapY = 160 + Math.random() * (CONFIG.HEIGHT - 340);
    this.w = CONFIG.PIPE_WIDTH;
    this.passed = false;
    this.colorIndex = Math.floor(Math.random() * CONFIG.COLORS.pipes.length);
  }

  update() {
    this.x -= CONFIG.PIPE_SPEED;
  }

  isOffScreen() {
    return this.x + this.w < 0;
  }

  getTopRect() {
    return { x: this.x, y: 0, w: this.w, h: this.gapY - CONFIG.PIPE_GAP / 2 };
  }
  getBottomRect() {
    return {
      x: this.x,
      y: this.gapY + CONFIG.PIPE_GAP / 2,
      w: this.w,
      h: CONFIG.HEIGHT,
    };
  }

  draw() {
    const topH = this.gapY - CONFIG.PIPE_GAP / 2;
    const botY = this.gapY + CONFIG.PIPE_GAP / 2;
    const botH = CONFIG.HEIGHT - botY;
    this._drawStack(this.x, 0, this.w, topH, true);
    this._drawStack(this.x, botY, this.w, botH, false);
  }

  _drawStack(x, y, w, h, isTop) {
    if (h <= 0) return;
    const boxH = 50;
    const count = Math.ceil(h / boxH);
    const palette = CONFIG.COLORS.pipes;

    for (let i = 0; i < count; i++) {
      const bx = x + 2;
      const by = isTop ? h - (i + 1) * boxH : y + i * boxH;
      const bw = w - 4;
      const bh = Math.min(boxH - 2, isTop ? h - i * boxH : y + h - by);
      if (bh <= 0) continue;

      const color = palette[(this.colorIndex + i) % palette.length];

      // Box body
      ctx.fillStyle = color;
      roundRect(bx, by, bw, bh, 8);
      ctx.fill();

      // Shine overlay
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(bx, by, bw, bh * 0.35, 8);
      ctx.fill();

      // Ribbon vertical
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(bx + bw / 2 - 3, by, 6, bh);

      // Ribbon horizontal
      ctx.fillRect(bx, by + bh / 2 - 3, bw, 6);

      // Bow on the face edge of each box
      const bowY = isTop ? by : by + bh;
      this._drawBow(x + w / 2, bowY, color);
    }
  }

  _drawBow(cx, cy, color) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.85)";

    // Left lobe
    ctx.beginPath();
    ctx.ellipse(cx - 9, cy, 8, 5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Right lobe
    ctx.beginPath();
    ctx.ellipse(cx + 9, cy, 8, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Knot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}

// ─── PARTICLE ─────────────────────────────────────────────────────────────────

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 12;
    this.vy = -6 - Math.random() * 8;
    this.color =
      CONFIG.COLORS.confetti[
        Math.floor(Math.random() * CONFIG.COLORS.confetti.length)
      ];
    this.size = 4 + Math.random() * 7;
    this.life = 1.0;
    this.decay = 0.012 + Math.random() * 0.012;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.25;
    this.shape = Math.random() < 0.5 ? "rect" : "circle";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.35;
    this.vx *= 0.97;
    this.rot += this.rotV;
    this.life -= this.decay;
  }

  isDead() {
    return this.life <= 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    if (this.shape === "rect") {
      ctx.fillRect(
        -this.size / 2,
        -this.size * 0.3,
        this.size,
        this.size * 0.6,
      );
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ─── FLOATING BACKGROUND ELEMENT ──────────────────────────────────────────────

class Floater {
  constructor(anywhere) {
    this._reset(anywhere);
  }

  _reset(anywhere) {
    this.x = Math.random() * CONFIG.WIDTH;
    this.y = anywhere ? Math.random() * CONFIG.HEIGHT : -20;
    this.speed = 0.25 + Math.random() * 0.5;
    this.size = 7 + Math.random() * 10;
    this.alpha = 0.12 + Math.random() * 0.25;
    this.drift = (Math.random() - 0.5) * 0.35;
    this.type = Math.random() < 0.65 ? "heart" : "star";
    this.rot = Math.random() * Math.PI * 2;
  }

  update() {
    this.y += this.speed;
    this.x += this.drift;
    this.rot += 0.005;
    if (this.y > CONFIG.HEIGHT + 20) this._reset(false);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    if (this.type === "heart") {
      ctx.fillStyle = "#f4a7b9";
      drawHeart(0, -this.size * 0.5, this.size * 0.5);
    } else {
      ctx.fillStyle = "#ffd166";
      drawStar(0, 0, this.size * 0.5);
    }
    ctx.fill();
    ctx.restore();
  }
}

// ─── GAME ─────────────────────────────────────────────────────────────────────

class Game {
  constructor(yanaImg, mironImg) {
    this.yana = new Character("yana", CONFIG.COLORS.yana, yanaImg);
    this.miron = new Character("miron", CONFIG.COLORS.miron, mironImg);

    this.pipes = [];
    this.particles = [];
    this.floaters = Array.from({ length: 22 }, () => new Floater(true));

    this.state = {
      phase: "title",
      active: "yana",
      scores: { yana: 0, miron: 0 },
      pipesPassed: 0,
      switchFlash: 0,
      frame: 0,
      pipeTimer: 0,
      wingAngle: 0,
      wingDir: 1,
    };

    // Restart button rect (updated each frame in _drawGameOver)
    this._restartBtn = { x: 0, y: 0, w: 0, h: 0 };
    // Switch button rect (center-top, between the two badges)
    this._switchBtn = { x: CONFIG.WIDTH / 2 - 45, y: 8, w: 90, h: 38 };

    this._bindInput();
  }

  // ─── INPUT ──────────────────────────────────────────────────────────────

  _bindInput() {
    const onDown = (e) => {
      e.preventDefault();
      const coords = this._eventCoords(e);
      this._handleDown(coords.x, coords.y);
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        this._handleDown(null, null);
      }
    });
  }

  _eventCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.WIDTH / rect.width;
    const scaleY = CONFIG.HEIGHT / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  _handleDown(x, y) {
    const { phase } = this.state;

    if (phase === "title") {
      this._startGame();
      return;
    }

    if (phase === "gameover") {
      if (x !== null && this._hitTest(x, y, this._restartBtn)) {
        this._restartGame();
      } else if (x === null) {
        this._restartGame();
      }
      return;
    }

    if (phase === "playing") {
      // Switch button
      if (x !== null && this._hitTest(x, y, this._switchBtn)) {
        this._switchCharacter();
        return;
      }
      this._activeChar().flap();
    }
  }

  _hitTest(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  // ─── GAME STATE TRANSITIONS ─────────────────────────────────────────────

  _startGame() {
    this.state.phase = "playing";
    this.state.active = "yana";
    this.state.scores = { yana: 0, miron: 0 };
    this.state.pipesPassed = 0;
    this.state.switchFlash = 0;
    this.state.pipeTimer = 0;
    this.pipes = [];
    this.particles = [];
    this.yana.reset();
    this.miron.reset();
  }

  _restartGame() {
    this._startGame();
  }

  _gameOver() {
    this.state.phase = "gameover";
  }

  // ─── CHARACTER SWITCH ───────────────────────────────────────────────────

  _activeChar() {
    return this.state.active === "yana" ? this.yana : this.miron;
  }
  _inactiveChar() {
    return this.state.active === "yana" ? this.miron : this.yana;
  }

  _switchCharacter() {
    const outgoing = this._activeChar();
    this.state.active = this.state.active === "yana" ? "miron" : "yana";
    const incoming = this._activeChar();

    incoming.y = outgoing.y;
    incoming.vy = outgoing.vy * 0.5;
    incoming.alive = true;

    this.state.switchFlash = 22;
    this.state.pipesPassed = 0;

    for (let i = 0; i < CONFIG.CONFETTI_COUNT; i++) {
      this.particles.push(new Particle(incoming.x, incoming.y));
    }
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────────

  _update() {
    const s = this.state;
    s.frame++;

    // Wing flap animation
    s.wingAngle += 0.12 * s.wingDir;
    if (Math.abs(s.wingAngle) > 0.5) s.wingDir *= -1;

    for (const f of this.floaters) f.update();

    if (s.phase !== "playing") return;

    const active = this._activeChar();
    active.update();

    // Pipes
    s.pipeTimer++;
    if (s.pipeTimer >= CONFIG.PIPE_SPAWN_INTERVAL) {
      this.pipes.push(new Pipe());
      s.pipeTimer = 0;
    }

    for (const p of this.pipes) {
      p.update();
      // Scoring
      if (!p.passed && p.x + p.w < active.x) {
        p.passed = true;
        s.scores[s.active]++;
        s.pipesPassed++;
        if (s.pipesPassed >= CONFIG.AUTO_SWITCH_EVERY) {
          this._switchCharacter();
        }
      }
    }
    this.pipes = this.pipes.filter((p) => !p.isOffScreen());

    // Particles
    for (const p of this.particles) p.update();
    this.particles = this.particles.filter((p) => !p.isDead());

    // Switch flash countdown
    if (s.switchFlash > 0) s.switchFlash--;

    // Collision
    this._checkCollisions();
    if (!active.alive) this._gameOver();
  }

  _checkCollisions() {
    const b = this._activeChar().getBounds();
    for (const pipe of this.pipes) {
      for (const rect of [pipe.getTopRect(), pipe.getBottomRect()]) {
        const nearX = Math.max(rect.x, Math.min(b.x, rect.x + rect.w));
        const nearY = Math.max(rect.y, Math.min(b.y, rect.y + rect.h));
        if (Math.hypot(b.x - nearX, b.y - nearY) < b.r) {
          this._activeChar().alive = false;
          return;
        }
      }
    }
  }

  // ─── DRAW ───────────────────────────────────────────────────────────────

  _draw() {
    ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    switch (this.state.phase) {
      case "title":
        this._drawTitle();
        break;
      case "playing":
        this._drawPlaying();
        break;
      case "gameover":
        this._drawGameOver();
        break;
    }
  }

  _drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
    grad.addColorStop(0, CONFIG.COLORS.skyTop);
    grad.addColorStop(1, CONFIG.COLORS.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    for (const f of this.floaters) f.draw();
  }

  _drawTitle() {
    this._drawBackground();

    // Bobbing characters on title screen
    const t = this.state.frame;
    this.yana.x = CONFIG.WIDTH * 0.3;
    this.yana.y = CONFIG.HEIGHT * 0.58 + Math.sin(t * 0.05) * 10;
    this.yana.angle = Math.sin(t * 0.04) * 0.12;
    this.miron.x = CONFIG.WIDTH * 0.7;
    this.miron.y = CONFIG.HEIGHT * 0.58 + Math.sin(t * 0.05 + 1.2) * 10;
    this.miron.angle = Math.sin(t * 0.04 + 1.2) * 0.12;

    this.yana.draw(this.state.wingAngle);
    this.miron.draw(this.state.wingAngle);

    // Name labels under birds
    ctx.font = "bold 20px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#8a4fcf";
    ctx.fillText("Яна", this.yana.x, this.yana.y + 52);
    ctx.fillText("Мирон", this.miron.x, this.miron.y + 52);

    // Banner panel
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    roundRect(30, 80, CONFIG.WIDTH - 60, 200, 24);
    ctx.fill();

    // Decorative hearts at banner corners
    ctx.fillStyle = "#f4a7b9";
    drawHeart(60, 110, 10);
    ctx.fill();
    drawHeart(CONFIG.WIDTH - 60, 110, 10);
    ctx.fill();
    drawHeart(60, 260, 10);
    ctx.fill();
    drawHeart(CONFIG.WIDTH - 60, 260, 10);
    ctx.fill();

    // Title text
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 26px Nunito, sans-serif";
    ctx.fillText("Яна и Мирон:", CONFIG.WIDTH / 2, 148);

    ctx.fillStyle = "#c026d3";
    ctx.font = "bold 30px Nunito, sans-serif";
    ctx.fillText("Сквозь преграды", CONFIG.WIDTH / 2, 190);

    // Subtitle
    ctx.fillStyle = "#9333ea";
    ctx.font = "18px Nunito, sans-serif";
    ctx.fillText("Нажмите или тапните,", CONFIG.WIDTH / 2, 234);
    ctx.fillText("чтобы начать", CONFIG.WIDTH / 2, 258);
    ctx.restore();

    // Tap hint pulse
    const pulse = 0.7 + 0.3 * Math.sin(this.state.frame * 0.07);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = "bold 22px Nunito, sans-serif";
    ctx.fillStyle = "#c026d3";
    ctx.textAlign = "center";
    ctx.fillText(
      "▼ Tap / Click / Space ▼",
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT - 60,
    );
    ctx.restore();
  }

  _drawPlaying() {
    this._drawBackground();

    for (const p of this.pipes) p.draw();

    this._activeChar().draw(this.state.wingAngle);

    for (const p of this.particles) p.draw();

    // Switch flash
    if (this.state.switchFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${(this.state.switchFlash / 22) * 0.45})`;
      ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
      ctx.restore();
    }

    this._drawHUD();
  }

  _drawHUD() {
    const s = this.state;

    // Score badges
    this._drawBadge("yana", s.scores.yana, 14, 10, s.active === "yana");
    this._drawBadge(
      "miron",
      s.scores.miron,
      CONFIG.WIDTH - 104,
      10,
      s.active === "miron",
    );

    // Switch button
    const b = this._switchBtn;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    roundRect(b.x, b.y, b.w, b.h, 19);
    ctx.fill();
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 13px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("↔ смена", b.x + b.w / 2, b.y + b.h / 2 + 5);
    ctx.restore();

    // Auto-switch progress bar below switch button
    const barW = b.w - 10;
    const barX = b.x + 5;
    const barY = b.y + b.h + 4;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    roundRect(barX, barY, barW, 5, 3);
    ctx.fill();
    ctx.fillStyle = "#c084fc";
    const prog = Math.min(s.pipesPassed / CONFIG.AUTO_SWITCH_EVERY, 1);
    roundRect(barX, barY, barW * prog, 5, 3);
    ctx.fill();
  }

  _drawBadge(name, score, x, y, isActive) {
    const colors = CONFIG.COLORS[name];
    const t = this.state.frame;

    ctx.save();

    // Badge background
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    roundRect(x, y, 90, 44, 22);
    ctx.fill();

    if (isActive) {
      const pulse = 2 + Math.sin(t * 0.12) * 2;
      ctx.strokeStyle = colors.body;
      ctx.lineWidth = 3 + pulse * 0.4;
      ctx.shadowColor = colors.body;
      ctx.shadowBlur = 8 + pulse;
      roundRect(x, y, 90, 44, 22);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Mini photo
    const img = name === "yana" ? this.yana.image : this.miron.image;
    const pr = 16;
    ctx.translate(x + pr + 6, y + 22);

    // Colored ring
    ctx.beginPath();
    ctx.arc(0, 0, pr + 2, 0, Math.PI * 2);
    ctx.fillStyle = colors.body;
    ctx.fill();

    // Photo clipped
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, pr, 0, Math.PI * 2);
    ctx.clip();
    if (img && img.complete && img.naturalWidth > 0) {
      const s = pr * 2.5;
      const aspect = img.naturalHeight / img.naturalWidth;
      const imgH = s * aspect;
      ctx.drawImage(img, -s / 2, -imgH * 0.44, s, imgH);
    } else {
      ctx.fillStyle = colors.body;
      ctx.fill();
    }
    ctx.restore();

    // Score
    ctx.fillStyle = "#3d1f2d";
    ctx.font = "bold 20px Nunito, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(score, pr + 8, 7);

    ctx.restore();
  }

  _drawGameOver() {
    this._drawBackground();

    // Dim overlay
    ctx.fillStyle = "rgba(45, 27, 78, 0.55)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    // Panel
    const pw = 340,
      ph = 340;
    const px = (CONFIG.WIDTH - pw) / 2;
    const py = (CONFIG.HEIGHT - ph) / 2 - 20;

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(px, py, pw, ph, 28);
    ctx.fill();

    ctx.shadowColor = "#c084fc";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 3;
    roundRect(px, py, pw, ph, 28);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#7c3aed";
    ctx.font = "bold 34px Nunito, sans-serif";
    ctx.fillText("Игра окончена!", CONFIG.WIDTH / 2, py + 54);

    // Scores
    const sy = py + 100;
    ctx.font = "bold 22px Nunito, sans-serif";
    ctx.fillStyle = CONFIG.COLORS.yana.beak;
    ctx.fillText(`Яна:  ${this.state.scores.yana}`, CONFIG.WIDTH / 2, sy);
    ctx.fillStyle = CONFIG.COLORS.miron.beak;
    ctx.fillText(
      `Мирон: ${this.state.scores.miron}`,
      CONFIG.WIDTH / 2,
      sy + 44,
    );

    // Divider
    ctx.fillStyle = "#e9d5ff";
    ctx.fillRect(px + 30, sy + 64, pw - 60, 2);

    // Total
    const total = this.state.scores.yana + this.state.scores.miron;
    ctx.fillStyle = "#3d1f2d";
    ctx.font = "bold 26px Nunito, sans-serif";
    ctx.fillText(`Итого: ${total} `, CONFIG.WIDTH / 2, sy + 96);

    // Celebration message
    ctx.font = "17px Nunito, sans-serif";
    ctx.fillStyle = "#9333ea";
    const msg =
      total >= 10
        ? "Невероятно! Вы настоящие чемпионы! 🏆"
        : "Попробуйте ещё раз! 🎈";
    ctx.fillText(msg, CONFIG.WIDTH / 2, sy + 132);

    // Restart button
    const bw = 200,
      bh = 52;
    const bx = (CONFIG.WIDTH - bw) / 2;
    const by = py + ph - 74;
    this._restartBtn = { x: bx, y: by, w: bw, h: bh };

    const pulse = 0.88 + 0.12 * Math.sin(this.state.frame * 0.1);
    ctx.save();
    ctx.scale(1, pulse);
    const scaledBy = by / pulse;

    ctx.fillStyle = "#7c3aed";
    roundRect(bx, scaledBy, bw, bh, 26);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ещё раз!", CONFIG.WIDTH / 2, scaledBy + bh / 2 + 8);
    ctx.restore();
  }

  // ─── MAIN LOOP ──────────────────────────────────────────────────────────

  start() {
    const loop = () => {
      this._update();
      this._draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────

document.fonts.ready.then(() => {
  const yanaImg = new Image();
  const mironImg = new Image();
  let loaded = 0;
  const onLoad = () => {
    if (++loaded === 2) new Game(yanaImg, mironImg).start();
  };
  yanaImg.onload = onLoad;
  mironImg.onload = onLoad;
  yanaImg.onerror = onLoad; // start anyway if image fails
  mironImg.onerror = onLoad;
  yanaImg.src = "yana.webp";
  mironImg.src = "miron.webp";
});
