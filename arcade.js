const games = [
  { id: "snake", name: "Snake", genre: "Classics", year: "1976", glyph: "S", color: "#d6ff57", instruction: "Arrows to steer. Eat the dots. Don't eat yourself." },
  { id: "pong", name: "Pong", genre: "Classics", year: "1972", glyph: "Ⅱ", color: "#ff7558", instruction: "Move your paddle with ↑ ↓ or W S." },
  { id: "breakout", name: "Breakout", genre: "Action", year: "1976", glyph: "▤", color: "#73d9d0", instruction: "Move with ← →. Clear every brick." },
  { id: "invaders", name: "Space Invaders", genre: "Action", year: "1978", glyph: "✳", color: "#ff7558", instruction: "← → to move, SPACE to fire. Don't let them land." },
  { id: "asteroids", name: "Asteroids", genre: "Action", year: "1979", glyph: "✦", color: "#d6ff57", instruction: "A / D to turn, W to thrust, SPACE to blast." },
  { id: "frogger", name: "Frogger", genre: "Classics", year: "1981", glyph: "⌁", color: "#73d9d0", instruction: "Hop with the arrows. Reach the top without getting squished." },
  { id: "maze", name: "Maze Chase", genre: "Classics", year: "1980", glyph: "◉", color: "#ffca63", instruction: "Collect every dot. Avoid the roaming chaser." },
  { id: "bomber", name: "Bomb Squad", genre: "Action", year: "1983", glyph: "✹", color: "#ff7558", instruction: "Move with arrows, SPACE to drop a bomb. Keep moving!" },
  { id: "kong", name: "Barrel Hop", genre: "Classics", year: "1981", glyph: "↗", color: "#ffca63", instruction: "← → to run, SPACE to jump. Grab the star up top." },
  { id: "galaga", name: "Galaga", genre: "Action", year: "1981", glyph: "⌖", color: "#73d9d0", instruction: "← → to dodge, SPACE to fire at the formation." },
  { id: "lander", name: "Lunar Lander", genre: "Puzzle", year: "1979", glyph: "▽", color: "#d6ff57", instruction: "W to thrust, A / D to steer. Land gently on the pad." },
  { id: "ski", name: "Downhill", genre: "Action", year: "1981", glyph: "╱", color: "#73d9d0", instruction: "← → to slalom. Avoid the trees and keep your cool." },
  { id: "paddle", name: "Paddleball", genre: "Classics", year: "1978", glyph: "◒", color: "#ffca63", instruction: "← → to keep the ball up and clear the moving targets." },
  { id: "qbert", name: "Tile Hopper", genre: "Puzzle", year: "1982", glyph: "◇", color: "#ff7558", instruction: "Hop diagonally with the arrows and color every tile." },
  { id: "river", name: "River Raid", genre: "Action", year: "1982", glyph: "⌁", color: "#73d9d0", instruction: "← → to steer, SPACE to fire. Stay between the banks." },
  { id: "racer", name: "Turbo Racer", genre: "Action", year: "1983", glyph: "▰", color: "#ff7558", instruction: "← → to change lanes. Dodge traffic and go the distance." },
  { id: "tetris", name: "Tetris", genre: "Puzzle", year: "1984", glyph: "▦", color: "#73d9d0", instruction: "← → move, ↑ rotate, ↓ soft drop, SPACE hard drop." },
  { id: "jump", name: "Space Jump", genre: "Action", year: "1982", glyph: "↑", color: "#d6ff57", instruction: "← → to steer. Bounce from platform to platform." },
];

const grid = document.querySelector("#game-grid");
const dialog = document.querySelector("#cabinet");
const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const searchInput = document.querySelector("#game-search");
let activeFilter = "All";
let activeGame = null;
let state = null;
let raf = 0;
let lastFrame = 0;
let paused = false;
const keys = new Set();
const W = canvas.width;
const H = canvas.height;
const scoreNode = document.querySelector("#current-score");
const highNode = document.querySelector("#high-score");

