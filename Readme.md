# CodeType Racer ⌨️

A typing speed game built with **vanilla JavaScript** — but instead of random sentences, you type real code snippets.

🔗 **[Live Demo](https://abinaya-arjunan.github.io/codetype-racer)**

---

## Features

- **17 code snippets** across Easy (HTML), Medium (JS functions), and Hard (async/closures)
- **VS Code-style syntax highlighting** — keywords, strings, numbers, and comments all colored
- **Live WPM + accuracy** calculated in real time as you type
- **60-second countdown** that turns red in the final 10 seconds
- **Error tracking** — unique wrong keystrokes counted, not just current mismatches
- **Auto-scroll cursor** for long snippets
- **Tab key support** — inserts 2 spaces so indentation works correctly
- **Top 5 leaderboard** saved to localStorage with date, WPM, and accuracy
- **Motivational results screen** with score highlighting for personal bests
- Fully **responsive** — works on mobile

---

## Tech Stack

| Layer      | Tech                       |
|------------|----------------------------|
| Structure  | HTML5 (semantic)           |
| Styling    | CSS3 (custom properties, grid, flexbox) |
| Logic      | Vanilla JavaScript (ES6+)  |
| Storage    | localStorage API           |
| Fonts      | JetBrains Mono, Space Grotesk (Google Fonts) |
| Deploy     | GitHub Pages               |

---

## Project Structure

```
codetype-racer/
├── index.html       # UI structure
├── style.css        # All styling + responsive
├── app.js           # Main game logic, typing handler
├── timer.js         # Countdown timer, WPM calculation
├── snippets.js      # Snippet bank + syntax tokenizer
└── leaderboard.js   # localStorage score management
```

---

## How to Run Locally

```bash
git clone https://github.com/abinaya-arjunan/codetype-racer.git
cd codetype-racer
# open index.html in your browser — no build step needed
```

---

## What I Learned

- DOM manipulation at the character level (individual `<span>` per character)
- Real-time event handling with `input` and `keydown` listeners
- WPM formula: `(characters typed ÷ 5) ÷ minutes elapsed`
- Managing application state across multiple JS modules
- `localStorage` for persistent data without a backend
- CSS custom properties for consistent theming

---

## Roadmap

- [ ] Sound effects on correct / wrong keypress
- [ ] More snippet languages (Python, SQL, Bash)
- [ ] Online leaderboard using a free backend

---

*Built as part of my JavaScript learning journey.