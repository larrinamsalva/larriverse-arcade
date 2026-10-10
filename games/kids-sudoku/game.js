import { SUDOKU_LEVELS, SUDOKU_CHAPTERS, sudokuConflicts, sudokuSolved } from "./puzzles.js";

const GAME_ID = "kids-sudoku";
const SAVE_KEY = "larriverse.kidsSudoku.v1";
const FRIENDS = ["🐱", "🦊", "🐸", "🐼"];
const $ = id => document.getElementById(id);
const levelCount = SUDOKU_LEVELS.length;

function loadProgress() {
  const fresh = { openLevel: 0, unlocked: 0, stars: Array(levelCount).fill(0),
    current: null, picture: false };
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (!raw || !Array.isArray(raw.stars) || raw.stars.length !== levelCount) return fresh;
    return {
      openLevel: Number.isInteger(raw.openLevel) && raw.openLevel >= 0 && raw.openLevel < levelCount ? raw.openLevel : 0,
      unlocked: Number.isInteger(raw.unlocked) && raw.unlocked >= 0 && raw.unlocked < levelCount ? raw.unlocked : 0,
      stars: raw.stars.map(s => Number.isInteger(s) && s >= 0 && s <= 3 ? s : 0),
      current: raw.current && typeof raw.current === "object" ? raw.current : null,
      picture: raw.picture === true,
    };
  } catch { return fresh; }
}
let progress = loadProgress();
progress.unlocked = Math.max(progress.unlocked, Math.max(0, progress.stars.findLastIndex(n => n > 0) + 1));
progress.unlocked = Math.min(levelCount - 1, progress.unlocked);
progress.openLevel = Math.min(progress.openLevel, progress.unlocked);
let index = progress.openLevel;
let level = SUDOKU_LEVELS[index];
let cells = [], notes = [], undoStack = [], chosen = -1, hints = 0, mistakes = 0;
let solved = false, pencil = false, picture = progress.picture, revealErrors = new Set();

