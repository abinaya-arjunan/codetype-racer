// snippets.js — code snippet bank
// Day 2: you will expand this array and add more per difficulty

const SNIPPETS = {
  easy: [
    `<h1>Hello World</h1>\n<p>This is a paragraph.</p>`,
    `<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>`,
    `const name = "Alice";\nconsole.log("Hello, " + name);`,
  ],
  medium: [
    `function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 4));`,
    `const nums = [1, 2, 3, 4];\nconst doubled = nums.map(n => n * 2);`,
    `document.querySelector("button")\n  .addEventListener("click", () => {\n    alert("clicked!");\n  });`,
  ],
  hard: [
    `async function getData(url) {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}`,
    `const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};`,
  ],
};

// Returns a random snippet string for the given difficulty
function getSnippet(level = "easy") {
  const pool = SNIPPETS[level] || SNIPPETS.easy;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}