// timer.js — Day 3: improved timer with pause support and precise WPM

let timerInterval = null;
let secondsLeft   = 60;
let startTime     = null;
let pausedAt      = null;
let totalPaused   = 0;

function startTimer(onTick, onEnd) {
  if (timerInterval) return; // already running
  startTime   = Date.now() - totalPaused;
  timerInterval = setInterval(() => {
    secondsLeft--;
    onTick(secondsLeft);
    if (secondsLeft <= 0) {
      stopTimer();
      onEnd();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  secondsLeft  = 60;
  startTime    = null;
  pausedAt     = null;
  totalPaused  = 0;
}

// Precise WPM: (chars typed / 5) / actual minutes elapsed
function calcWPM(charsTyped) {
  if (!startTime) return 0;
  const msElapsed = Date.now() - startTime;
  const minutes   = msElapsed / 60000;
  if (minutes < 0.01) return 0;
  return Math.round((charsTyped / 5) / minutes);
}

// How many seconds have elapsed since start
function getElapsedSeconds() {
  if (!startTime) return 0;
  return Math.floor((Date.now() - startTime) / 1000);
}