function save(nextIndex = null) {
  const record = { openLevel: nextIndex ?? index, unlocked: progress.unlocked,
    stars: progress.stars, picture,
    current: nextIndex === null ? { level: index, cells: cells.join(""), hints, mistakes } : null };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(record)); }
  catch { /* Full or unavailable local storage must never block puzzle play. */ }
}
function safeCellString(value, base) {
  if (typeof value !== "string" || value.length !== base.size ** 2) return base.puzzle;
  return [...value].every((c, i) => {
    const number = Number(c);
    return Number.isInteger(number) && number >= 0 && number <= base.size &&
      (base.puzzle[i] === "0" || base.puzzle[i] === c);
  }) ? value : base.puzzle;
}
function buddy(text) { $("buddyMessage").textContent = text; }
function feedback(message, type = "") {
  const node = $("feedback");
  node.className = "puzzle-feedback" + (type ? " " + type : "");
  node.textContent = message;
}
function el(tag, className, label = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (label) node.textContent = label;
  return node;
}
function setHeader() {
  const stars = progress.stars.reduce((a, b) => a + b, 0);
  const cleared = progress.stars.filter(Boolean).length;
  $("levelName").textContent = "LEVEL " + (index + 1) + " OF " + levelCount + " · " + level.mode;
  $("puzzleName").textContent = level.title;
  $("stageDescription").textContent = level.size === 4
    ? "Start with little boxes and number friends. Find the missing 1, 2, 3, or 4!"
    : level.size === 6
      ? "Now each outlined box is 2 rows by 3 columns. Find every number from 1 to 6."
      : "You're playing classic Sudoku! Fill 1–9 in every row, column, and 3×3 box.";
  $("levelCounter").textContent = (index + 1) + " / " + levelCount;
  $("filledCounter").textContent = cells.filter(Boolean).length + " / " + (level.size ** 2);
  $("starCounter").textContent = stars + " / " + (levelCount * 3);
  $("hintCounter").textContent = String(hints);
  $("progressFill").style.width = (cleared / levelCount * 100) + "%";
  $("progressTrack").setAttribute("aria-valuenow", String(cleared));
  $("progressTrack").setAttribute("aria-valuetext", cleared + " of 60 Sudoku levels completed");
  $("pictureMode").disabled = level.size !== 4;
  $("pictureMode").textContent = level.size === 4
    ? (picture ? "🐱 Picture helpers: on" : "🐱 Picture helpers: off") : "🐱 Picture helpers: for mini grids";
  $("pictureMode").setAttribute("aria-pressed", String(picture && level.size === 4));
  $("noteMode").setAttribute("aria-pressed", String(pencil));
  $("noteMode").textContent = pencil ? "✏️ Pencil notes: on" : "✏️ Pencil notes: off";
}
function renderChapters() {
  const section = $("chapterTrack");
  section.replaceChildren();
  SUDOKU_CHAPTERS.forEach((part, i) => {
    const node = el("div", "chapter-tile" + (i === level.chapter ? " active" : "") +
      (part.to - 1 <= progress.unlocked && progress.stars.slice(part.from - 1, part.to).every(Boolean) ? " complete" : "") +
      (part.from - 1 > progress.unlocked ? " locked" : ""));
    const icon = el("div", "icon", ["🌈", "🐣", "🦊", "🌻", "🦉", "🏆"][i]);
    const title = el("strong", "", part.title);
    const sub = el("small", "", "Levels " + part.from + "–" + part.to + " · " + part.size + "×" + part.size);
    node.append(icon, title, sub);
    section.append(node);
  });
}
function renderSelect() {
  const select = $("levelSelect");
  select.replaceChildren();
  for (let i = 0; i <= progress.unlocked; i++) {
    const item = SUDOKU_LEVELS[i];
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = (progress.stars[i] ? "⭐ " : "○ ") +
      "Level " + (i + 1) + " · " + item.mode;
    select.append(option);
  }
  select.value = String(index);
}
function cellText(value) {
  return picture && level.size === 4 ? FRIENDS[value - 1] : String(value);
}
function renderBoard(keepFocus = false) {
  const board = $("sudokuBoard"), n = level.size, invalid = sudokuConflicts(cells, level);
  board.style.setProperty("--n", n);
  board.dataset.size = String(n);
  board.setAttribute("aria-label", n + " by " + n + " Sudoku, level " + (index + 1));
  board.replaceChildren();
  for (let i = 0; i < n * n; i++) {
    const row = Math.floor(i / n), col = i % n;
    const given = level.puzzle[i] !== "0";
    let classes = "sudoku-cell";
    if (given) classes += " given";
    else if (cells[i]) classes += " player-value";
    if (col === n - 1) classes += " right-edge";
    else if ((col + 1) % level.boxCols === 0) classes += " box-right";
    if (row === n - 1) classes += " bottom-edge";
    else if ((row + 1) % level.boxRows === 0) classes += " box-bottom";
    if (i === chosen) classes += " selected";
    if (cells[i] && i !== chosen && chosen >= 0 && cells[chosen] === cells[i]) classes += " same";
    if (invalid.has(i) || revealErrors.has(i)) classes += " conflict";
    const button = el("button", classes);
    button.type = "button";
    button.dataset.cell = String(i);
    button.setAttribute("aria-label", "Row " + (row + 1) + ", column " + (col + 1) +
      ", " + (given ? "given " : cells[i] ? "your number " : "empty ") +
      (cells[i] ? cells[i] : "") + (invalid.has(i) ? ", conflict" : ""));
    button.setAttribute("aria-pressed", String(chosen === i));
    if (given) button.setAttribute("aria-readonly", "true");
    if (cells[i]) {
      const span = el("span", picture && n === 4 ? "picture-num" : "", cellText(cells[i]));
      span.setAttribute("aria-hidden", "true");
      button.append(span);
    } else if (notes[i]?.length) {
      const tiny = el("span", "notes");
      for (let value = 1; value <= n; value++) tiny.append(el("span", "", notes[i].includes(value) ? String(value) : " "));
      tiny.setAttribute("aria-hidden", "true");
      button.append(tiny);
    }
    button.addEventListener("click", () => selectCell(i));
    board.append(button);
  }
  if (keepFocus && chosen >= 0) board.querySelector('[data-cell="' + chosen + '"]')?.focus({preventScroll: true});
}
function renderPad() {
  const pad = $("numberPad");
  pad.replaceChildren();
  for (let num = 1; num <= level.size; num++) {
    const btn = el("button", picture && level.size === 4 ? "picture" : "", cellText(num));
    btn.type = "button";
    btn.dataset.value = String(num);
    btn.setAttribute("aria-label", "Place number " + num);
    btn.addEventListener("click", () => setNumber(num));
    pad.append(btn);
  }
}
function render() {setHeader();renderChapters();renderSelect();renderBoard();renderPad()}
function selectCell(i, focus = true) {
  chosen = i;
  renderBoard(focus);
  if (level.puzzle[i] !== "0") {
    buddy("That number is a clue. Choose any empty square to add your own number.");
  } else {
    buddy("Row " + (Math.floor(i / level.size) + 1) + ", column " + (i % level.size + 1) + ". Check its row, column, and box!");
  }
}
function recordUndo() {
  if (chosen < 0) return;
  undoStack.push({ i: chosen, value: cells[chosen], note: [...notes[chosen]] });
  if (undoStack.length > 100) undoStack.shift();
}
function afterMove() {
  revealErrors = new Set();
  save();
  renderBoard();
  setHeader();
  const conflicts = sudokuConflicts(cells, level);
  if (conflicts.size) feedback("Oops! Two matching numbers share a row, column, or box. The pink cells show what to check.", "error");
  else feedback("Nice thinking! Keep checking each row, column, and outlined box.");
  if (sudokuSolved(cells, level)) completeLevel();
}
function setNumber(value) {
  if (solved) {feedback("Puzzle solved! Choose Next Level to continue.", "success");return}
  if (chosen < 0 || level.puzzle[chosen] !== "0") {
    feedback("Choose an empty square first. Given numbers cannot be changed."); return;
  }
  if (!Number.isInteger(value) || value < 1 || value > level.size) return;
  recordUndo();
  if (pencil) {
    const list = notes[chosen], p = list.indexOf(value);
    if (p >= 0) list.splice(p, 1); else list.push(value);
    feedback("Pencil note " + value + (p >= 0 ? " removed." : " added. Use Pencil notes: off when ready to place a number."));
    save(); renderBoard();return;
  }
  cells[chosen] = value;
  notes[chosen] = [];
  afterMove();
}
function erase() {
  if (solved || chosen < 0 || level.puzzle[chosen] !== "0") return;
  recordUndo();
  cells[chosen] = 0;notes[chosen] = [];
  afterMove();
}
function undo() {
  if (solved || !undoStack.length) return;
  const prev = undoStack.pop();
  if (level.puzzle[prev.i] !== "0") return;
  chosen = prev.i;cells[prev.i] = prev.value;notes[prev.i] = prev.note;
  afterMove();
  feedback("Last change undone. Try another number.");
}
function hint() {
  if (solved) return;
  let at = chosen;
  if (at < 0 || level.puzzle[at] !== "0" || cells[at] === Number(level.solution[at]))
    at = cells.findIndex((value, i) => level.puzzle[i] === "0" && value !== Number(level.solution[i]));
  if (at < 0) return;
  chosen = at;recordUndo();
  cells[at] = Number(level.solution[at]);notes[at] = [];hints++;
  buddy("Great question! In row " + (Math.floor(at / level.size) + 1) +
    ", column " + (at % level.size + 1) + ", the missing number is " + cells[at] + ". Compare its row, column, and box.");
  afterMove();feedback("💡 Hint placed in row " + (Math.floor(at / level.size) + 1) +
    ", column " + (at % level.size + 1) + ". Now try another cell!", "success");
}
function checkBoard() {
  if (solved) return;
  revealErrors = new Set();
  for (let i = 0; i < cells.length; i++) if (cells[i] && cells[i] !== Number(level.solution[i])) revealErrors.add(i);
  const missing = cells.filter(x => !x).length;
  if (revealErrors.size) {
    mistakes++;
    feedback(revealErrors.size + " number(s) need another look. Pink squares show where to try again.", "error");
    buddy("Check for repeats in the row, column, and smaller box. Try your pencil notes if stuck.");
  } else if (missing) feedback("So far so good! " + missing + " square(s) are still empty. Keep going.", "success");
  else completeLevel();
  renderBoard();setHeader();save();
}
function completeLevel() {
  if (solved) return;
  solved = true;
  const wasNew = progress.stars[index] === 0;
  const stars = hints === 0 && mistakes === 0 ? 3 : hints <= 2 && mistakes <= 2 ? 2 : 1;
  progress.stars[index] = Math.max(stars, progress.stars[index]);
  progress.unlocked = Math.max(progress.unlocked, Math.min(levelCount - 1, index + 1));
  save(index < levelCount - 1 ? index + 1 : index);
  if (wasNew) {
    try {
      window.LarriVerseArcade?.award?.(GAME_ID, {
        xp: 12 + Math.min(48, index + 1), kc: 3,
        score: (index + 1) * 100 + stars * 15, completed: true,
        catches: 1
      });
    } catch { /* Rewards should never stop the next puzzle. */ }
  }
  $("winTitle").textContent = index === 59 ? "🏆 All 60 levels complete!" : "🎉 Level " + (index + 1) + " solved!";
  $("winText").textContent = "You earned " + stars + " star" + (stars === 1 ? "" : "s") +
    "! " + (index === 59 ? "You're a Sudoku Champion!" : "Your next puzzle is unlocked. Keep going!");
  $("nextLevel").textContent = index === 59 ? "Replay the Sudoku Summit" : "Next Level " + (index + 2) + " →";
  $("celebration").hidden = false;
  feedback("✨ You solved every row, column, and box! Wonderful work.", "success");
  buddy(index === 59 ? "🏆 You mastered the whole 60-level adventure!" : "🌟 You've earned your next level. Ready for a new brain challenge?");
  render();$("celebration").scrollIntoView({behavior:"auto",block:"nearest"});
}
function startLevel(target, restore = false) {
  index = Math.max(0, Math.min(progress.unlocked, target));
  level = SUDOKU_LEVELS[index];
  cells = Array.from(level.puzzle, Number);
  if (restore && progress.current?.level === index) {
    cells = Array.from(safeCellString(progress.current.cells, level), Number);
    hints = Number.isInteger(progress.current.hints) ? Math.max(0, Math.min(999, progress.current.hints)) : 0;
    mistakes = Number.isInteger(progress.current.mistakes) ? Math.max(0, Math.min(999, progress.current.mistakes)) : 0;
  } else {hints = 0; mistakes = 0}
  notes = Array.from({length:level.size**2},()=>[]);
  undoStack = [];chosen = cells.findIndex((n, i) => level.puzzle[i] === "0");
  revealErrors = new Set();solved = false;pencil = false;
  $("celebration").hidden = true;
  if (level.size !== 4) picture = false;
  save();render();
  buddy(level.size === 4 ? "🐱 Begin with 1–4. Each little 2×2 box needs every number once!" :
    level.size === 6 ? "🦊 You are growing! Every 2×3 box needs 1–6." :
      "🦉 Sudoku Summit! Every 3×3 box, row, and column needs 1–9.");
  feedback("Choose an empty square and fill it. There is no timer. You can always use a free hint.");
}
$("numberPad").addEventListener("keydown", event => {
  if (!/^[1-9]$/.test(event.key)) return;
  const value = Number(event.key);
  if (value <= level.size) {event.preventDefault();setNumber(value)}
});
$("sudokuBoard").addEventListener("keydown", event => {
  const idx = Number(document.activeElement?.dataset.cell);
  if (!Number.isInteger(idx) || idx < 0 || idx >= level.size ** 2) return;
  let next = -1;
  if (event.key === "ArrowRight") next = idx % level.size === level.size - 1 ? idx : idx + 1;
  if (event.key === "ArrowLeft") next = idx % level.size === 0 ? idx : idx - 1;
  if (event.key === "ArrowDown") next = Math.min(idx + level.size, level.size ** 2 - 1);
  if (event.key === "ArrowUp") next = Math.max(idx - level.size, 0);
  if (next >= 0) {event.preventDefault();selectCell(next);return}
  if (/^[1-9]$/.test(event.key)) {event.preventDefault();setNumber(Number(event.key));selectCell(idx);return}
  if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    event.preventDefault();erase();selectCell(idx);
  }
});
document.addEventListener("keydown", event => {
  if (event.key.toLowerCase() === "h" && document.activeElement?.tagName !== "INPUT" &&
      document.activeElement?.tagName !== "SELECT" && !event.altKey && !event.ctrlKey) {
    event.preventDefault();hint();
  }
});
$("levelSelect").addEventListener("change", event => startLevel(Number(event.target.value)));
$("pictureMode").addEventListener("click", () => {
  if (level.size !== 4) return;
  picture = !picture;save();render();
});
$("noteMode").addEventListener("click", () => {pencil = !pencil;setHeader()});
$("eraseButton").addEventListener("click", erase);
$("undoButton").addEventListener("click", undo);
$("hintButton").addEventListener("click", hint);
$("checkButton").addEventListener("click", checkBoard);
$("resetButton").addEventListener("click", () => startLevel(index));
$("toggleGuide").addEventListener("click", () => {
  const guide = $("playGuide"),hidden = !guide.hidden;
  guide.hidden = hidden;
  $("toggleGuide").setAttribute("aria-expanded", String(!hidden));
});
$("nextLevel").addEventListener("click", () => startLevel(index === 59 ? 59 : index + 1));
window.addEventListener("larriverse:profile",()=>setHeader());
startLevel(index,true);
