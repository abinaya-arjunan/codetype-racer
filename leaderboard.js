// leaderboard.js — Day 4: fully working localStorage leaderboard

const STORAGE_KEY = "codetype_scores";
const MAX_SCORES  = 5;

// Save a new score, keep only top 5 by WPM
function saveScore(wpm, accuracy) {
  if (wpm <= 0) return; // don't save zero scores
  const scores = getScores();
  scores.push({
    wpm,
    accuracy,
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  });
  scores.sort((a, b) => b.wpm - a.wpm);
  const top = scores.slice(0, MAX_SCORES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
  } catch (e) {
    console.warn("Could not save score:", e);
  }
}

// Get scores array from localStorage
function getScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Clear all scores (used by the clear button)
function clearScores() {
  localStorage.removeItem(STORAGE_KEY);
}

// Render top scores into #leaderboard-list
function renderLeaderboard(highlightWpm = null) {
  const list   = document.getElementById("leaderboard-list");
  const scores = getScores();
  if (!list) return;

  if (scores.length === 0) {
    list.innerHTML = `<li class="lb-empty">No scores yet — be the first!</li>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉", "4", "5"];

  list.innerHTML = scores.map((s, i) => {
    // Highlight the row if it matches the score just achieved
    const isNew = highlightWpm !== null && s.wpm === highlightWpm && i === 0;
    return `
      <li class="lb-row ${isNew ? "lb-new" : ""}">
        <span class="lb-rank">${medals[i] || i + 1}</span>
        <span class="lb-wpm">${s.wpm} <small>WPM</small></span>
        <span class="lb-acc">${s.accuracy}%</span>
        <span class="lb-date">${s.date}</span>
      </li>`;
  }).join("");
}