function renderCatalog() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = games.filter((game) => (activeFilter === "All" || activeFilter === game.genre || activeFilter === "Classics" && game.genre === "Classics") && `${game.name} ${game.genre} ${game.year}`.toLowerCase().includes(query));
  grid.innerHTML = filtered.map((game, index) => `<article class="game-card" style="--accent:${game.color};animation-delay:${Math.min(index * 25, 250)}ms"><div class="game-art" aria-hidden="true"><span class="art-glyph">${game.glyph}</span></div><span class="game-index">${String(games.indexOf(game) + 1).padStart(2, "0")}</span><div class="game-info"><span class="game-tag">${game.genre.toUpperCase()}</span><h3 class="game-name">${game.name}</h3><div class="game-bottom"><span class="game-year">EST. ${game.year}</span><button class="play-button" type="button" data-play="${game.id}" aria-label="Play ${game.name}">PLAY<span>↗</span></button></div></div></article>`).join("");
  document.querySelector("#visible-count").textContent = String(filtered.length).padStart(2, "0");
  document.querySelector("#empty-state").hidden = filtered.length > 0;
}

document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
  renderCatalog();
}));
searchInput.addEventListener("input", renderCatalog);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !dialog.open && document.activeElement !== searchInput) { event.preventDefault(); searchInput.focus(); }
  if (event.key === "Escape" && dialog.open) { keys.clear(); }
  if (dialog.open && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
  if (dialog.open) keys.add(event.key.toLowerCase() === " " ? " " : event.key.toLowerCase());
});
document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase() === " " ? " " : event.key.toLowerCase()));
grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-play]");
  if (button) launch(games.find((game) => game.id === button.dataset.play));
});
document.querySelector("#close-game").addEventListener("click", closeGame);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeGame(); });
document.querySelector("#restart-game").addEventListener("click", () => startGame());
document.querySelector("#pause-game").addEventListener("click", () => {
  paused = !paused;
  document.querySelector("#pause-game span").textContent = paused ? "RESUME" : "PAUSE";
});
document.querySelectorAll("[data-key]").forEach((button) => {
  const press = (event) => { event.preventDefault(); keys.add(button.dataset.key.toLowerCase()); };
  const release = () => keys.delete(button.dataset.key.toLowerCase());
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
});

function launch(game) {
  activeGame = game;
  document.querySelector("#cabinet-title").textContent = game.name;
  document.querySelector("#cabinet-meta").textContent = `${game.genre.toUpperCase()} / EST. ${game.year}`;
  document.querySelector("#game-instructions").textContent = game.instruction;
  dialog.showModal();
  startGame();
}

function closeGame() {
  if (dialog.open) dialog.close();
  cancelAnimationFrame(raf);
  keys.clear();
  paused = false;
}

function startGame() {
  keys.clear();
  paused = false;
  document.querySelector("#pause-game span").textContent = "PAUSE";
  state = createState(activeGame.id);
  const high = Number(localStorage.getItem(`quarterclub:${activeGame.id}`) || 0);
  highNode.textContent = String(high).padStart(5, "0");
  updateScore(0);
  cancelAnimationFrame(raf);
  lastFrame = 0;
  frame();
}

function createState(id) {
  const s = { score: 0, over: false, tick: 0, particles: [] };
  if (id === "snake") Object.assign(s, { body: [{ x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 8 }, step: 0 });
  if (["pong", "breakout", "paddle"].includes(id)) Object.assign(s, { x: 240, y: id === "pong" ? 135 : 218, enemyY: 135, ball: { x: 240, y: 170, vx: id === "pong" ? -2.3 : 2.3, vy: 2.4 }, bricks: Array.from({ length: id === "paddle" ? 10 : 28 }, (_, i) => ({ x: 38 + i % 7 * 58, y: 42 + Math.floor(i / 7) * 19, on: true })) });
  if (["invaders", "galaga"].includes(id)) Object.assign(s, { x: 240, enemies: Array.from({ length: 21 }, (_, i) => ({ x: 72 + i % 7 * 54, y: 38 + Math.floor(i / 7) * 28, on: true })), shots: [], enemyShots: [], enemyDir: 1, fireCooldown: 0 });
  if (id === "asteroids") Object.assign(s, { x: 240, y: 135, angle: -Math.PI / 2, vx: 0, vy: 0, rocks: Array.from({ length: 7 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 11 + Math.random() * 13, vx: (Math.random() - .5) * 1.6, vy: (Math.random() - .5) * 1.6 })), shots: [] });
  if (["frogger", "maze", "bomber", "qbert"].includes(id)) Object.assign(s, { x: id === "qbert" ? 240 : 32, y: id === "qbert" ? 38 : 238, moveAt: 0, dots: Array.from({ length: 10 }, (_, i) => ({ x: 46 + i % 5 * 88, y: 43 + Math.floor(i / 5) * 72, on: true })), bombs: [], enemies: [{ x: 405, y: 100, dir: 1 }] });
  if (id === "qbert") Object.assign(s, { row: 0, col: 0, tiles: Array.from({ length: 6 }, (_, row) => Array(row + 1).fill(false)) });
  if (id === "kong") Object.assign(s, { x: 35, y: 225, vy: 0, onGround: true, star: true, barrels: [] });
  if (id === "lander") Object.assign(s, { x: 80, y: 75, vx: 1, vy: 0, angle: 0, fuel: 100 });
  if (id === "ski") Object.assign(s, { x: 240, obstacles: [], spawn: 0 });
  if (["river", "racer"].includes(id)) Object.assign(s, { x: 240, shots: [], obstacles: [], spawn: 0, distance: 0 });
  if (id === "tetris") Object.assign(s, { board: Array.from({ length: 18 }, () => Array(10).fill(0)), piece: null, drop: 0, moveAt: 0 });
  if (id === "jump") Object.assign(s, { x: 240, y: 210, vy: -2, platforms: Array.from({ length: 8 }, (_, i) => ({ x: 35 + Math.random() * 370, y: 244 - i * 31, on: true })), height: 0 });
  if (id === "maze") Object.assign(s, { dots: Array.from({ length: 24 }, (_, i) => ({ x: 34 + i % 8 * 58, y: 35 + Math.floor(i / 8) * 76, on: true })) });
  return s;
}

