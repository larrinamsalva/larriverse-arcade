import { CREATIVE_CHAPTERS, CREATIVE_PROMPTS } from "./prompts.js";

const GAME_ID = "creative-calm-cove";
const SAVE_KEY = "larriverse.creativeCalmCove.v1";
const canvas = document.querySelector("#artCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const $ = (id) => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const defaultSave = () => ({
  prompt: 0,
  completed: [],
  color: "#6f63c8",
  size: 9,
  symmetry: "none",
  snapshot: null,
  glow: false
});

let save = readSave();
let tool = "draw";
let drawing = false;
let last = null;
let history = [];
let future = [];

function readSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!raw || typeof raw !== "object") return defaultSave();
    return {
      prompt: Number.isInteger(raw.prompt) ? clamp(raw.prompt, 0, CREATIVE_PROMPTS.length - 1) : 0,
      completed: Array.isArray(raw.completed)
        ? [...new Set(raw.completed.filter((n) => Number.isInteger(n) && n >= 1 && n <= 80))]
        : [],
      color: /^#[0-9a-f]{6}$/i.test(raw.color || "") ? raw.color : "#6f63c8",
      size: Number.isFinite(raw.size) ? clamp(raw.size, 2, 34) : 9,
      symmetry: ["none", "mirror", "radial6", "radial8"].includes(raw.symmetry) ? raw.symmetry : "none",
      snapshot: typeof raw.snapshot === "string" && raw.snapshot.startsWith("data:image/png;base64,") ? raw.snapshot : null,
      glow: Boolean(raw.glow)
    };
  } catch {
    return defaultSave();
  }
}

function persist(snapshot = true) {
  try {
    if (snapshot) save.snapshot = canvas.toDataURL("image/png");
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    $("saveStatus").textContent = "Saved on this device.";
  } catch {
    save.snapshot = null;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {}
    $("saveStatus").textContent = "The canvas is still usable, but this browser could not save the picture.";
  }
}

function blank() {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function dataSnapshot() {
  return canvas.toDataURL("image/png");
}

function pushHistory(clearFuture = true) {
  const shot = dataSnapshot();
  if (history.at(-1) !== shot) history.push(shot);
  if (history.length > 24) history.shift();
  if (clearFuture) future = [];
}

function restoreData(url, updateSave = true) {
  const img = new Image();
  img.onload = () => {
    blank();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if (updateSave) persist();
  };
  img.src = url;
}

function loadSnapshot() {
  blank();
  if (!save.snapshot) {
    pushHistory(false);
    return;
  }
  const img = new Image();
  img.onload = () => {
    blank();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    pushHistory(false);
  };
  img.src = save.snapshot;
}

function undo() {
  if (history.length < 2) return;
  future.push(history.pop());
  restoreData(history.at(-1));
  $("saveStatus").textContent = "Undid the last change.";
}

function redo() {
  const next = future.pop();
  if (!next) return;
  history.push(next);
  restoreData(next);
  $("saveStatus").textContent = "Redid the change.";
}

function point(event) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - r.left) * canvas.width / r.width,
    y: (event.clientY - r.top) * canvas.height / r.height
  };
}

function rotate(p, angle) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const dx = p.x - cx;
  const dy = p.y - cy;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

function segments(a, b) {
  if (save.symmetry === "none") return [[a, b]];
  if (save.symmetry === "mirror") {
    return [
      [a, b],
      [{ x: canvas.width - a.x, y: a.y }, { x: canvas.width - b.x, y: b.y }]
    ];
  }
  const count = save.symmetry === "radial8" ? 8 : 6;
  return Array.from({ length: count }, (_, i) => [
    rotate(a, i * Math.PI * 2 / count),
    rotate(b, i * Math.PI * 2 / count)
  ]);
}

function drawSegment(a, b) {
  ctx.save();
  ctx.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over";
  ctx.strokeStyle = save.color;
  ctx.lineWidth = save.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const pair of segments(a, b)) {
    const p1 = pair[0];
    const p2 = pair[1];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.restore();
}

