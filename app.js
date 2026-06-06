// app.js — main entry point, wires everything together
// This is the brain. It will grow each day as you add features.

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
let currentSnippet = "";
let currentLevel   = "easy";
let totalTyped     = 0;
let totalErrors    = 0;
let gameActive     = false;

// ── Init ──
function initGame() {
  resetTimer();
  totalTyped   = 0;
  totalErrors  = 0;
  gameActive   = false;

  wpmDisplay.textContent      = "0";
  accuracyDisplay.textContent = "100";
  timerDisplay.textContent    = "60";
  errorsDisplay.textContent   = "0";
  progressFill.style.width    = "0%";
  resultsOverlay.classList.add("hidden");

  currentSnippet = getSnippet(currentLevel);
  renderSnippet(currentSnippet);

  typingInput.value = "";
  typingInput.focus();
  focusPrompt.classList.remove("hidden");
}

// Render snippet as individual <span> elements
function renderSnippet(text) {
  snippetDisplay.innerHTML = text
    .split("")
    .map((char, i) => {
      const safe = char === "<" ? "&lt;" : char === ">" ? "&gt;" : char;
      return `<span id="c${i}">${safe}</span>`;
    })
    .join("");
  // Set cursor on first char
  const first = document.getElementById("c0");
  if (first) first.classList.add("cursor");
}

// ── Typing handler (Day 3: full logic goes here) ──
typingInput.addEventListener("input", (e) => {
  if (!gameActive) {
    gameActive = true;
    focusPrompt.classList.add("hidden");
    startTimer(
      (secsLeft) => {
        timerDisplay.textContent = secsLeft;
        // Update WPM on every tick
        wpmDisplay.textContent = calcWPM(totalTyped);
      },
      endGame
    );
  }

  const typed = typingInput.value;
  totalTyped  = typed.length;

  // Update each character's class
  for (let i = 0; i < currentSnippet.length; i++) {
    const span = document.getElementById(`c${i}`);
    if (!span) continue;
    span.classList.remove("correct", "wrong", "cursor");

    if (i < typed.length) {
      span.classList.add(typed[i] === currentSnippet[i] ? "correct" : "wrong");
    } else if (i === typed.length) {
      span.classList.add("cursor");
    }
  }

  // Count errors
  totalErrors = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== currentSnippet[i]) totalErrors++;
  }
  errorsDisplay.textContent = totalErrors;

  // Accuracy
  const acc = totalTyped > 0
    ? Math.round(((totalTyped - totalErrors) / totalTyped) * 100)
    : 100;
  accuracyDisplay.textContent = acc;

  // Progress bar
  const pct = Math.min((typed.length / currentSnippet.length) * 100, 100);
  progressFill.style.width = pct + "%";

  // Auto-end when snippet complete
  if (typed.length >= currentSnippet.length) endGame();
});

// ── End game ──
function endGame() {
  stopTimer();
  gameActive = false;
  typingInput.blur();

  const finalWpm = calcWPM(totalTyped);
  const finalAcc = totalTyped > 0
    ? Math.round(((totalTyped - totalErrors) / totalTyped) * 100)
    : 100;

  resultWpm.textContent    = finalWpm;
  resultAcc.textContent    = finalAcc + "%";
  resultErrors.textContent = totalErrors;

  // Day 4: saveScore(finalWpm, finalAcc);
  renderLeaderboard();
  resultsOverlay.classList.remove("hidden");
}

// ── Restart ──
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

// ── Start ──
initGame();