function updateScore(value) {
  state.score = Math.max(0, Math.floor(value));
  scoreNode.textContent = String(state.score).padStart(5, "0");
  const key = `quarterclub:${activeGame.id}`;
  const high = Math.max(Number(localStorage.getItem(key) || 0), state.score);
  localStorage.setItem(key, String(high));
  highNode.textContent = String(high).padStart(5, "0");
}

function frame(time = 0) {
  const dt = Math.min((time - lastFrame) / 16.67 || 1, 2);
  lastFrame = time;
  if (!paused && state && !state.over) update(dt);
  draw();
  raf = requestAnimationFrame(frame);
}

function down(...names) { return names.some((name) => keys.has(name)); }
function endGame(won = false) { state.over = true; state.won = won; }
function update(dt) {
  const id = activeGame.id;
  const s = state;
  s.tick += dt;
  if (id === "snake") {
    if (s.step++ > 7) {
      s.step = 0;
      if (down("arrowup", "w") && s.dir.y !== 1) s.dir = { x: 0, y: -1 };
      if (down("arrowdown", "s") && s.dir.y !== -1) s.dir = { x: 0, y: 1 };
      if (down("arrowleft", "a") && s.dir.x !== 1) s.dir = { x: -1, y: 0 };
      if (down("arrowright", "d") && s.dir.x !== -1) s.dir = { x: 1, y: 0 };
      const head = { x: s.body[0].x + s.dir.x, y: s.body[0].y + s.dir.y };
      if (head.x < 0 || head.x >= 24 || head.y < 0 || head.y >= 13 || s.body.some((p) => p.x === head.x && p.y === head.y)) return endGame();
      s.body.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) { updateScore(s.score + 10); s.food = { x: Math.floor(Math.random() * 24), y: Math.floor(Math.random() * 13) }; }
      else s.body.pop();
    }
  } else if (id === "pong") {
    s.y = clamp(s.y + (down("arrowup", "w") ? -4.5 : 0) + (down("arrowdown", "s") ? 4.5 : 0), 28, 242);
    s.enemyY = clamp(s.enemyY + Math.sign(s.ball.y - s.enemyY) * .55, 28, 242);
    s.ball.x += s.ball.vx * dt; s.ball.y += s.ball.vy * dt;
    if (s.ball.y < 8 || s.ball.y > 262) s.ball.vy *= -1;
    if (s.ball.vx < 0 && s.ball.x < 31 && Math.abs(s.ball.y - s.y) < 28) { s.ball.vx = Math.abs(s.ball.vx) + .1; updateScore(s.score + 5); }
    if (s.ball.vx > 0 && s.ball.x > 449 && Math.abs(s.ball.y - s.enemyY) < 28) s.ball.vx = -Math.abs(s.ball.vx);
    if (s.ball.x < -5) endGame();
    if (s.ball.x > 485) { updateScore(s.score + 10); s.ball = { x: 240, y: 130, vx: -2.5, vy: Math.random() > .5 ? 1.8 : -1.8 }; }
  } else if (id === "breakout" || id === "paddle") {
    s.x = clamp(s.x + (down("arrowleft", "a") ? -5 : 0) + (down("arrowright", "d") ? 5 : 0), 30, 450);
    s.ball.x += s.ball.vx * dt; s.ball.y += s.ball.vy * dt;
    if (s.ball.x < 8 || s.ball.x > 472) s.ball.vx *= -1;
      if (s.ball.x < s.x + 39 && s.ball.x > s.x - 39 && s.ball.y > 209 && s.ball.y < 225 && s.ball.vy > 0) { s.ball.vy *= -1; s.ball.vx += (s.ball.x - s.x) * .035; }
      if (s.ball.y < 15) s.ball.vy = Math.abs(s.ball.vy);
      for (const b of s.bricks) if (b.on && Math.abs(b.x - s.ball.x) < 25 && Math.abs(b.y - s.ball.y) < 10) { b.on = false; s.ball.vy *= -1; updateScore(s.score + 10); break; }
      if (s.ball.y > 275) { if (id === "breakout") endGame(); else { s.ball = { x: 240, y: 170, vx: 2, vy: -2.5 }; } }
    if (s.bricks.every((b) => !b.on)) endGame(true);
  } else if (id === "invaders" || id === "galaga") {
    s.x = clamp(s.x + (down("arrowleft", "a") ? -3.2 : 0) + (down("arrowright", "d") ? 3.2 : 0), 16, 464);
    s.fireCooldown -= dt;
    if (down(" ") && s.fireCooldown <= 0) { s.shots.push({ x: s.x, y: 238 }); s.fireCooldown = 12; }
    const living = s.enemies.filter((e) => e.on);
    if (living.length && (Math.max(...living.map((e) => e.x)) > 445 || Math.min(...living.map((e) => e.x)) < 35)) { s.enemyDir *= -1; living.forEach((e) => e.y += 9); }
    living.forEach((e) => e.x += s.enemyDir * .45 * dt);
    s.shots.forEach((shot) => shot.y -= 5 * dt); s.shots = s.shots.filter((shot) => shot.y > -5);
    s.shots.forEach((shot) => { const enemy = living.find((e) => Math.abs(e.x - shot.x) < 15 && Math.abs(e.y - shot.y) < 12); if (enemy) { enemy.on = false; shot.y = -10; updateScore(s.score + 10); } });
    if (living.some((e) => e.y > 220)) endGame();
    if (!living.length) { updateScore(s.score + 50); s.enemies = Array.from({ length: 21 }, (_, i) => ({ x: 72 + i % 7 * 54, y: 38 + Math.floor(i / 7) * 28, on: true })); }
  } else if (id === "asteroids") {
    if (down("a", "arrowleft")) s.angle -= .055 * dt;
    if (down("d", "arrowright")) s.angle += .055 * dt;
    if (down("w", "arrowup")) { s.vx += Math.cos(s.angle) * .07 * dt; s.vy += Math.sin(s.angle) * .07 * dt; }
    s.x = wrap(s.x + s.vx * dt, W); s.y = wrap(s.y + s.vy * dt, H); s.vx *= .995; s.vy *= .995;
    if (down(" ") && Math.floor(s.tick) % 9 === 0 && !s.shots.some((shot) => shot.life > 18)) s.shots.push({ x: s.x, y: s.y, vx: Math.cos(s.angle) * 4, vy: Math.sin(s.angle) * 4, life: 0 });
    s.shots.forEach((shot) => { shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life += dt; }); s.shots = s.shots.filter((shot) => shot.life < 70);
    for (const rock of s.rocks) { rock.x = wrap(rock.x + rock.vx * dt, W); rock.y = wrap(rock.y + rock.vy * dt, H); const hit = s.shots.find((shot) => Math.hypot(shot.x - rock.x, shot.y - rock.y) < rock.r); if (hit) { rock.x = Math.random() * W; rock.y = Math.random() * H; hit.life = 100; updateScore(s.score + 10); } }
  } else if (id === "frogger" || id === "maze" || id === "bomber" || id === "qbert") {
    if (s.tick > s.moveAt) {
      let dx = 0, dy = 0;
      if (down("arrowleft", "a")) dx = -1;
      if (down("arrowright", "d")) dx = 1;
      if (down("arrowup", "w")) dy = -1;
      if (down("arrowdown", "s")) dy = 1;
      if (id === "qbert") {
        let row = s.row, col = s.col;
        if (down("arrowleft", "a")) row++;
        else if (down("arrowdown", "s")) { row++; col++; }
        else if (down("arrowup", "w")) { row--; col--; }
        else if (down("arrowright", "d")) row--;
        if (row >= 0 && row < s.tiles.length && col >= 0 && col <= row) {
          s.row = row; s.col = col; s.x = 240 + (col - row / 2) * 42; s.y = 39 + row * 33;
          if (!s.tiles[row][col]) { s.tiles[row][col] = true; updateScore(s.score + 10); }
          if (s.tiles.every((tiles) => tiles.every(Boolean))) endGame(true);
          s.moveAt = s.tick + 7;
        }
      } else {
        s.x = clamp(s.x + dx * (id === "frogger" ? 30 : 10), 18, 462); s.y = clamp(s.y + dy * (id === "frogger" ? 29 : 10), 20, 250);
        if (dx || dy) { s.moveAt = s.tick + (id === "frogger" ? 7 : 1.5); updateScore(s.score + 1); }
      }
    }
    if (id === "frogger") { if (s.y < 35) { updateScore(s.score + 50); s.x = 32 + Math.random() * 400; s.y = 238; } if (s.y > 80 && s.y < 205 && Math.floor(s.x / 60) % 2 === Math.floor(s.y / 50) % 2) endGame(); }
    if (id === "maze") { const dot = s.dots.find((d) => d.on && Math.hypot(d.x - s.x, d.y - s.y) < 18); if (dot) { dot.on = false; updateScore(s.score + 10); } const ghost = s.enemies[0]; ghost.x += Math.sign(s.x - ghost.x) * .4; ghost.y += Math.sign(s.y - ghost.y) * .35; if (Math.hypot(ghost.x - s.x, ghost.y - s.y) < 14) endGame(); if (s.dots.every((d) => !d.on)) endGame(); }
    if (id === "bomber" && down(" ") && !s.bombs.some((b) => b.x === s.x && b.y === s.y)) s.bombs.push({ x: s.x, y: s.y, fuse: 75 });
    s.bombs.forEach((b) => b.fuse -= dt); s.bombs.filter((b) => b.fuse <= 0).forEach((b) => { s.enemies.forEach((e) => { if (Math.abs(e.x - b.x) < 50 && Math.abs(e.y - b.y) < 50) { e.x = Math.random() * W; e.y = Math.random() * 190; updateScore(s.score + 25); } }); }); s.bombs = s.bombs.filter((b) => b.fuse > 0);
  } else if (id === "kong") {
    s.x = clamp(s.x + (down("arrowleft", "a") ? -2.6 : 0) + (down("arrowright", "d") ? 2.6 : 0), 12, 468);
    if (down(" ") && s.onGround) { s.vy = -5.5; s.onGround = false; }
    s.y += s.vy * dt; s.vy += .17 * dt;
    for (const y of [228, 178, 128, 78]) if (s.y >= y - 3 && s.y <= y + 7 && s.vy > 0) { s.y = y; s.vy = 0; s.onGround = true; }
    if (s.y < 46 && s.x > 410) { updateScore(s.score + 100); s.x = 30; s.y = 225; }
    if (s.tick % 90 < dt) s.barrels.push({ x: 435, y: 60, vx: -1.4 }); s.barrels.forEach((b) => { b.x += b.vx * dt; if (Math.abs(b.x - s.x) < 16 && Math.abs(b.y - s.y) < 15) endGame(); }); s.barrels = s.barrels.filter((b) => b.x > -10);
  } else if (id === "lander") {
    if (down("a", "arrowleft")) s.angle -= .035 * dt;
    if (down("d", "arrowright")) s.angle += .035 * dt;
    s.vy += .035 * dt;
    if (down("w", "arrowup") && s.fuel > 0) { s.vx += Math.sin(s.angle) * .09 * dt; s.vy -= Math.cos(s.angle) * .09 * dt; s.fuel -= .15 * dt; }
    s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .998;
    if (s.x < 0 || s.x > W || s.y > 254) { if (s.y > 242 && Math.abs(s.vy) < 1.1 && s.x > 190 && s.x < 285) { updateScore(s.score + 100); endGame(); } else if (s.y > 260) endGame(); else s.x = clamp(s.x, 0, W); }
  } else if (id === "ski") {
    s.x = clamp(s.x + (down("arrowleft", "a") ? -3 : 0) + (down("arrowright", "d") ? 3 : 0), 14, 466); s.spawn += dt;
    if (s.spawn > 22) { s.spawn = 0; s.obstacles.push({ x: 15 + Math.random() * 450, y: -5, type: Math.random() > .7 ? "rock" : "tree" }); }
    s.obstacles.forEach((o) => { o.y += 2.1 * dt; if (Math.abs(o.x - s.x) < 15 && Math.abs(o.y - 215) < 15) endGame(); }); s.obstacles = s.obstacles.filter((o) => o.y < H); updateScore(s.score + dt * .08);
  } else if (id === "river" || id === "racer") {
    s.x = clamp(s.x + (down("arrowleft", "a") ? -3 : 0) + (down("arrowright", "d") ? 3 : 0), 22, 458); s.spawn += dt; s.distance += dt;
    if (s.spawn > (id === "racer" ? 25 : 32)) { s.spawn = 0; s.obstacles.push({ x: 38 + Math.random() * 404, y: -20, w: id === "racer" ? 25 : 20 }); }
    s.obstacles.forEach((o) => { o.y += (id === "racer" ? 2.8 : 2.2) * dt; if (Math.abs(o.x - s.x) < o.w && Math.abs(o.y - 225) < 20) endGame(); }); s.obstacles = s.obstacles.filter((o) => o.y < H);
    if (down(" ") && Math.floor(s.tick) % 10 === 0 && !s.shots.some((shot) => shot.y < 70)) s.shots.push({ x: s.x, y: 215 });
    s.shots.forEach((shot) => shot.y -= 5 * dt); s.shots = s.shots.filter((shot) => shot.y > -5);
    s.obstacles = s.obstacles.filter((o) => { const hit = s.shots.some((shot) => Math.abs(shot.x - o.x) < o.w && Math.abs(shot.y - o.y) < 12); if (hit) updateScore(s.score + 10); return !hit; });
    if (id === "river" && (s.x < 55 + Math.sin(s.tick / 80) * 30 || s.x > 425 + Math.sin(s.tick / 80) * 30)) endGame();
    updateScore(s.score + dt * .08);
  } else if (id === "tetris") {
    if (!s.piece) spawnPiece(s);
    s.moveAt -= dt;
    if (s.moveAt <= 0) { if (down("arrowleft", "a")) { movePiece(s, -1, 0); s.moveAt = 8; } if (down("arrowright", "d")) { movePiece(s, 1, 0); s.moveAt = 8; } if (down("arrowdown", "s")) { movePiece(s, 0, 1); s.moveAt = 3; } if (down("arrowup", "w")) { rotatePiece(s); s.moveAt = 8; } }
    if (down(" ")) { while (movePiece(s, 0, 1)) {} lockPiece(s); }
    s.drop += dt;
    if (s.drop > 36) { s.drop = 0; if (!movePiece(s, 0, 1)) lockPiece(s); }
  } else if (id === "jump") {
    s.x = wrap(s.x + (down("arrowleft", "a") ? -3 : 0) + (down("arrowright", "d") ? 3 : 0), W); s.y += s.vy * dt; s.vy += .09 * dt;
    for (const p of s.platforms) if (p.on && s.vy > 0 && Math.abs(p.y - s.y - 8) < 3 && Math.abs(p.x - s.x) < 25) { s.vy = -4; updateScore(s.score + 10); }
    if (s.y < 115) { const shift = 115 - s.y; s.y = 115; s.platforms.forEach((p) => { p.y += shift; if (p.y > H) { p.y = 0; p.x = Math.random() * (W - 50) + 25; } }); updateScore(s.score + shift * .3); }
    if (s.y > H) endGame();
  }
}