function beginDraw(event) {
  if (event.button !== undefined && event.button !== 0) return;
  drawing = true;
  last = point(event);
  canvas.setPointerCapture?.(event.pointerId);
  drawSegment(last, { x: last.x + 0.01, y: last.y + 0.01 });
}

function moveDraw(event) {
  if (!drawing) return;
  const next = point(event);
  drawSegment(last, next);
  last = next;
}

function endDraw() {
  if (!drawing) return;
  drawing = false;
  last = null;
  pushHistory();
  persist();
}

function stampEmoji(emoji, x = canvas.width / 2, y = canvas.height / 2) {
  pushHistory();
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = Math.max(42, save.size * 6) + 'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  let positions;
  if (save.symmetry === "none") positions = [{ x, y }];
  else if (save.symmetry === "mirror") positions = [{ x, y }, { x: canvas.width - x, y }];
  else {
    const count = save.symmetry === "radial8" ? 8 : 6;
    positions = Array.from({ length: count }, (_, i) => rotate({ x, y }, i * Math.PI * 2 / count));
  }
  positions.forEach((p) => ctx.fillText(emoji, p.x, p.y));
  ctx.restore();
  pushHistory();
  persist();
}

function spiroGarden() {
  pushHistory();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = canvas.width * 0.32;
  ctx.save();
  ctx.strokeStyle = save.color;
  ctx.lineWidth = Math.max(2, save.size * 0.55);
  ctx.globalAlpha = 0.85;
  ctx.lineCap = "round";
  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= 720; i++) {
      const t = i / 720 * Math.PI * 12;
      const rr = r * (0.58 + 0.16 * ring);
      const x = cx + Math.cos(t) * rr * Math.cos(t * 5 + ring * 0.7);
      const y = cy + Math.sin(t) * rr * Math.sin(t * 5 + ring * 0.7);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  pushHistory();
  persist();
  $("saveStatus").textContent = "Spiro Garden added. Decorate it any way you like.";
}

function creatureSpark() {
  pushHistory();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.save();
  ctx.fillStyle = save.color;
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 35, 118, 145, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + side * 115, cy + 5, 55, 92, side * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + side * 46, cy - 95);
    ctx.lineTo(cx + side * 110, cy - 165);
    ctx.lineTo(cx + side * 18, cy - 128);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * 42, cy - 25, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#24233a";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * 42, cy - 25, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#24233a";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + 35, 45, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
  pushHistory();
  persist();
  $("saveStatus").textContent = "Creature Spark added. Now make it yours.";
}

function renderPrompt() {
  const p = CREATIVE_PROMPTS[save.prompt];
  $("promptChapter").textContent = p.icon + " " + p.chapterName;
  $("promptText").textContent = p.prompt;
  $("promptCounter").textContent = p.id + " / " + CREATIVE_PROMPTS.length;
  $("promptSelect").value = String(save.prompt);
  $("completePrompt").textContent = save.completed.includes(p.id) ? "✓ Explored — make more" : "✓ I made something";
  const count = save.completed.length;
  $("creativeProgress").setAttribute("aria-valuenow", String(count));
  $("progressFill").style.width = (count / CREATIVE_PROMPTS.length * 100) + "%";
  $("progressText").textContent = count + " of " + CREATIVE_PROMPTS.length + " cards explored. Skip anything that does not feel fun today.";
  [...$("chapterTrack").children].forEach((node, i) => {
    node.classList.toggle("active", i === p.chapter);
    const ids = CREATIVE_PROMPTS.filter((x) => x.chapter === i).map((x) => x.id);
    node.classList.toggle("done", ids.every((id) => save.completed.includes(id)));
  });
  persist(false);
}

