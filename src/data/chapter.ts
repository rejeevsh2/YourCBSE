/**
 * Placeholder content for the Chapter Learning Experience.
 * Replaced by the Laravel + MySQL API in a later phase — no runtime logic here.
 */

export type LessonStatus = "completed" | "current" | "locked" | "available";

export interface ChapterLesson {
  id: string;
  title: string;
  duration: string;
  status: LessonStatus;
}

export type ModuleTone = "primary" | "violet" | "success" | "warning" | "danger";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: string;
  tone: ModuleTone;
  status?: "Completed" | "In progress" | "New" | "Coming soon";
}

export interface ModuleGroup {
  id: string;
  label: string;
  summary: string;
  modules: LearningModule[];
}

export const chapter = {
  course: "CBSE Curriculum 2026",
  subject: "Mathematics",
  grade: "Class 10",
  slug: "real-numbers",
  number: "Chapter 1",
  title: "Real Numbers",
  intro:
    "Understand Euclid's division lemma, the Fundamental Theorem of Arithmetic and how rational and irrational numbers behave — with worked examples, animations and exam-style practice.",
  readingTime: "48 min",
  difficulty: "Moderate",
  progress: 62,
  estimatedCompletion: "18 min left",
  objectives: [
    "Apply Euclid's division lemma to find the HCF of two positive integers.",
    "State and use the Fundamental Theorem of Arithmetic with confidence.",
    "Prove that numbers such as √2 and √3 are irrational.",
    "Decide whether a rational number has a terminating decimal expansion.",
  ],
};

export const chapterLessons: ChapterLesson[] = [
  { id: "l1", title: "Introduction to Real Numbers", duration: "6 min", status: "completed" },
  { id: "l2", title: "Euclid's Division Lemma", duration: "9 min", status: "completed" },
  { id: "l3", title: "Fundamental Theorem of Arithmetic", duration: "11 min", status: "completed" },
  { id: "l4", title: "Revisiting Irrational Numbers", duration: "10 min", status: "current" },
  { id: "l5", title: "Decimal Expansions", duration: "8 min", status: "available" },
  { id: "l6", title: "Chapter Assessment", duration: "20 min", status: "locked" },
  { id: "l7", title: "Board Exam Drill", duration: "35 min", status: "locked" },
];