function draw() {
  ctx.fillStyle = "#111d1a"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#ffffff09"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  if (!state || !activeGame) return;
  const s = state;
  const id = activeGame.id;
  if (id === "snake") { s.body.forEach((p, i) => box(p.x * 20 + 2, p.y * 20 + 2, 16, 16, i ? "#73d9d0" : "#d6ff57")); box(s.food.x * 20 + 5, s.food.y * 20 + 5, 10, 10, "#ff7558"); }
  else if (["pong", "breakout", "paddle"].includes(id)) {
    ctx.fillStyle = "#f5f1e8"; if (id === "pong") { ctx.fillRect(20, s.y - 24, 6, 48); ctx.fillRect(454, s.enemyY - 24, 6, 48); ctx.setLineDash([4, 7]); ctx.beginPath(); ctx.moveTo(240, 5); ctx.lineTo(240, 265); ctx.strokeStyle = "#58645d"; ctx.stroke(); ctx.setLineDash([]); } else { s.bricks.forEach((b, i) => { if (b.on) box(b.x - 23, b.y, 44, 10, ["#ff7558", "#ffca63", "#73d9d0"][Math.floor(i / 7) % 3]); }); ctx.fillRect(s.x - 38, 220, 76, 7); }
    ctx.fillRect(s.ball.x - 4, s.ball.y - 4, 8, 8);
  } else if (id === "invaders" || id === "galaga") { s.enemies.filter((e) => e.on).forEach((e, i) => pixelAlien(e.x, e.y, i % 3)); s.shots.forEach((b) => box(b.x - 2, b.y, 4, 9, "#d6ff57")); pixelShip(s.x, 242); }
  else if (id === "asteroids") { s.rocks.forEach((r) => { ctx.strokeStyle = "#d6ff57"; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); }); s.shots.forEach((b) => box(b.x, b.y, 3, 3, "#ff7558")); ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle + Math.PI / 2); ctx.fillStyle = "#73d9d0"; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, 9); ctx.lineTo(0, 5); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.restore(); }
  else if (["frogger", "maze", "bomber", "qbert"].includes(id)) {
    if (id === "frogger") { for (let y = 50; y < 235; y += 36) { ctx.fillStyle = y < 85 ? "#264238" : y < 200 ? "#174d59" : "#21362f"; ctx.fillRect(0, y, W, 32); } for (let i = 0; i < 6; i++) box((i * 81 + s.tick * (i % 2 ? 1 : -1)) % W, 105 + i % 3 * 30, 38, 14, "#b18b54"); }
    if (id === "maze") { for (let x = 20; x < W; x += 58) { ctx.strokeStyle = "#73d9d0"; ctx.strokeRect(x, 20, 38, 230); } s.dots.filter((d) => d.on).forEach((d) => box(d.x, d.y, 4, 4, "#ffca63")); ctx.fillStyle = "#ff7558"; ctx.beginPath(); ctx.arc(s.enemies[0].x, s.enemies[0].y, 8, 0, 7); ctx.fill(); }
    if (id === "bomber") { for (let i = 0; i < 9; i++) box(70 + i * 43, 80 + i % 2 * 70, 20, 20, "#51675b"); s.bombs.forEach((b) => { ctx.fillStyle = "#ff7558"; ctx.beginPath(); ctx.arc(b.x, b.y, 8 + Math.sin(s.tick) * 2, 0, 7); ctx.fill(); }); }
    if (id === "qbert") { for (let row = 0; row < 6; row++) for (let col = 0; col <= row; col++) { const x = 240 + (col - row / 2) * 42, y = 39 + row * 33; ctx.fillStyle = s.tiles[row][col] ? "#73d9d0" : (row * 3 + col) % 2 ? "#c85e49" : "#e3a64f"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20, y + 11); ctx.lineTo(x, y + 22); ctx.lineTo(x - 20, y + 11); ctx.closePath(); ctx.fill(); } }
    box(s.x - 7, s.y - 7, 14, 14, "#d6ff57");
  } else if (id === "kong") { [228, 178, 128, 78].forEach((y) => box(0, y, W, 5, "#ff7558")); for (let x = 100; x < 400; x += 105) box(x, 80, 6, 148, "#73d9d0"); s.barrels.forEach((b) => box(b.x, b.y, 12, 12, "#ffca63")); box(s.x - 6, s.y - 14, 12, 14, "#d6ff57"); if (s.y < 52) box(425, 40, 18, 18, "#ffca63"); }
  else if (id === "lander") { ctx.strokeStyle = "#68786d"; ctx.beginPath(); ctx.moveTo(0, 250); ctx.lineTo(175, 235); ctx.lineTo(190, 247); ctx.moveTo(285, 247); ctx.lineTo(310, 236); ctx.lineTo(W, 252); ctx.stroke(); ctx.fillStyle = "#d6ff57"; ctx.fillRect(190, 241, 95, 3); ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle); ctx.fillStyle = "#73d9d0"; ctx.fillRect(-7, -9, 14, 18); ctx.fillRect(-12, 7, 24, 3); ctx.restore(); box(16, 16, s.fuel, 3, "#ff7558"); }
  else if (id === "ski") { for (let i = 0; i < 16; i++) { const y = (i * 25 + s.tick * 2) % H, x = (i * 83) % W; ctx.fillStyle = "#73d9d0"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 19); ctx.lineTo(x + 9, y + 19); ctx.fill(); } s.obstacles.forEach((o) => { ctx.fillStyle = o.type === "rock" ? "#ff7558" : "#73d9d0"; ctx.fillRect(o.x - 6, o.y - 8, 12, 15); }); box(s.x - 3, 210, 6, 21, "#d6ff57"); }
  else if (id === "river" || id === "racer") { const bend = Math.sin(s.tick / 80) * 28; if (id === "river") { ctx.fillStyle = "#17515b"; ctx.fillRect(35 + bend, 0, 410, H); ctx.fillStyle = "#111d1a"; ctx.fillRect(0, 0, 55 + bend, H); ctx.fillRect(425 + bend, 0, 55, H); } else { ctx.fillStyle = "#263c34"; ctx.fillRect(55, 0, 370, H); ctx.strokeStyle = "#ecf0dc70"; ctx.setLineDash([13, 14]); ctx.beginPath(); ctx.moveTo(240, 0); ctx.lineTo(240, H); ctx.stroke(); ctx.setLineDash([]); }
    s.obstacles.forEach((o) => box(o.x - 8, o.y - 9, 16, 18, "#ff7558")); s.shots.forEach((o) => box(o.x - 2, o.y, 4, 8, "#d6ff57")); pixelShip(s.x, 226);
  } else if (id === "tetris") { for (let y = 0; y < 18; y++) for (let x = 0; x < 10; x++) if (s.board[y][x]) box(152 + x * 18, 12 + y * 13, 16, 11, s.board[y][x]); if (s.piece) s.piece.cells.forEach(([x, y]) => box(152 + (s.piece.x + x) * 18, 12 + (s.piece.y + y) * 13, 16, 11, s.piece.color)); ctx.strokeStyle = "#73d9d0"; ctx.strokeRect(151, 11, 182, 236); }
  else if (id === "jump") { s.platforms.forEach((p) => box(p.x - 15, p.y, 30, 5, "#73d9d0")); ctx.fillStyle = "#d6ff57"; ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, 7); ctx.fill(); }
  if (paused) centerText("PAUSED", "PRESS Ⅱ TO CONTINUE");
  if (s.over) centerText(s.won ? (id === "lander" ? "NICE LANDING" : "YOU WIN!") : "GAME OVER", "RESTART FOR ANOTHER ROUND");
}

