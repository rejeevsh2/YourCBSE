/**
 * Mock catalogue for the Search & Resource Center.
 *
 * Everything here is placeholder content shaped exactly like the future
 * Laravel payloads, so swapping the service implementation needs no UI change.
 */

export const resourceCategories = [
  "Interactive Lessons",
  "Videos",
  "PDF Notes",
  "Worksheets",
  "Question Bank",
  "Flashcards",
  "Mind Maps",
  "Important Questions",
  "Formula Sheets",
  "NCERT Solutions",
  "Case Studies",
  "Assertion & Reason",
  "Previous Year Questions",
  "Sample Papers",
  "Mock Tests",
] as const;

export type ResourceCategory = (typeof resourceCategories)[number];

export const searchEntityKinds = [
  "Grade",
  "Subject",
  "Chapter",
  "Lesson",
  "Video",
  "Notes",
  "Worksheet",
  "Flashcards",
  "Mind Map",
  "Question Bank",
  "MCQ",
  "Interactive Lesson",
  "NCERT Solution",
] as const;

export type SearchEntityKind = (typeof searchEntityKinds)[number];

export type ResourceDifficulty = "Easy" | "Medium" | "Hard";
export type ResourceStatus = "Completed" | "In progress" | "Not started";
export type ResourceLanguage = "English" | "Hindi" | "Bilingual";

export interface LibraryResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  kind: SearchEntityKind;
  grade: string;
  subject: string;
  chapter: string;
  author: string;
  updatedAt: string;
  addedDaysAgo: number;
  durationMinutes: number;
  difficulty: ResourceDifficulty;
  language: ResourceLanguage;
  downloads: number;
  bookmarks: number;
  popularity: number;
  fileType: string;
  fileSizeMb: number;
  status: ResourceStatus;
  tags: string[];
}

export interface CategoryMeta {
  category: ResourceCategory;
  blurb: string;
  icon: string;
  accent: string;
}

/** Icon name maps to the registry in `components/resource-center/category-icons.ts`. */
export const categoryMeta: CategoryMeta[] = [
  { category: "Interactive Lessons", blurb: "Simulations and guided walkthroughs", icon: "Sparkles", accent: "from-primary/25 to-primary/5" },
  { category: "Videos", blurb: "Concept explainers and revision clips", icon: "PlayCircle", accent: "from-rose-500/25 to-rose-500/5" },
  { category: "PDF Notes", blurb: "Chapter notes ready for offline study", icon: "FileText", accent: "from-sky-500/25 to-sky-500/5" },
  { category: "Worksheets", blurb: "Printable practice for every topic", icon: "PenSquare", accent: "from-amber-500/25 to-amber-500/5" },
  { category: "Question Bank", blurb: "Topic-tagged question collections", icon: "Database", accent: "from-violet-500/25 to-violet-500/5" },
  { category: "Flashcards", blurb: "Rapid recall decks for revision", icon: "Layers", accent: "from-emerald-500/25 to-emerald-500/5" },
  { category: "Mind Maps", blurb: "Visual summaries of full chapters", icon: "Network", accent: "from-cyan-500/25 to-cyan-500/5" },
  { category: "Important Questions", blurb: "High-weightage exam favourites", icon: "Star", accent: "from-yellow-500/25 to-yellow-500/5" },
  { category: "Formula Sheets", blurb: "One-page formula references", icon: "Sigma", accent: "from-indigo-500/25 to-indigo-500/5" },
  { category: "NCERT Solutions", blurb: "Step-by-step textbook answers", icon: "BookOpen", accent: "from-teal-500/25 to-teal-500/5" },
  { category: "Case Studies", blurb: "Application-based CBSE questions", icon: "Briefcase", accent: "from-orange-500/25 to-orange-500/5" },
  { category: "Assertion & Reason", blurb: "Reasoning drills with explanations", icon: "GitCompare", accent: "from-fuchsia-500/25 to-fuchsia-500/5" },
  { category: "Previous Year Questions", blurb: "Board papers sorted by chapter", icon: "History", accent: "from-slate-500/25 to-slate-500/5" },
  { category: "Sample Papers", blurb: "Full-length CBSE blueprint papers", icon: "ClipboardList", accent: "from-blue-500/25 to-blue-500/5" },
  { category: "Mock Tests", blurb: "Timed tests with instant scoring", icon: "Timer", accent: "from-red-500/25 to-red-500/5" },
];

