import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BookOpenCheck,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  Compass,
  Download,
  FileQuestion,
  FileStack,
  FileText,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Layers3,
  LifeBuoy,
  ListChecks,
  MessageCircleQuestion,
  Network,
  NotebookPen,
  PlayCircle,
  Repeat2,
  Sigma,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Chapter library (Learning Hub + Chapter overview)                    */
/* ------------------------------------------------------------------ */

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export interface LibraryResource {
  label: string;
  count: number;
  icon: LucideIcon;
}

export interface LibraryChapter {
  id: string;
  slug: string;
  title: string;
  subject: string;
  grade: string;
  /** Tailwind gradient classes used for the card cover. */
  cover: string;
  icon: LucideIcon;
  completion: number;
  minutes: number;
  difficulty: Difficulty;
  lessons: number;
  bookmarked: boolean;
  downloaded: boolean;
  lastOpened?: string;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  skills: string[];
  resources: LibraryResource[];
}

const baseResources = (counts: number[]): LibraryResource[] => [
  { label: "Video lessons", count: counts[0], icon: PlayCircle },
  { label: "Quick notes", count: counts[1], icon: NotebookPen },
  { label: "Worksheets", count: counts[2], icon: FileStack },
  { label: "Flash cards", count: counts[3], icon: Layers3 },
  { label: "Mind maps", count: counts[4], icon: Network },
  { label: "Practice questions", count: counts[5], icon: ListChecks },
];

