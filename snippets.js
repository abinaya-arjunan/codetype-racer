// snippets.js — expanded code snippet bank
// Day 2: added more snippets per level + syntax token detection

const SNIPPETS = {
  easy: [
    `<h1>Hello World</h1>\n<p>Welcome to my page.</p>`,
    `<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n  <li>Item three</li>\n</ul>`,
    `<a href="https://github.com">Visit GitHub</a>`,
    `const name = "Alice";\nconsole.log("Hello, " + name);`,
    `let score = 0;\nscore = score + 10;\nconsole.log(score);`,
    `const colors = ["red", "green", "blue"];\nconsole.log(colors[0]);`,
  ],
  medium: [
    `function greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("World"));`,
    `const nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled);`,
    `const person = {\n  name: "Bob",\n  age: 25,\n};\nconsole.log(person.name);`,
    `document.querySelector("button")\n  .addEventListener("click", () => {\n    alert("Button clicked!");\n  });`,
    `for (let i = 0; i < 5; i++) {\n  console.log("Step: " + i);\n}`,
    `const evens = [1,2,3,4,5,6].filter(n => n % 2 === 0);\nconsole.log(evens);`,
  ],
  hard: [
    `async function getData(url) {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}`,
    `const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};`,
    `class Stack {\n  constructor() { this.items = []; }\n  push(val) { this.items.push(val); }\n  pop() { return this.items.pop(); }\n}`,
    `const memoize = (fn) => {\n  const cache = new Map();\n  return (n) => {\n    if (cache.has(n)) return cache.get(n);\n    const result = fn(n);\n    cache.set(n, result);\n    return result;\n  };\n};`,
    `Promise.all([fetch("/api/a"), fetch("/api/b")])\n  .then(([a, b]) => Promise.all([a.json(), b.json()]))\n  .then(([dataA, dataB]) => console.log(dataA, dataB));`,
  ],
};

// ── Syntax token types ──
// Each returns a CSS class name for coloring
const TOKEN_RULES = [
  { pattern: /^(const|let|var|function|return|class|new|if|else|for|while|async|await|import|export|default|of|in|typeof|this|=>)$/, cls: "tok-keyword" },
  { pattern: /^".*"|^'.*'|^`.*`/, cls: "tok-string" },
  { pattern: /^\d+(\.\d+)?$/, cls: "tok-number" },
  { pattern: /^\/\/.*/, cls: "tok-comment" },
  { pattern: /^[A-Z][a-zA-Z]*$/, cls: "tok-class" },
  { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*\(/, cls: "tok-function" },
];

// Tokenize a line into word segments with classes
function tokenizeLine(line) {
  // Simple word-boundary split keeping delimiters
  const parts = line.split(/(\s+|[{}()[\];,.<>!=&|+\-*/%:?])/);
  return parts.map(part => {
    for (const rule of TOKEN_RULES) {
      if (rule.pattern.test(part)) return { text: part, cls: rule.cls };
    }
    return { text: part, cls: "tok-default" };
  });
}

// Returns array of { char, cls } objects for the whole snippet
function tokenizeSnippet(snippet) {
  const lines = snippet.split("\n");
  const result = [];
  lines.forEach((line, lineIdx) => {
    const tokens = tokenizeLine(line);
    tokens.forEach(token => {
      token.text.split("").forEach(char => {
        result.push({ char, cls: token.cls });
      });
    });
    if (lineIdx < lines.length - 1) {
      result.push({ char: "\n", cls: "tok-default" });
    }
  });
  return result;
}

// Returns a random snippet string for the given difficulty
function getSnippet(level = "easy") {
  const pool = SNIPPETS[level] || SNIPPETS.easy;
  return pool[Math.floor(Math.random() * pool.length)];
}