// app.js — Day 4: results screen wired up, leaderboard saving, clear button

// ── DOM refs ──
const snippetDisplay  = document.getElementById("snippet-display");
const typingInput     = document.getElementById("typing-input");
const focusPrompt     = document.getElementById("focus-prompt");
const wpmDisplay      = document.getElementById("wpm-display");
const accuracyDisplay = document.getElementById("accuracy-display");
const timerDisplay    = document.getElementById("timer-display");
const errorsDisplay   = document.getElementById("errors-display");
const progressFill    = document.getElementById("progress-fill");
const resultsOverlay  = document.getElementById("results-overlay");
const resultWpm       = document.getElementById("result-wpm");
const resultAcc       = document.getElementById("result-acc");
const resultErrors    = document.getElementById("result-errors");
const resultMsg       = document.getElementById("result-msg");
const restartBtn      = document.getElementById("restart-btn");
const clearBtn        = document.getElementById("clear-scores-btn");
const diffBtns        = document.querySelectorAll(".diff-btn");

// ── State ──
let currentSnippet = "";
let currentTokens  = [];
let currentLevel   = "easy";
let totalTyped     = 0;
let totalErrors    = 0;
let errorSet       = new Set();
let gameActive     = false;
let gameEnded      = false;

// ── Init ──
function initGame() {
  resetTimer();
  totalTyped  = 0;
  totalErrors = 0;
  errorSet.clear();
  gameActive  = false;
  gameEnded   = false;

  wpmDisplay.textContent      = "0";
  accuracyDisplay.textContent = "100";
  timerDisplay.textContent    = "60";
  timerDisplay.style.color    = "var(--text)";
  errorsDisplay.textContent   = "0";
  progressFill.style.width    = "0%";
  resultsOverlay.classList.add("hidden");

  currentSnippet = getSnippet(currentLevel);
  currentTokens  = tokenizeSnippet(currentSnippet);
  renderSnippet(currentTokens);

  typingInput.value = "";
  typingInput.focus();
  focusPrompt.classList.remove("hidden");
}

// ── Render snippet with syntax token colors ──
function renderSnippet(tokens) {
  snippetDisplay.innerHTML = tokens
    .map((token, i) => {
      const char =
        token.char === "\n" ? "\n" :
        token.char === "<"  ? "&lt;" :
        token.char === ">"  ? "&gt;" :
        token.char === " "  ? "&nbsp;" :
        token.char;
      return `<span id="c${i}" class="${token.cls}">${char}</span>`;
    })
    .join("");
  const first = document.getElementById("c0");
  if (first) first.classList.add("cursor");
}

// ── Typing handler ──
typingInput.addEventListener("input", handleInput);

function handleInput() {
  if (gameEnded) return;

  if (!gameActive && typingInput.value.length > 0) {
    gameActive = true;
    focusPrompt.classList.add("hidden");
    startTimer(
      (secsLeft) => {
        timerDisplay.textContent = secsLeft;
        timerDisplay.style.color = secsLeft <= 10 ? "var(--red)" : "var(--text)";
        updateStats();
      },
      endGame
    );
  }

  const typed = typingInput.value;
  totalTyped  = typed.length;

  for (let i = 0; i < currentTokens.length; i++) {
    const span = document.getElementById(`c${i}`);
    if (!span) continue;
    span.classList.remove("correct", "wrong", "cursor");
    if (i < typed.length) {
      if (typed[i] === currentTokens[i].char) {
        span.classList.add("correct");
        errorSet.delete(i);
      } else {
        span.classList.add("wrong");
        errorSet.add(i);
      }
    } else if (i === typed.length) {
      span.classList.add("cursor");
      scrollToCursor(span);
    }
  }

  totalErrors = errorSet.size;
  updateStats();

  progressFill.style.width =
    Math.min((typed.length / currentTokens.length) * 100, 100) + "%";

  if (typed.length >= currentTokens.length) endGame();
}

// ── Stats updater ──
function updateStats() {
  const wpm = calcWPM(totalTyped);
  const acc = totalTyped > 0
    ? Math.max(Math.round(((totalTyped - countCurrentErrors()) / totalTyped) * 100), 0)
    : 100;
  wpmDisplay.textContent      = wpm;
  accuracyDisplay.textContent = acc;
  errorsDisplay.textContent   = totalErrors;
  wpmDisplay.style.color =
    wpm >= 60 ? "var(--green)" :
    wpm >= 30 ? "#fbbf24"      :
    "var(--text)";
}

function countCurrentErrors() {
  const typed = typingInput.value;
  let count = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < currentTokens.length && typed[i] !== currentTokens[i].char) count++;
  }
  return count;
}

function scrollToCursor(span) {
  const wrapper = document.querySelector(".snippet-wrapper");
  if (!wrapper || !span) return;
  const wR = wrapper.getBoundingClientRect();
  const sR = span.getBoundingClientRect();
  if (sR.bottom > wR.bottom) wrapper.scrollTop += sR.bottom - wR.bottom + 20;
}

// ── Tab + Escape ──
typingInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const pos = typingInput.selectionStart;
    const val = typingInput.value;
    typingInput.value = val.slice(0, pos) + "  " + val.slice(pos);
    typingInput.selectionStart = typingInput.selectionEnd = pos + 2;
    handleInput();
  }
  if (e.key === "Escape") initGame();
});

// ── End game — NOW saves score and shows results ──
function endGame() {
  if (gameEnded) return;
  gameEnded = true;
  stopTimer();
  gameActive = false;
  typingInput.blur();

  const finalWpm = calcWPM(totalTyped);
  const finalAcc = totalTyped > 0
    ? Math.max(Math.round(((totalTyped - countCurrentErrors()) / totalTyped) * 100), 0)
    : 100;

  // Save to localStorage
  saveScore(finalWpm, finalAcc);

  // Populate result card
  resultWpm.textContent    = finalWpm;
  resultAcc.textContent    = finalAcc + "%";
  resultErrors.textContent = totalErrors;

  // Motivational message based on WPM
  const msg =
    finalWpm >= 80 ? "🔥 Insane speed! You're a code machine." :
    finalWpm >= 60 ? "⚡ Blazing fast — great run!" :
    finalWpm >= 40 ? "💪 Solid. Keep pushing for 60 WPM." :
    finalWpm >= 20 ? "🚀 Good effort! Practice makes perfect." :
    "🌱 Just getting started — you've got this.";
  if (resultMsg) resultMsg.textContent = msg;

  // Render leaderboard, highlight this score if it's the new top
  renderLeaderboard(finalWpm);
  resultsOverlay.classList.remove("hidden");
}

// ── Restart & clear buttons ──
restartBtn.addEventListener("click", initGame);

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    clearScores();
    renderLeaderboard();
  });
}

// ── Difficulty buttons ──
diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    diffBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    initGame();
  });
});

// ── Focus handling ──
snippetDisplay.addEventListener("click", () => typingInput.focus());
typingInput.addEventListener("focus", () => { if (!gameActive) focusPrompt.classList.add("hidden"); });
typingInput.addEventListener("blur",  () => { if (!gameActive) focusPrompt.classList.remove("hidden"); });

// ── Boot ──
initGame();