export const libraryChapters: LibraryChapter[] = [
  {
    id: "lc1",
    slug: "real-numbers",
    title: "Real Numbers",
    subject: "Mathematics",
    grade: "Class 10",
    cover: "from-primary/30 via-primary/10 to-transparent",
    icon: Sigma,
    completion: 72,
    minutes: 35,
    difficulty: "Moderate",
    lessons: 6,
    bookmarked: true,
    downloaded: true,
    lastOpened: "25 min ago",
    summary:
      "Euclid's division lemma, the fundamental theorem of arithmetic, HCF and LCM, and proofs of irrationality — the foundation for every algebra chapter that follows.",
    objectives: [
      "State and apply Euclid's division lemma to find the HCF of two integers",
      "Use the fundamental theorem of arithmetic to factorise composite numbers",
      "Prove that numbers such as √2 and √3 are irrational",
      "Decide whether a rational number has a terminating decimal expansion",
    ],
    prerequisites: ["Class 9 — Number Systems", "Basic factorisation", "Long division"],
    skills: ["Number theory", "Logical proof", "Factorisation", "Exam reasoning"],
    resources: baseResources([6, 4, 3, 48, 2, 120]),
  },
  {
    id: "lc2",
    slug: "polynomials",
    title: "Polynomials",
    subject: "Mathematics",
    grade: "Class 10",
    cover: "from-success/25 via-success/10 to-transparent",
    icon: Sigma,
    completion: 30,
    minutes: 40,
    difficulty: "Moderate",
    lessons: 5,
    bookmarked: false,
    downloaded: true,
    lastOpened: "Yesterday",
    summary:
      "Zeroes of a polynomial, the relationship between zeroes and coefficients, and division of polynomials with graphical interpretation.",
    objectives: [
      "Identify the degree and zeroes of a polynomial from its graph",
      "Relate zeroes to coefficients for quadratic and cubic polynomials",
      "Apply the division algorithm for polynomials",
    ],
    prerequisites: ["Real Numbers", "Class 9 — Algebraic identities"],
    skills: ["Algebraic manipulation", "Graph reading", "Problem solving"],
    resources: baseResources([5, 3, 4, 36, 2, 96]),
  },
  {
    id: "lc3",
    slug: "light-reflection-refraction",
    title: "Light — Reflection and Refraction",
    subject: "Science",
    grade: "Class 10",
    cover: "from-warning/25 via-warning/10 to-transparent",
    icon: Atom,
    completion: 45,
    minutes: 50,
    difficulty: "Challenging",
    lessons: 7,
    bookmarked: true,
    downloaded: false,
    lastOpened: "2 hrs ago",
    summary:
      "Laws of reflection, spherical mirrors, refraction through a glass slab, lenses, and the numerical work behind the mirror and lens formulas.",
    objectives: [
      "Draw ray diagrams for concave and convex mirrors and lenses",
      "Apply the mirror and lens formulas to numerical problems",
      "Explain refractive index and calculate the power of a lens",
    ],
    prerequisites: ["Class 9 — Motion basics", "Ratio and proportion"],
    skills: ["Ray diagrams", "Numerical accuracy", "Scientific reasoning"],
    resources: baseResources([7, 5, 4, 52, 3, 140]),
  },
  {
    id: "lc4",
    slug: "chemical-reactions-and-equations",
    title: "Chemical Reactions and Equations",
    subject: "Science",
    grade: "Class 10",
    cover: "from-primary/25 via-primary/10 to-transparent",
    icon: FlaskConical,
    completion: 0,
    minutes: 40,
    difficulty: "Moderate",
    lessons: 5,
    bookmarked: false,
    downloaded: false,
    summary:
      "Writing and balancing chemical equations, types of reactions, and the everyday chemistry of corrosion and rancidity.",
    objectives: [
      "Balance chemical equations with correct state symbols",
      "Classify combination, decomposition, displacement and redox reactions",
      "Relate oxidation to corrosion and rancidity in daily life",
    ],
    prerequisites: ["Class 9 — Atoms and Molecules"],
    skills: ["Equation balancing", "Classification", "Lab observation"],
    resources: baseResources([5, 4, 3, 40, 2, 110]),
  },
  {
    id: "lc5",
    slug: "life-processes",
    title: "Life Processes",
    subject: "Science",
    grade: "Class 10",
    cover: "from-success/25 via-success/10 to-transparent",
    icon: Brain,
    completion: 88,
    minutes: 30,
    difficulty: "Easy",
    lessons: 6,
    bookmarked: true,
    downloaded: true,
    lastOpened: "3 days ago",
    summary:
      "Nutrition, respiration, transportation and excretion in plants and animals, with labelled diagrams you can reproduce in the board exam.",
    objectives: [
      "Compare autotrophic and heterotrophic nutrition",
      "Trace the path of blood through the human heart",
      "Label the nephron and describe how urine is formed",
    ],
    prerequisites: ["Class 9 — Cell structure"],
    skills: ["Diagram labelling", "Comparison writing", "Biological vocabulary"],
    resources: baseResources([6, 5, 3, 44, 4, 130]),
  },
  {
    id: "lc6",
    slug: "nationalism-in-india",
    title: "Nationalism in India",
    subject: "Social Science",
    grade: "Class 10",
    cover: "from-destructive/20 via-destructive/8 to-transparent",
    icon: Landmark,
    completion: 20,
    minutes: 45,
    difficulty: "Moderate",
    lessons: 5,
    bookmarked: false,
    downloaded: false,
    lastOpened: "Last week",
    summary:
      "The First World War, Khilafat, Non-Cooperation, Civil Disobedience and the making of a collective national identity.",
    objectives: [
      "Sequence the major movements between 1918 and 1942",
      "Explain how different social groups joined the national movement",
      "Interpret sources, cartoons and slogans of the period",
    ],
    prerequisites: ["Class 9 — The French Revolution"],
    skills: ["Timeline building", "Source analysis", "Structured answers"],
    resources: baseResources([5, 4, 2, 30, 3, 88]),
  },
  {
    id: "lc7",
    slug: "trigonometry-introduction",
    title: "Introduction to Trigonometry",
    subject: "Mathematics",
    grade: "Class 10",
    cover: "from-warning/25 via-warning/10 to-transparent",
    icon: Compass,
    completion: 12,
    minutes: 45,
    difficulty: "Challenging",
    lessons: 6,
    bookmarked: true,
    downloaded: false,
    lastOpened: "Yesterday",
    summary:
      "Trigonometric ratios, values for standard angles, identities and the groundwork for heights and distances.",
    objectives: [
      "Define the six trigonometric ratios of an acute angle",
      "Recall ratio values for 0°, 30°, 45°, 60° and 90°",
      "Prove and apply the fundamental trigonometric identities",
    ],
    prerequisites: ["Triangles", "Pythagoras theorem"],
    skills: ["Ratio fluency", "Identity proofs", "Speed calculation"],
    resources: baseResources([6, 4, 4, 50, 2, 150]),
  },
  {
    id: "lc8",
    slug: "resources-and-development",
    title: "Resources and Development",
    subject: "Social Science",
    grade: "Class 10",
    cover: "from-primary/25 via-primary/10 to-transparent",
    icon: Globe2,
    completion: 100,
    minutes: 30,
    difficulty: "Easy",
    lessons: 4,
    bookmarked: false,
    downloaded: true,
    lastOpened: "Last week",
    summary:
      "Classification of resources, land use patterns, soil types and the case for sustainable development in India.",
    objectives: [
      "Classify resources by origin, exhaustibility and ownership",
      "Describe India's land-use pattern and soil types",
      "Suggest conservation measures for degraded land",
    ],
    prerequisites: ["Class 9 — Physical features of India"],
    skills: ["Map work", "Classification", "Case study writing"],
    resources: baseResources([4, 3, 2, 26, 2, 70]),
  },
  {
    id: "lc9",
    slug: "first-flight-a-letter-to-god",
    title: "A Letter to God",
    subject: "English",
    grade: "Class 10",
    cover: "from-success/25 via-success/10 to-transparent",
    icon: Languages,
    completion: 60,
    minutes: 25,
    difficulty: "Easy",
    lessons: 3,
    bookmarked: false,
    downloaded: false,
    lastOpened: "4 days ago",
    summary:
      "Lencho's unshakeable faith, irony as a literary device, and how to structure long-answer responses for prose.",
    objectives: [
      "Summarise the plot and identify the central conflict",
      "Explain the use of irony in the story",
      "Write a 120-word analytical answer with textual evidence",
    ],
    prerequisites: ["Basic comprehension skills"],
    skills: ["Close reading", "Answer structuring", "Vocabulary"],
    resources: baseResources([3, 3, 2, 20, 1, 45]),
  },
];

