// app.js — Day 3: bulletproof typing logic, backspace support,
//          live WPM, accuracy, error highlighting, auto-scroll cursor

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
const restartBtn      = document.getElementById("restart-btn");
const diffBtns        = document.querySelectorAll(".diff-btn");

// ── State ──
let currentSnippet  = "";
let currentTokens   = [];
let currentLevel    = "easy";
let totalTyped      = 0;
let totalErrors     = 0;
let errorSet        = new Set(); // track which indices were wrong
let gameActive      = false;
let gameEnded       = false;

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

  // Cursor on first char
  const first = document.getElementById("c0");
  if (first) first.classList.add("cursor");
}

// ── Core typing handler ──
typingInput.addEventListener("input", handleInput);

function handleInput() {
  if (gameEnded) return;

  // Start timer on first keystroke
  if (!gameActive && typingInput.value.length > 0) {
    gameActive = true;
    focusPrompt.classList.add("hidden");
    startTimer(
      (secsLeft) => {
        timerDisplay.textContent = secsLeft;
        // Color timer red in last 10 seconds
        timerDisplay.style.color = secsLeft <= 10 ? "var(--red)" : "var(--text)";
        updateStats();
      },
      endGame
    );
  }

  const typed = typingInput.value;
  totalTyped  = typed.length;

  // Update every character span
  for (let i = 0; i < currentTokens.length; i++) {
    const span = document.getElementById(`c${i}`);
    if (!span) continue;
    span.classList.remove("correct", "wrong", "cursor");

    if (i < typed.length) {
      if (typed[i] === currentTokens[i].char) {
        span.classList.add("correct");
        // Remove from errorSet if corrected via backspace re-type
        errorSet.delete(i);
      } else {
        span.classList.add("wrong");
        errorSet.add(i); // track unique error positions
      }
    } else if (i === typed.length) {
      span.classList.add("cursor");
      scrollToCursor(span); // keep cursor in view
    }
  }

  // Total errors = unique wrong positions ever made
  totalErrors = errorSet.size;

  updateStats();

  // Update progress bar
  const pct = Math.min((typed.length / currentTokens.length) * 100, 100);
  progressFill.style.width = pct + "%";

  // Win condition: all chars typed
  if (typed.length >= currentTokens.length) endGame();
}

// ── Live stats updater ──
function updateStats() {
  const wpm = calcWPM(totalTyped);
  const acc = totalTyped > 0
    ? Math.round(((totalTyped - countCurrentErrors()) / totalTyped) * 100)
    : 100;

  wpmDisplay.textContent      = wpm;
  accuracyDisplay.textContent = Math.max(acc, 0);
  errorsDisplay.textContent   = totalErrors;

  // Color WPM green if fast, amber if medium
  wpmDisplay.style.color =
    wpm >= 60 ? "var(--green)" :
    wpm >= 30 ? "#fbbf24"      :
    "var(--text)";
}

// Count errors in the currently typed portion only (not total unique)
function countCurrentErrors() {
  const typed = typingInput.value;
  let count = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < currentTokens.length && typed[i] !== currentTokens[i].char) count++;
  }
  return count;
}

// Auto-scroll so cursor span stays visible inside snippet wrapper
function scrollToCursor(span) {
  const wrapper = document.querySelector(".snippet-wrapper");
  if (!wrapper || !span) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  const spanRect    = span.getBoundingClientRect();
  if (spanRect.bottom > wrapperRect.bottom) {
    wrapper.scrollTop += spanRect.bottom - wrapperRect.bottom + 20;
  }
}

// ── Keyboard: handle Tab key (insert 2 spaces) & Escape to restart ──
typingInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const pos   = typingInput.selectionStart;
    const val   = typingInput.value;
    typingInput.value = val.slice(0, pos) + "  " + val.slice(pos);
    typingInput.selectionStart = typingInput.selectionEnd = pos + 2;
    handleInput(); // trigger update manually after Tab
  }
  if (e.key === "Escape") initGame();
});

// ── End game ──
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

  resultWpm.textContent    = finalWpm;
  resultAcc.textContent    = finalAcc + "%";
  resultErrors.textContent = totalErrors;

  // Day 4: saveScore(finalWpm, finalAcc);
  renderLeaderboard();
  resultsOverlay.classList.remove("hidden");
}

// ── Restart button & keyboard shortcut ──
restartBtn.addEventListener("click", initGame);

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