export const categoryToKind: Record<ResourceCategory, SearchEntityKind> = {
  "Interactive Lessons": "Interactive Lesson",
  Videos: "Video",
  "PDF Notes": "Notes",
  Worksheets: "Worksheet",
  "Question Bank": "Question Bank",
  Flashcards: "Flashcards",
  "Mind Maps": "Mind Map",
  "Important Questions": "Question Bank",
  "Formula Sheets": "Notes",
  "NCERT Solutions": "NCERT Solution",
  "Case Studies": "Question Bank",
  "Assertion & Reason": "MCQ",
  "Previous Year Questions": "Question Bank",
  "Sample Papers": "Question Bank",
  "Mock Tests": "MCQ",
};

const fileTypeByCategory: Record<ResourceCategory, string> = {
  "Interactive Lessons": "APP",
  Videos: "MP4",
  "PDF Notes": "PDF",
  Worksheets: "PDF",
  "Question Bank": "PDF",
  Flashcards: "DECK",
  "Mind Maps": "PNG",
  "Important Questions": "PDF",
  "Formula Sheets": "PDF",
  "NCERT Solutions": "PDF",
  "Case Studies": "PDF",
  "Assertion & Reason": "PDF",
  "Previous Year Questions": "PDF",
  "Sample Papers": "PDF",
  "Mock Tests": "TEST",
};

interface Seed {
  chapter: string;
  subject: string;
  grade: string;
  author: string;
}

const seeds: Seed[] = [
  { chapter: "Real Numbers", subject: "Mathematics", grade: "Class 10", author: "Anita Verma" },
  { chapter: "Polynomials", subject: "Mathematics", grade: "Class 10", author: "Rakesh Nair" },
  { chapter: "Light — Reflection & Refraction", subject: "Science", grade: "Class 10", author: "Sunita Rao" },
  { chapter: "Life Processes", subject: "Science", grade: "Class 10", author: "Imran Khan" },
  { chapter: "Nationalism in India", subject: "Social Science", grade: "Class 10", author: "Meera Joshi" },
  { chapter: "Motion", subject: "Science", grade: "Class 9", author: "Sunita Rao" },
  { chapter: "Number Systems", subject: "Mathematics", grade: "Class 9", author: "Anita Verma" },
  { chapter: "Integrals", subject: "Mathematics", grade: "Class 12", author: "Rakesh Nair" },
  { chapter: "Current Electricity", subject: "Physics", grade: "Class 12", author: "Devansh Patel" },
  { chapter: "Chemical Kinetics", subject: "Chemistry", grade: "Class 12", author: "Farah Sheikh" },
  { chapter: "Tenses & Grammar", subject: "English", grade: "Class 8", author: "Lata Menon" },
  { chapter: "Crop Production", subject: "Science", grade: "Class 8", author: "Imran Khan" },
];

const difficulties: ResourceDifficulty[] = ["Easy", "Medium", "Hard"];
const languages: ResourceLanguage[] = ["English", "Hindi", "Bilingual"];
const statuses: ResourceStatus[] = ["Completed", "In progress", "Not started"];

function titleFor(category: ResourceCategory, chapter: string) {
  switch (category) {
    case "Videos":
      return `${chapter} — video explainer`;
    case "PDF Notes":
      return `${chapter} — chapter notes`;
    case "Flashcards":
      return `${chapter} flash-card deck`;
    case "Mind Maps":
      return `${chapter} mind map`;
    case "Mock Tests":
      return `${chapter} mock test`;
    case "Sample Papers":
      return `${chapter} sample paper`;
    case "NCERT Solutions":
      return `NCERT Solutions — ${chapter}`;
    default:
      return `${chapter} — ${category.toLowerCase()}`;
  }
}

function descriptionFor(category: ResourceCategory, chapter: string, subject: string) {
  return `${category} covering every key idea of ${chapter} in ${subject}, aligned to the latest CBSE syllabus and exam pattern.`;
}