export const libraryGrades = ["All grades", "Class 9", "Class 10", "Class 11"];
export const librarySubjects = [
  "All subjects",
  "Mathematics",
  "Science",
  "Social Science",
  "English",
];
export const completionFilters = [
  "All progress",
  "Not started",
  "In progress",
  "Completed",
] as const;
export type CompletionFilter = (typeof completionFilters)[number];

export const difficultyTone: Record<Difficulty, string> = {
  Easy: "border-success/30 bg-success/12 text-success",
  Moderate: "border-warning/30 bg-warning/12 text-warning",
  Challenging: "border-destructive/30 bg-destructive/12 text-destructive",
};

/* ------------------------------------------------------------------ */
/* My courses                                                          */
/* ------------------------------------------------------------------ */

export interface StudentCourse {
  id: string;
  subject: string;
  teacher: string;
  chapters: number;
  chaptersDone: number;
  lessons: number;
  lessonsDone: number;
  progress: number;
  nextChapter: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "destructive";
}

export const studentCourses: StudentCourse[] = [
  { id: "sc1", subject: "Mathematics", teacher: "Meera Iyer", chapters: 14, chaptersDone: 6, lessons: 62, lessonsDone: 34, progress: 55, nextChapter: "Polynomials", icon: Sigma, tone: "primary" },
  { id: "sc2", subject: "Science", teacher: "Rahul Verma", chapters: 13, chaptersDone: 5, lessons: 58, lessonsDone: 26, progress: 45, nextChapter: "Chemical Reactions and Equations", icon: FlaskConical, tone: "success" },
  { id: "sc3", subject: "Social Science", teacher: "Kavita Nair", chapters: 16, chaptersDone: 4, lessons: 51, lessonsDone: 15, progress: 29, nextChapter: "Nationalism in India", icon: Landmark, tone: "warning" },
  { id: "sc4", subject: "English", teacher: "Simran Kaur", chapters: 11, chaptersDone: 7, lessons: 40, lessonsDone: 29, progress: 72, nextChapter: "Nelson Mandela — Long Walk to Freedom", icon: Languages, tone: "primary" },
  { id: "sc5", subject: "Hindi", teacher: "Anil Joshi", chapters: 12, chaptersDone: 5, lessons: 38, lessonsDone: 18, progress: 47, nextChapter: "सूरदास के पद", icon: BookOpenCheck, tone: "destructive" },
];

/* ------------------------------------------------------------------ */
/* Study planner + calendar                                            */
/* ------------------------------------------------------------------ */

