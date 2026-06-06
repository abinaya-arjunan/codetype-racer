// leaderboard.js — save and display top 5 scores using localStorage
// Day 4: this will be fully connected; for now the functions are stubs

const STORAGE_KEY = "codetype_scores";

function saveScore(wpm, accuracy) {
  const scores = getScores();
  scores.push({ wpm, accuracy, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.wpm - a.wpm);
  const top5 = scores.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
}

function getScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  const scores = getScores();
  if (!list) return;
  if (scores.length === 0) {
    list.innerHTML = `<li style="color:var(--muted);justify-content:center">No scores yet</li>`;
    return;
  }
  list.innerHTML = scores.map((s, i) =>
    `<li><span>#${i + 1} &nbsp; ${s.wpm} WPM</span><span class="lb-score">${s.accuracy}% acc</span></li>`
  ).join("");
}