/**
 * Placeholder content for the Interactive Chapter Player.
 * Shaped for a future Laravel API — no runtime logic here.
 */

export interface PlayerTab {
  id: string;
  label: string;
  icon: string;
  meta: string;
  headline: string;
  description: string;
  /** Simple list-style placeholder items rendered inside the tab panel. */
  items: { id: string; title: string; meta: string }[];
}

export const lessonSummary = {
  title: "Revisiting Irrational Numbers",
  lesson: "Lesson 4 of 7",
  estimatedTime: "22 min",
  difficulty: "Moderate",
  progress: 45,
  summary:
    "Work through the proof that √2 is irrational, then use the same contradiction technique on other surds. The interactive app lets you build each step of the argument and check it instantly.",
  objectives: [
    "Explain what makes a number irrational in exam-precise wording.",
    "Use proof by contradiction to show √2, √3 and √5 are irrational.",
    "Combine rational and irrational numbers and predict the result.",
    "Spot the common mistakes examiners penalise in these proofs.",
  ],
  skills: [
    "Logical reasoning",
    "Proof writing",
    "Number theory",
    "Prime factorisation",
    "Exam technique",
  ],
};

export const playerTabs: PlayerTab[] = [
  {
    id: "interactive",
    label: "Interactive App",
    icon: "sparkles",
    meta: "12 steps",
    headline: "Interactive chapter app",
    description: "A guided, hands-on build of the chapter with checkpoints after every step.",
    items: [],
  },
  {
    id: "video",
    label: "Video Lesson",
    icon: "play",
    meta: "18 min",
    headline: "Video lesson",
    description: "Board-aligned explanation with chapter timestamps.",
    items: [
      { id: "v1", title: "What makes a number irrational", meta: "00:00 · 4 min" },
      { id: "v2", title: "Proof by contradiction, step by step", meta: "04:12 · 7 min" },
      { id: "v3", title: "Worked board question", meta: "11:40 · 6 min" },
    ],
  },
  {
    id: "notes",
    label: "Quick Notes",
    icon: "notebook",
    meta: "4 pages",
    headline: "Quick revision notes",
    description: "One-page notes you can skim the night before an exam.",
    items: [
      { id: "n1", title: "Definition — irrational number", meta: "Page 1" },
      { id: "n2", title: "Theorem 1.3 and its proof", meta: "Page 2" },
      { id: "n3", title: "Rational × irrational results", meta: "Page 3" },
      { id: "n4", title: "Common mistakes checklist", meta: "Page 4" },
    ],
  },
  {
    id: "flashcards",
    label: "Flash Cards",
    icon: "layers",
    meta: "40 cards",
    headline: "Flash cards",
    description: "Spaced-repetition recall for fast revision.",
    items: [
      { id: "f1", title: "Deck — Definitions", meta: "16 cards" },
      { id: "f2", title: "Deck — Theorems", meta: "12 cards" },
      { id: "f3", title: "Deck — Exam traps", meta: "12 cards" },
    ],
  },
  {
    id: "mindmap",
    label: "Mind Map",
    icon: "network",
    meta: "2 maps",
    headline: "Mind maps",
    description: "The whole chapter as one connected picture.",
    items: [
      { id: "m1", title: "Real numbers — full chapter map", meta: "Interactive" },
      { id: "m2", title: "Irrational numbers — focus map", meta: "Printable" },
    ],
  },
  {
    id: "worksheets",
    label: "Worksheets",
    icon: "file-down",
    meta: "3 sheets",
    headline: "Printable worksheets",
    description: "Offline practice with answer keys.",
    items: [
      { id: "w1", title: "Worksheet A — Basics", meta: "PDF · 12 questions" },
      { id: "w2", title: "Worksheet B — Proofs", meta: "PDF · 10 questions" },
      { id: "w3", title: "Worksheet C — Mixed", meta: "PDF · 15 questions" },
    ],
  },
  {
    id: "question-bank",
    label: "Question Bank",
    icon: "target",
    meta: "35 questions",
    headline: "Question bank",
    description: "Graded sets from warm-up to challenge level.",
    items: [
      { id: "q1", title: "Level 1 — Warm up", meta: "12 questions" },
      { id: "q2", title: "Level 2 — Board standard", meta: "15 questions" },
      { id: "q3", title: "Level 3 — Challenge", meta: "8 questions" },
    ],
  },
  {
    id: "mcqs",
    label: "MCQs",
    icon: "list-checks",
    meta: "25 questions",
    headline: "Multiple choice drill",
    description: "Timed practice with instant explanations.",
    items: [
      { id: "mc1", title: "Set 1 — Definitions", meta: "10 questions · 8 min" },
      { id: "mc2", title: "Set 2 — Proof logic", meta: "15 questions · 12 min" },
    ],
  },
  {
    id: "assertion",
    label: "Assertion & Reason",
    icon: "scale",
    meta: "12 pairs",
    headline: "Assertion & reason",
    description: "Competency-based pairs in the exact CBSE format.",
    items: [
      { id: "a1", title: "Pair set A", meta: "6 pairs" },
      { id: "a2", title: "Pair set B", meta: "6 pairs" },
    ],
  },
  {
    id: "case-study",
    label: "Case Study",
    icon: "file-search",
    meta: "4 cases",
    headline: "Case study questions",
    description: "Passage-based questions mirroring the new paper pattern.",
    items: [
      { id: "c1", title: "Tiling a rectangular hall", meta: "4 sub-questions" },
      { id: "c2", title: "Scheduling two bells", meta: "4 sub-questions" },
      { id: "c3", title: "Packing sweet boxes", meta: "3 sub-questions" },
    ],
  },
  {
    id: "pyq",
    label: "Previous Year Questions",
    icon: "history",
    meta: "28 questions",
    headline: "Previous year questions",
    description: "Board questions from 2016 to 2025, tagged by concept.",
    items: [
      { id: "p1", title: "2025 — Delhi set", meta: "6 questions" },
      { id: "p2", title: "2024 — All India set", meta: "8 questions" },
      { id: "p3", title: "2016–2023 archive", meta: "14 questions" },
    ],
  },
  {
    id: "ncert",
    label: "NCERT Solutions",
    icon: "book-check",
    meta: "4 exercises",
    headline: "NCERT solutions",
    description: "Every in-text and exercise question solved step by step.",
    items: [
      { id: "e1", title: "Exercise 1.1", meta: "5 questions" },
      { id: "e2", title: "Exercise 1.2", meta: "7 questions" },
      { id: "e3", title: "Exercise 1.3", meta: "3 questions" },
      { id: "e4", title: "Exercise 1.4", meta: "3 questions" },
    ],
  },
  {
    id: "faq",
    label: "FAQ",
    icon: "help-circle",
    meta: "11 answers",
    headline: "Frequently asked questions",
    description: "The doubts students raise most often about this chapter.",
    items: [
      { id: "faq1", title: "Why can't √2 be written as p/q?", meta: "Answered" },
      { id: "faq2", title: "Is 0 a rational number?", meta: "Answered" },
      { id: "faq3", title: "Do I need to memorise the proof?", meta: "Answered" },
    ],
  },
];

export const recentActivity = [
  { id: "ra1", label: "Completed — Fundamental Theorem of Arithmetic", meta: "Today · 09:14" },
  { id: "ra2", label: "Scored 8/10 on MCQ Set 1", meta: "Yesterday · 18:02" },
  { id: "ra3", label: "Bookmarked — √2 is irrational", meta: "Yesterday · 17:48" },
  { id: "ra4", label: "Downloaded Worksheet A", meta: "2 days ago" },
];

export const quickResources = [
  { id: "qr1", label: "Formula sheet", meta: "PDF · 220 KB" },
  { id: "qr2", label: "Chapter summary", meta: "PDF · 90 KB" },
  { id: "qr3", label: "NCERT textbook pages", meta: "PDF · 1.4 MB" },
];