export interface PlannerTask {
  id: string;
  title: string;
  meta: string;
  minutes: number;
  done: boolean;
  tag: "Learn" | "Practice" | "Revise" | "Test";
}

export const todayPlan: PlannerTask[] = [
  { id: "pt1", title: "Lesson 4 — Euclid's division lemma", meta: "Mathematics · Real Numbers", minutes: 20, done: true, tag: "Learn" },
  { id: "pt2", title: "Polynomials MCQ set", meta: "Mathematics · 20 questions", minutes: 15, done: true, tag: "Practice" },
  { id: "pt3", title: "Ray diagram simulator", meta: "Science · Interactive lesson", minutes: 18, done: false, tag: "Learn" },
  { id: "pt4", title: "Flash cards — periodic table", meta: "Science · 48 cards", minutes: 10, done: false, tag: "Revise" },
  { id: "pt5", title: "Nationalism timeline recap", meta: "Social Science · Mind map", minutes: 12, done: false, tag: "Revise" },
];

export interface PlannerDay {
  id: string;
  day: string;
  date: string;
  focus: string;
  minutes: number;
  tasks: number;
  state: "done" | "today" | "upcoming";
}

export const weeklyPlan: PlannerDay[] = [
  { id: "wp1", day: "Mon", date: "27 Jul", focus: "Real Numbers · Lessons 1–3", minutes: 45, tasks: 4, state: "done" },
  { id: "wp2", day: "Tue", date: "28 Jul", focus: "Polynomials · Intro + practice", minutes: 62, tasks: 5, state: "done" },
  { id: "wp3", day: "Wed", date: "29 Jul", focus: "Light · Ray diagrams", minutes: 30, tasks: 3, state: "done" },
  { id: "wp4", day: "Thu", date: "30 Jul", focus: "Mock test + review", minutes: 78, tasks: 6, state: "done" },
  { id: "wp5", day: "Fri", date: "31 Jul", focus: "Real Numbers · Lesson 4 + revision", minutes: 60, tasks: 5, state: "today" },
  { id: "wp6", day: "Sat", date: "01 Aug", focus: "Science full-chapter revision", minutes: 90, tasks: 7, state: "upcoming" },
  { id: "wp7", day: "Sun", date: "02 Aug", focus: "Previous year paper 2024", minutes: 120, tasks: 3, state: "upcoming" },
];

export interface MonthlyGoal {
  id: string;
  title: string;
  meta: string;
  progress: number;
}

export const monthlyGoals: MonthlyGoal[] = [
  { id: "mg1", title: "Finish Mathematics chapters 1–5", meta: "4 of 5 chapters done", progress: 80 },
  { id: "mg2", title: "Solve 500 practice questions", meta: "342 solved", progress: 68 },
  { id: "mg3", title: "Study 40 hours this month", meta: "27 h 40 m logged", progress: 69 },
  { id: "mg4", title: "Clear all flash-card decks", meta: "9 of 12 decks cleared", progress: 75 },
];

export interface CalendarEvent {
  id: string;
  day: number;
  title: string;
  type: "Test" | "Class" | "Assignment" | "Revision";
}

export const calendarEvents: CalendarEvent[] = [
  { id: "ce1", day: 4, title: "Mathematics Unit Test", type: "Test" },
  { id: "ce2", day: 5, title: "Science doubt class", type: "Class" },
  { id: "ce3", day: 7, title: "Worksheet submission", type: "Assignment" },
  { id: "ce4", day: 9, title: "Science Mock Paper", type: "Test" },
  { id: "ce5", day: 12, title: "Trigonometry revision block", type: "Revision" },
  { id: "ce6", day: 16, title: "Social Science Chapter Test", type: "Test" },
  { id: "ce7", day: 19, title: "English literature class", type: "Class" },
  { id: "ce8", day: 23, title: "Full-syllabus revision day", type: "Revision" },
  { id: "ce9", day: 27, title: "Assignment — Life Processes", type: "Assignment" },
];

export const eventTone: Record<CalendarEvent["type"], string> = {
  Test: "bg-destructive/12 text-destructive",
  Class: "bg-accent text-accent-foreground",
  Assignment: "bg-warning/12 text-warning",
  Revision: "bg-success/12 text-success",
};

export interface ReminderCard {
  id: string;
  title: string;
  meta: string;
  icon: LucideIcon;
}