function box(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function wrap(v, max) { return (v + max) % max; }
function pixelShip(x, y) { box(x - 3, y - 10, 6, 15, "#d6ff57"); box(x - 9, y + 1, 18, 4, "#73d9d0"); box(x - 5, y + 5, 10, 3, "#ff7558"); }
function pixelAlien(x, y, type) { const c = ["#73d9d0", "#ff7558", "#d6ff57"][type]; box(x - 7, y - 4, 14, 8, c); box(x - 10, y - 1, 4, 5, c); box(x + 6, y - 1, 4, 5, c); box(x - 4, y + 4, 3, 3, c); box(x + 2, y + 4, 3, 3, c); }
function centerText(title, subtitle) { ctx.fillStyle = "#101a18dd"; ctx.fillRect(0, 0, W, H); ctx.textAlign = "center"; ctx.fillStyle = "#d6ff57"; ctx.font = "bold 25px 'DM Mono', monospace"; ctx.fillText(title, W / 2, H / 2 - 3); ctx.fillStyle = "#f5f1e8"; ctx.font = "9px 'DM Mono', monospace"; ctx.fillText(subtitle, W / 2, H / 2 + 20); }

const pieces = [
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#ffca63" },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#73d9d0" },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#ff7558" },
  { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#d6ff57" },
  { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "#bd9aff" },
];
function spawnPiece(s) { const choice = pieces[Math.floor(Math.random() * pieces.length)]; s.piece = { ...choice, cells: choice.cells.map((p) => [...p]), x: 4, y: 0 }; if (collides(s, 0, 0)) endGame(); }
function collides(s, dx, dy, cells = s.piece.cells) { return cells.some(([x, y]) => { const nx = s.piece.x + x + dx, ny = s.piece.y + y + dy; return nx < 0 || nx >= 10 || ny >= 18 || ny >= 0 && s.board[ny][nx]; }); }
function movePiece(s, dx, dy) { if (!collides(s, dx, dy)) { s.piece.x += dx; s.piece.y += dy; return true; } return false; }
function rotatePiece(s) { const cells = s.piece.cells.map(([x, y]) => [2 - y, x]); if (!collides(s, 0, 0, cells)) s.piece.cells = cells; }
function lockPiece(s) { for (const [x, y] of s.piece.cells) { const row = s.piece.y + y; if (row >= 0) s.board[row][s.piece.x + x] = s.piece.color; } s.piece = null; const full = s.board.filter((row) => row.every(Boolean)).length; if (full) { s.board = Array.from({ length: full }, () => Array(10).fill(0)).concat(s.board.filter((row) => !row.every(Boolean))); updateScore(s.score + full * full * 100); } }

renderCatalog();