function setupPrompts() {
  $("promptSelect").innerHTML = CREATIVE_PROMPTS.map((p, i) =>
    '<option value="' + i + '">' + p.id + ". " + p.chapterName + "</option>"
  ).join("");
  $("chapterTrack").innerHTML = CREATIVE_CHAPTERS.map((c, i) =>
    '<button type="button" class="chapter-chip" data-chapter="' + i + '">' + c.icon + " " + c.name + "</button>"
  ).join("");

  $("previousPrompt").addEventListener("click", () => {
    save.prompt = (save.prompt + 79) % 80;
    renderPrompt();
  });
  $("nextPrompt").addEventListener("click", () => {
    save.prompt = (save.prompt + 1) % 80;
    renderPrompt();
  });
  $("promptSelect").addEventListener("change", (event) => {
    save.prompt = Number(event.target.value) || 0;
    renderPrompt();
  });
  $("chapterTrack").addEventListener("click", (event) => {
    const button = event.target.closest("[data-chapter]");
    if (!button) return;
    save.prompt = Number(button.dataset.chapter) * 10;
    renderPrompt();
  });
  $("completePrompt").addEventListener("click", () => {
    const id = CREATIVE_PROMPTS[save.prompt].id;
    const fresh = !save.completed.includes(id);
    if (fresh) {
      save.completed.push(id);
      save.completed.sort((a, b) => a - b);
      try {
        window.LarriVerseArcade?.award?.(GAME_ID, {
          xp: 5,
          kc: 1,
          score: save.completed.length * 100,
          completed: true,
          metric: { creativeCards: save.completed.length }
        });
      } catch {}
    }
    renderPrompt();
    $("saveStatus").textContent = fresh
      ? "Creative card explored — nice. Keep going or choose another."
      : "This card is already explored. You can make a totally different version.";
  });
}

function setupTools() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      tool = button.dataset.tool;
      document.querySelectorAll("[data-tool]").forEach((node) => {
        node.setAttribute("aria-pressed", String(node === button));
      });
    });
  });

  $("colorPicker").value = save.color;
  $("brushSize").value = save.size;
  $("brushValue").value = save.size;
  $("symmetryMode").value = save.symmetry;

  $("colorPicker").addEventListener("input", (event) => {
    save.color = event.target.value;
    persist(false);
  });
  $("brushSize").addEventListener("input", (event) => {
    save.size = Number(event.target.value);
    $("brushValue").value = save.size;
    persist(false);
  });
  $("symmetryMode").addEventListener("change", (event) => {
    save.symmetry = event.target.value;
    persist(false);
  });

  $("spiroButton").addEventListener("click", spiroGarden);
  $("creatureButton").addEventListener("click", creatureSpark);

  $("calmStage").setAttribute("aria-pressed", String(save.glow));
  $("canvasFrame").classList.toggle("calm-glow", save.glow);
  $("calmStage").addEventListener("click", () => {
    save.glow = !save.glow;
    $("calmStage").setAttribute("aria-pressed", String(save.glow));
    $("canvasFrame").classList.toggle("calm-glow", save.glow);
    persist(false);
  });

  $("undoButton").addEventListener("click", undo);
  $("redoButton").addEventListener("click", redo);

  $("clearButton").addEventListener("click", () => {
    if (!confirm("Clear this canvas? Your explored creative cards will stay saved.")) return;
    pushHistory();
    blank();
    pushHistory();
    persist();
  });

  document.querySelector(".sticker-row").addEventListener("click", (event) => {
    const button = event.target.closest("[data-sticker]");
    if (button) stampEmoji(button.dataset.sticker);
  });

  $("saveButton").addEventListener("click", () => persist());
  $("newCanvasButton").addEventListener("click", () => {
    if (!confirm("Start a new blank canvas? Export first if you want a copy of this picture.")) return;
    pushHistory();
    blank();
    pushHistory();
    persist();
    $("saveStatus").textContent = "Fresh canvas ready.";
  });

  $("exportButton").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "creative-calm-cove-" + Date.now() + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    $("saveStatus").textContent = "PNG export prepared.";
  });

  canvas.addEventListener("pointerdown", beginDraw);
  canvas.addEventListener("pointermove", moveDraw);
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);
  canvas.addEventListener("pointerleave", (event) => {
    if (drawing && event.buttons === 0) endDraw();
  });
}

loadSnapshot();
setupPrompts();
setupTools();
renderPrompt();