export const reminders: ReminderCard[] = [
  { id: "rm1", title: "Daily study session", meta: "Every day at 7:00 PM", icon: Timer },
  { id: "rm2", title: "Flash-card review", meta: "Mon, Wed, Fri at 8:30 PM", icon: Repeat2 },
  { id: "rm3", title: "Unit test countdown", meta: "Mathematics · in 4 days", icon: CalendarCheck },
  { id: "rm4", title: "Weekly goal check-in", meta: "Sunday at 9:00 AM", icon: Target },
];

/* ------------------------------------------------------------------ */
/* Practice centre categories                                          */
/* ------------------------------------------------------------------ */

export interface PracticeCategory {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "destructive";
  badge?: string;
}

export const practiceCategories: PracticeCategory[] = [
  { id: "pc1", title: "MCQs", description: "Single-correct questions with instant explanations.", meta: "1,240 questions", icon: ListChecks, tone: "primary" },
  { id: "pc2", title: "Assertion & Reason", description: "Board-pattern reasoning pairs with detailed logic.", meta: "180 questions", icon: Brain, tone: "warning" },
  { id: "pc3", title: "Case Study Questions", description: "Passage-based questions worth 4 marks each.", meta: "96 case studies", icon: FileText, tone: "success" },
  { id: "pc4", title: "HOTS", description: "Higher-order thinking problems for the 90+ band.", meta: "140 questions", icon: Sparkles, tone: "destructive", badge: "Hard" },
  { id: "pc5", title: "Previous Year Questions", description: "Board questions from 2015 onwards, chapter-wise.", meta: "10 years", icon: FileStack, tone: "primary" },
  { id: "pc6", title: "Mock Tests", description: "Full-length papers with the official marking scheme.", meta: "12 papers", icon: ClipboardCheck, tone: "destructive" },
  { id: "pc7", title: "Topic-wise Practice", description: "Drill a single topic until accuracy crosses 90%.", meta: "58 topics", icon: Target, tone: "success" },
  { id: "pc8", title: "Bookmarked Questions", description: "Everything you flagged to revisit before the exam.", meta: "34 saved", icon: FileQuestion, tone: "warning" },
];

/* ------------------------------------------------------------------ */
/* Revision hub categories                                             */
/* ------------------------------------------------------------------ */

export const revisionCategories: PracticeCategory[] = [
  { id: "rc1", title: "Quick Notes", description: "One-page summaries for every chapter you've studied.", meta: "58 notes", icon: NotebookPen, tone: "primary" },
  { id: "rc2", title: "Flashcards", description: "Spaced-repetition decks that adapt to your recall.", meta: "12 decks due", icon: Layers3, tone: "warning", badge: "Due today" },
  { id: "rc3", title: "Mind Maps", description: "Visual concept maps to revise a chapter in minutes.", meta: "42 maps", icon: Network, tone: "success" },
  { id: "rc4", title: "Formula Sheets", description: "Every formula for Maths, Physics and Chemistry.", meta: "184 formulas", icon: Sigma, tone: "primary" },
  { id: "rc5", title: "Important Questions", description: "High-weightage questions curated by teachers.", meta: "320 questions", icon: ListChecks, tone: "warning" },
  { id: "rc6", title: "NCERT Solutions", description: "Step-by-step solutions for every exercise.", meta: "58 chapters", icon: BookOpenCheck, tone: "success" },
  { id: "rc7", title: "Cheat Sheets", description: "Last-minute one-glance recaps before the paper.", meta: "24 sheets", icon: FileText, tone: "destructive" },
];

/* ------------------------------------------------------------------ */
/* Help & support                                                      */
/* ------------------------------------------------------------------ */

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const helpTopics: HelpTopic[] = [
  { id: "ht1", title: "Getting started", description: "Set up your grade, subjects and daily goal in two minutes.", icon: Compass },
  { id: "ht2", title: "Downloads & offline", description: "How offline packs work and how to free up space.", icon: Download },
  { id: "ht3", title: "Practice & scoring", description: "How accuracy, readiness and mastery are calculated.", icon: ListChecks },
  { id: "ht4", title: "Account & security", description: "Passwords, devices and keeping your profile safe.", icon: LifeBuoy },
];

