// ============================================================================
// pyqbank.js — Previous Year Questions (PYQ) bank for Expedition 11.
//
// ⚠️ IMPORTANT: The entries below are PLACEHOLDER / SAMPLE questions only —
// they are NOT real JEE Main/Advanced exam questions. They exist purely to
// show the expected data shape and to let you preview the PYQ section
// working end-to-end before you add real content.
//
// To add genuine previous-year questions:
//   1. Source them from official papers (NTA / JEE Advanced official archives,
//      or a textbook that has correctly reproduced + credited them).
//   2. Add one object per question to window.PYQ_QUESTIONS below, following
//      the exact same shape as the samples.
//   3. Set `year` to the exam year, and `exam` to "JEE Main" or "JEE Advanced".
//   4. Set `subject` to one of: "math", "physics", "chemistry" (matches the
//      subject ids already used elsewhere in this app).
//   5. `ans` is the 0-indexed position of the correct option in `opts`.
//   6. `sol` (optional) is a short worked solution shown after answering.
//
// This file is loaded as a plain <script> (not a module), so it just needs
// to assign to window.PYQ_QUESTIONS — no build step required.
// ============================================================================

window.PYQ_QUESTIONS = [
  {
    year: 2023,
    exam: "JEE Main",
    subject: "math",
    chapter: "Sets, Relations & Functions",
    q: "[SAMPLE — replace with a real PYQ] If a relation R on a set A is both symmetric and transitive but not reflexive, which of the following must be true?",
    opts: [
      "R is an equivalence relation",
      "R can fail to be reflexive only on isolated elements not related to anything",
      "R is always empty",
      "R is a function"
    ],
    ans: 1,
    sol: "This is placeholder content — swap in the real question and official solution."
  },
  {
    year: 2022,
    exam: "JEE Main",
    subject: "physics",
    chapter: "Laws of Motion",
    q: "[SAMPLE — replace with a real PYQ] A block of mass m rests on a rough incline of angle θ. The minimum coefficient of static friction for the block to remain stationary is:",
    opts: ["tan θ", "sin θ", "cos θ", "cot θ"],
    ans: 0,
    sol: "This is placeholder content — swap in the real question and official solution."
  },
  {
    year: 2021,
    exam: "JEE Main",
    subject: "chemistry",
    chapter: "Equilibrium",
    q: "[SAMPLE — replace with a real PYQ] For a weak acid HA with dissociation constant Ka, the pH of a 0.1 M solution is closest to:",
    opts: ["pH = -log(Ka)", "pH = ½(pKa - log C)", "pH = pKa", "pH = 7"],
    ans: 1,
    sol: "This is placeholder content — swap in the real question and official solution."
  }
];