/** Deterministic pseudo-catalogue so screens stay stable between renders. */
export const libraryResources: LibraryResource[] = resourceCategories.flatMap(
  (category, categoryIndex) =>
    seeds.map((seed, seedIndex) => {
      const n = categoryIndex * seeds.length + seedIndex;
      const addedDaysAgo = (n * 3) % 60;
      return {
        id: `res-${categoryIndex + 1}-${seedIndex + 1}`,
        title: titleFor(category, seed.chapter),
        description: descriptionFor(category, seed.chapter, seed.subject),
        category,
        kind: categoryToKind[category],
        grade: seed.grade,
        subject: seed.subject,
        chapter: seed.chapter,
        author: seed.author,
        updatedAt: new Date(2026, 6, 30 - (addedDaysAgo % 28)).toISOString().slice(0, 10),
        addedDaysAgo,
        durationMinutes: [8, 15, 22, 35, 50][n % 5],
        difficulty: difficulties[n % 3],
        language: languages[n % 3],
        downloads: 180 + ((n * 137) % 4200),
        bookmarks: 20 + ((n * 61) % 900),
        popularity: 40 + ((n * 29) % 60),
        fileType: fileTypeByCategory[category],
        fileSizeMb: Number((0.4 + ((n * 7) % 45) / 10).toFixed(1)),
        status: statuses[n % 3],
        tags: [seed.subject, seed.grade, category],
      } satisfies LibraryResource;
    }),
);

/** Mixed-category ordering used by "recently viewed" style shelves. */
export const mixedResources: LibraryResource[] = resourceCategories
  .map((category, index) => libraryResources.filter((r) => r.category === category)[index % 12])
  .filter(Boolean);

export const resourceById = new Map(libraryResources.map((item) => [item.id, item]));

export const libraryGrades = Array.from(new Set(libraryResources.map((r) => r.grade)));
export const librarySubjects = Array.from(new Set(libraryResources.map((r) => r.subject)));
export const libraryChapterNames = Array.from(new Set(libraryResources.map((r) => r.chapter)));

export const trendingSearchTerms = [
  "Real Numbers",
  "Light reflection",
  "Class 12 Integrals",
  "Sample papers 2026",
  "Periodic table",
  "Assertion & reason",
];

export const popularChapters = seeds.slice(0, 6).map((seed, index) => ({
  id: `pop-${index + 1}`,
  chapter: seed.chapter,
  subject: seed.subject,
  grade: seed.grade,
  learners: 1200 + index * 430,
}));

export const recommendationRails = [
  { id: "continue", title: "Continue learning", blurb: "Pick up exactly where you stopped." },
  { id: "recommended", title: "Recommended chapters", blurb: "Matched to your class and subjects." },
  { id: "popular", title: "Popular resources", blurb: "Most opened across YourTeacher this month." },
  { id: "progress", title: "Based on your progress", blurb: "Strengthen the topics you scored lowest in." },
  { id: "trending", title: "Trending this week", blurb: "What Class 6–12 learners are studying now." },
] as const;

export type RecommendationRailId = (typeof recommendationRails)[number]["id"];

/** Spreads picks across categories so every shelf looks varied. */
function spread(items: LibraryResource[], limit = 8): LibraryResource[] {
  const seen = new Set<string>();
  const picked: LibraryResource[] = [];
  for (const item of items) {
    if (seen.has(item.category)) continue;
    seen.add(item.category);
    picked.push(item);
    if (picked.length === limit) return picked;
  }
  for (const item of items) {
    if (picked.includes(item)) continue;
    picked.push(item);
    if (picked.length === limit) break;
  }
  return picked;
}

export function resourcesForRail(railId: RecommendationRailId): LibraryResource[] {
  switch (railId) {
    case "continue":
      return spread(libraryResources.filter((r) => r.status === "In progress"));
    case "recommended":
      return spread(libraryResources.filter((r) => r.grade === "Class 10"));
    case "popular":
      return spread([...libraryResources].sort((a, b) => b.downloads - a.downloads));
    case "progress":
      return spread(libraryResources.filter((r) => r.difficulty === "Hard"));
    case "trending":
    default:
      return spread([...libraryResources].sort((a, b) => b.popularity - a.popularity));
  }
}

export function relatedResources(resource: LibraryResource, limit = 4): LibraryResource[] {
  return libraryResources
    .filter((item) => item.id !== resource.id && item.chapter === resource.chapter)
    .slice(0, limit);
}

export function recommendedResources(resource: LibraryResource, limit = 4): LibraryResource[] {
  return libraryResources
    .filter(
      (item) =>
        item.id !== resource.id &&
        item.subject === resource.subject &&
        item.chapter !== resource.chapter,
    )
    .slice(0, limit);
}

export const difficultyTone: Record<ResourceDifficulty, string> = {
  Easy: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  Hard: "bg-destructive/10 text-destructive",
};

export const statusTone: Record<ResourceStatus, string> = {
  Completed: "bg-success/15 text-success",
  "In progress": "bg-primary/15 text-primary",
  "Not started": "bg-muted text-muted-foreground",
};