export const helpFaqs = [
  {
    id: "fq1",
    question: "How is my daily goal calculated?",
    answer:
      "Your daily goal is the number of focused study minutes you set in Settings. Video watch time, interactive lessons and practice attempts all count towards it; idle time does not.",
  },
  {
    id: "fq2",
    question: "Can I study without an internet connection?",
    answer:
      "Yes. Any chapter with the download icon can be saved for offline use, including notes, worksheets and flash cards. Videos are stored at the quality you choose in Settings.",
  },
  {
    id: "fq3",
    question: "Why did my streak reset?",
    answer:
      "A streak day counts when you study for at least 10 minutes. If a day is missed the streak resets, but your longest run is always kept on your profile.",
  },
  {
    id: "fq4",
    question: "How do I change my grade or board?",
    answer:
      "Open Profile, update the grade or board field and save. Your library, practice sets and planner adapt to the new syllabus straight away.",
  },
  {
    id: "fq5",
    question: "Who can see my progress?",
    answer:
      "Only you and the teachers assigned to your class. You can turn off teacher visibility in Settings under Privacy.",
  },
];

export const supportChannels = [
  { id: "sp1", title: "Chat with support", meta: "Replies in under 5 minutes", icon: MessageCircleQuestion },
  { id: "sp2", title: "Ask the AI tutor", meta: "Instant answers, 24 × 7", icon: Sparkles },
  { id: "sp3", title: "Email us", meta: "help@yourcbse.com", icon: FileText },
];

/* ------------------------------------------------------------------ */
/* Global student search                                               */
/* ------------------------------------------------------------------ */

export type SearchKind =
  | "Lesson"
  | "Video"
  | "Notes"
  | "Question"
  | "Flashcards"
  | "Mind Map"
  | "Worksheet"
  | "Interactive Lesson";

export interface StudentSearchResult {
  id: string;
  title: string;
  kind: SearchKind;
  subject: string;
  meta: string;
}

export const searchKinds: SearchKind[] = [
  "Lesson",
  "Video",
  "Notes",
  "Question",
  "Flashcards",
  "Mind Map",
  "Worksheet",
  "Interactive Lesson",
];

export const searchKindIcons: Record<SearchKind, LucideIcon> = {
  Lesson: BookOpenCheck,
  Video: PlayCircle,
  Notes: NotebookPen,
  Question: FileQuestion,
  Flashcards: Layers3,
  "Mind Map": Network,
  Worksheet: FileStack,
  "Interactive Lesson": Atom,
};

export const studentSearchResults: StudentSearchResult[] = [
  { id: "sr1", title: "Euclid's division lemma", kind: "Lesson", subject: "Mathematics", meta: "Real Numbers · 12 min" },
  { id: "sr2", title: "Trigonometric ratios explained", kind: "Video", subject: "Mathematics", meta: "14 min · HD" },
  { id: "sr3", title: "Real Numbers — quick notes", kind: "Notes", subject: "Mathematics", meta: "4 pages" },
  { id: "sr4", title: "Board 2024 Q17 — HCF proof", kind: "Question", subject: "Mathematics", meta: "3 marks" },
  { id: "sr5", title: "Periodic table deck", kind: "Flashcards", subject: "Science", meta: "48 cards" },
  { id: "sr6", title: "Life Processes concept map", kind: "Mind Map", subject: "Science", meta: "1 page" },
  { id: "sr7", title: "Polynomials practice sheet", kind: "Worksheet", subject: "Mathematics", meta: "PDF · 1.2 MB" },
  { id: "sr8", title: "Ray diagram simulator", kind: "Interactive Lesson", subject: "Science", meta: "Interactive app" },
  { id: "sr9", title: "Balancing chemical equations", kind: "Lesson", subject: "Science", meta: "Chemical Reactions · 9 min" },
  { id: "sr10", title: "Nationalism timeline video", kind: "Video", subject: "Social Science", meta: "22 min" },
  { id: "sr11", title: "Light — mirror formula sheet", kind: "Notes", subject: "Science", meta: "2 pages" },
  { id: "sr12", title: "Case study — soil conservation", kind: "Question", subject: "Social Science", meta: "4 marks" },
];

export const popularSearches = [
  "Real Numbers",
  "Mirror formula",
  "Trigonometry table",
  "Balancing equations",
  "Previous year papers",
  "Life Processes diagram",
];