export const moduleGroups: ModuleGroup[] = [
  {
    id: "learn",
    label: "Learn the concepts",
    summary: "Start here — interactive explanations, video lessons and quick revision notes.",
    modules: [
      {
        id: "interactive",
        title: "Interactive Chapter",
        description: "Step through the chapter with guided prompts and instant checkpoints.",
        meta: "12 steps",
        icon: "sparkles",
        tone: "primary",
        status: "In progress",
      },
      {
        id: "video",
        title: "Video Lesson",
        description: "Board-aligned explanation by a CBSE mentor with chapter timestamps.",
        meta: "18 min",
        icon: "play",
        tone: "danger",
        status: "Completed",
      },
      {
        id: "notes",
        title: "Quick Notes",
        description: "One-page revision notes you can skim the night before an exam.",
        meta: "4 pages",
        icon: "notebook",
        tone: "violet",
      },
      {
        id: "concepts",
        title: "Key Concepts",
        description: "The nine ideas that every question in this chapter is built from.",
        meta: "9 concepts",
        icon: "lightbulb",
        tone: "warning",
      },
      {
        id: "examples",
        title: "Worked Examples",
        description: "Fully solved problems with reasoning shown at every line.",
        meta: "14 examples",
        icon: "pencil",
        tone: "primary",
      },
      {
        id: "animations",
        title: "Animations",
        description: "Watch the division algorithm and factor trees build themselves.",
        meta: "5 animations",
        icon: "clapperboard",
        tone: "violet",
      },
    ],
  },
  {
    id: "reference",
    label: "Reference material",
    summary: "Diagrams, formulas and definitions to keep open while you solve.",
    modules: [
      {
        id: "diagrams",
        title: "Diagrams",
        description: "Labelled factor trees, number lines and Venn representations.",
        meta: "8 diagrams",
        icon: "shapes",
        tone: "success",
      },
      {
        id: "formula",
        title: "Formula Sheet",
        description: "Every formula in this chapter on a single printable sheet.",
        meta: "1 page",
        icon: "sigma",
        tone: "primary",
      },
      {
        id: "definitions",
        title: "Important Definitions",
        description: "Exam-precise wording for each term the examiner expects.",
        meta: "16 terms",
        icon: "book",
        tone: "violet",
      },
      {
        id: "applications",
        title: "Real-life Applications",
        description: "Where HCF, LCM and irrational numbers show up outside the textbook.",
        meta: "6 stories",
        icon: "globe",
        tone: "success",
      },
      {
        id: "mindmaps",
        title: "Mind Maps",
        description: "See the whole chapter as one connected picture.",
        meta: "2 maps",
        icon: "network",
        tone: "warning",
      },
      {
        id: "flashcards",
        title: "Flash Cards",
        description: "Spaced-repetition cards for fast recall before a test.",
        meta: "40 cards",
        icon: "layers",
        tone: "danger",
      },
    ],
  },
  {
    id: "practice",
    label: "Practice & assess",
    summary: "Move from basic recall to full board-level questions.",
    modules: [
      {
        id: "practice-questions",
        title: "Practice Questions",
        description: "Graded question sets from warm-up to challenge level.",
        meta: "35 questions",
        icon: "target",
        tone: "primary",
        status: "New",
      },
      {
        id: "mcqs",
        title: "MCQs",
        description: "Timed multiple-choice drill with instant explanations.",
        meta: "25 questions",
        icon: "list-checks",
        tone: "success",
      },
      {
        id: "assertion",
        title: "Assertion & Reason",
        description: "Competency-based pairs in the exact CBSE exam format.",
        meta: "12 pairs",
        icon: "scale",
        tone: "violet",
      },
      {
        id: "case-study",
        title: "Case Study",
        description: "Passage-based questions that mirror the new paper pattern.",
        meta: "4 cases",
        icon: "file-search",
        tone: "warning",
      },
      {
        id: "hots",
        title: "HOTS Questions",
        description: "Higher-order thinking problems for the last five marks.",
        meta: "10 questions",
        icon: "brain",
        tone: "danger",
      },
      {
        id: "pyq",
        title: "Previous Year Questions",
        description: "Board questions from 2016 to 2025, tagged by concept.",
        meta: "28 questions",
        icon: "history",
        tone: "primary",
      },
    ],
  },
  {
    id: "revise",
    label: "Solutions & revision",
    summary: "Close the loop — check your work, then lock the chapter in.",
    modules: [
      {
        id: "ncert",
        title: "NCERT Solutions",
        description: "Every in-text and exercise question solved step by step.",
        meta: "Exercise 1.1 – 1.4",
        icon: "book-check",
        tone: "success",
      },
      {
        id: "worksheets",
        title: "Worksheets",
        description: "Printable practice sheets with answer keys for offline work.",
        meta: "3 sheets",
        icon: "file-down",
        tone: "violet",
      },
      {
        id: "summary",
        title: "Summary",
        description: "The whole chapter distilled into ten lines.",
        meta: "2 min read",
        icon: "scroll",
        tone: "primary",
      },
      {
        id: "faq",
        title: "Frequently Asked Questions",
        description: "The doubts students raise most often about this chapter.",
        meta: "11 answers",
        icon: "help-circle",
        tone: "warning",
      },
    ],
  },
];

export const chapterBookmarks = [
  { id: "b1", label: "Euclid's lemma — proof steps", meta: "Lesson 2" },
  { id: "b2", label: "√2 is irrational", meta: "Lesson 4" },
  { id: "b3", label: "Terminating decimals rule", meta: "Quick Notes" },
];

export const chapterDownloads = [
  { id: "d1", label: "Formula sheet", meta: "PDF · 220 KB" },
  { id: "d2", label: "Worksheet set A", meta: "PDF · 480 KB" },
  { id: "d3", label: "Mind map", meta: "PNG · 1.1 MB" },
];

export const chapterNotes = [
  { id: "n1", label: "Revise LCM × HCF identity", meta: "Edited 2 days ago" },
  { id: "n2", label: "Ask about proof by contradiction", meta: "Edited today" },
];

export const chapterResources = [
  { id: "r1", label: "NCERT textbook — Chapter 1", meta: "Reference" },
  { id: "r2", label: "Exemplar problems", meta: "Reference" },
];

export const recentlyViewed = [
  { id: "rv1", label: "Polynomials", meta: "Class 10 · Mathematics" },
  { id: "rv2", label: "Light — Reflection & Refraction", meta: "Class 10 · Science" },
  { id: "rv3", label: "Nationalism in India", meta: "Class 10 · Social Science" },
];

export const upcomingPractice = [
  { id: "up1", label: "Real Numbers — MCQ drill", meta: "Due tomorrow" },
  { id: "up2", label: "Weekly mock test", meta: "Due Sunday" },
];

export const adjacentChapters = {
  previous: { title: "Course Overview", meta: "Getting started" },
  next: { title: "Polynomials", meta: "Chapter 2 · 52 min" },
};

