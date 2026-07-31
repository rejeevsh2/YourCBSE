/**
 * Teacher Studio placeholder data.
 * Phase 1: UI only — shapes mirror the future Laravel + MySQL API.
 */

export type ContentStatus = "Published" | "Draft" | "In review" | "Archived";

export interface StudioChapter {
  id: string;
  title: string;
  grade: string;
  subject: string;
  status: ContentStatus;
  updatedAt: string;
  version: string;
  modules: number;
}

export interface StudioApp {
  id: string;
  name: string;
  grade: string;
  subject: string;
  chapter: string;
  version: string;
  status: ContentStatus;
  sizeLabel: string;
  source: "ZIP upload" | "HTML upload" | "GitHub";
  updatedAt: string;
}

export type ResourceKind =
  | "Video"
  | "PDF Notes"
  | "Worksheet"
  | "Flashcards"
  | "Mind Map"
  | "Image"
  | "Audio"
  | "Document";

export interface StudioResource {
  id: string;
  title: string;
  kind: ResourceKind;
  grade: string;
  subject: string;
  chapter: string;
  sizeLabel: string;
  status: ContentStatus;
  updatedAt: string;
}

export type QuestionKind =
  | "MCQ"
  | "True / False"
  | "Fill in the Blanks"
  | "Match the Following"
  | "Short Answer"
  | "Long Answer"
  | "Assertion & Reason"
  | "Case Study"
  | "HOTS";

export interface StudioQuestion {
  id: string;
  prompt: string;
  kind: QuestionKind;
  grade: string;
  subject: string;
  chapter: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
  status: ContentStatus;
}

export const teacherProfile = {
  name: "Meera Iyer",
  role: "Science & Mathematics",
  school: "Delhi Public School, Bengaluru",
};

export const studioStats = [
  { label: "Total chapters", value: "38", hint: "+2 this week", tone: "success" as const },
  { label: "Interactive apps", value: "12", hint: "3 in review", tone: "primary" as const },
  { label: "Videos", value: "64", hint: "18h library", tone: "primary" as const },
  { label: "Worksheets", value: "27", hint: "PDF + editable", tone: "primary" as const },
  { label: "Question bank", value: "480", hint: "9 formats", tone: "warning" as const },
  { label: "Students", value: "412", hint: "6 classes", tone: "primary" as const },
  { label: "Draft content", value: "9", hint: "Needs review", tone: "warning" as const },
  { label: "Published content", value: "131", hint: "Live now", tone: "success" as const },
];

export const studioActivity = [
  { id: "a1", actor: "You", action: "published", target: "Real Numbers — Interactive App v2.1", at: "12 minutes ago" },
  { id: "a2", actor: "Rahul V.", action: "commented on", target: "Light: Reflection worksheet", at: "1 hour ago" },
  { id: "a3", actor: "You", action: "uploaded", target: "Chemical Reactions — Mind map", at: "3 hours ago" },
  { id: "a4", actor: "Studio", action: "archived", target: "Polynomials v1.4", at: "Yesterday" },
  { id: "a5", actor: "You", action: "added 24 questions to", target: "Trigonometry question bank", at: "2 days ago" },
];

export const studioTasks = [
  { id: "t1", title: "Review Grade 10 Science drafts", due: "Today", priority: "High" as const },
  { id: "t2", title: "Publish Quadratic Equations app", due: "Tomorrow", priority: "High" as const },
  { id: "t3", title: "Record Chapter 6 video lesson", due: "Fri, 14 Aug", priority: "Medium" as const },
  { id: "t4", title: "Grade Assignment 12 submissions", due: "Mon, 17 Aug", priority: "Medium" as const },
  { id: "t5", title: "Refresh flashcards for Class 9", due: "Next week", priority: "Low" as const },
];

export const studioClasses = [
  { id: "c1", name: "Class 10 — A", subject: "Mathematics", students: 42, progress: 78, nextSession: "Mon 09:15" },
  { id: "c2", name: "Class 10 — B", subject: "Mathematics", students: 39, progress: 64, nextSession: "Mon 11:00" },
  { id: "c3", name: "Class 9 — A", subject: "Science", students: 44, progress: 71, nextSession: "Tue 08:30" },
  { id: "c4", name: "Class 9 — C", subject: "Science", students: 41, progress: 52, nextSession: "Wed 10:20" },
  { id: "c5", name: "Class 8 — B", subject: "Science", students: 38, progress: 46, nextSession: "Thu 09:15" },
  { id: "c6", name: "Class 12 — A", subject: "Mathematics", students: 35, progress: 83, nextSession: "Fri 12:40" },
];

export const studioChapters: StudioChapter[] = [
  { id: "ch1", title: "Real Numbers", grade: "Grade 10", subject: "Mathematics", status: "Published", updatedAt: "12 Aug 2026", version: "v2.1", modules: 18 },
  { id: "ch2", title: "Polynomials", grade: "Grade 10", subject: "Mathematics", status: "Draft", updatedAt: "11 Aug 2026", version: "v1.4", modules: 12 },
  { id: "ch3", title: "Light — Reflection & Refraction", grade: "Grade 10", subject: "Science", status: "Published", updatedAt: "09 Aug 2026", version: "v3.0", modules: 21 },
  { id: "ch4", title: "Chemical Reactions & Equations", grade: "Grade 10", subject: "Science", status: "In review", updatedAt: "08 Aug 2026", version: "v1.9", modules: 16 },
  { id: "ch5", title: "Linear Equations in Two Variables", grade: "Grade 9", subject: "Mathematics", status: "Published", updatedAt: "05 Aug 2026", version: "v2.3", modules: 14 },
  { id: "ch6", title: "Tissues", grade: "Grade 9", subject: "Science", status: "Draft", updatedAt: "03 Aug 2026", version: "v0.8", modules: 9 },
  { id: "ch7", title: "Force & Laws of Motion", grade: "Grade 9", subject: "Science", status: "Published", updatedAt: "01 Aug 2026", version: "v2.0", modules: 17 },
  { id: "ch8", title: "Relations & Functions", grade: "Grade 12", subject: "Mathematics", status: "Archived", updatedAt: "24 Jul 2026", version: "v1.1", modules: 11 },
];

export const studioApps: StudioApp[] = [
  { id: "ap1", name: "Number Line Explorer", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", version: "v2.1", status: "Published", sizeLabel: "4.2 MB", source: "ZIP upload", updatedAt: "12 Aug 2026" },
  { id: "ap2", name: "Ray Diagram Lab", grade: "Grade 10", subject: "Science", chapter: "Light", version: "v3.0", status: "Published", sizeLabel: "6.8 MB", source: "GitHub", updatedAt: "09 Aug 2026" },
  { id: "ap3", name: "Balance the Equation", grade: "Grade 10", subject: "Science", chapter: "Chemical Reactions", version: "v1.9", status: "In review", sizeLabel: "3.1 MB", source: "ZIP upload", updatedAt: "08 Aug 2026" },
  { id: "ap4", name: "Graph Plotter", grade: "Grade 9", subject: "Mathematics", chapter: "Linear Equations", version: "v2.3", status: "Published", sizeLabel: "2.4 MB", source: "HTML upload", updatedAt: "05 Aug 2026" },
  { id: "ap5", name: "Cell Structure Viewer", grade: "Grade 9", subject: "Science", chapter: "Tissues", version: "v0.8", status: "Draft", sizeLabel: "8.9 MB", source: "GitHub", updatedAt: "03 Aug 2026" },
  { id: "ap6", name: "Motion Simulator", grade: "Grade 9", subject: "Science", chapter: "Force & Laws of Motion", version: "v2.0", status: "Published", sizeLabel: "5.5 MB", source: "ZIP upload", updatedAt: "01 Aug 2026" },
];

export const appVersionHistory = [
  { id: "v1", version: "v2.1", note: "Added guided hints and keyboard controls", at: "12 Aug 2026", author: "Meera Iyer" },
  { id: "v2", version: "v2.0", note: "Rebuilt canvas renderer for mobile", at: "28 Jul 2026", author: "Meera Iyer" },
  { id: "v3", version: "v1.6", note: "Fixed drag precision on touch devices", at: "14 Jul 2026", author: "Rahul V." },
];

export const studioResources: StudioResource[] = [
  { id: "r1", title: "Real Numbers — Full lesson", kind: "Video", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", sizeLabel: "18:24", status: "Published", updatedAt: "12 Aug 2026" },
  { id: "r2", title: "Euclid's Division Lemma notes", kind: "PDF Notes", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", sizeLabel: "1.8 MB", status: "Published", updatedAt: "12 Aug 2026" },
  { id: "r3", title: "Light — Practice worksheet 3", kind: "Worksheet", grade: "Grade 10", subject: "Science", chapter: "Light", sizeLabel: "820 KB", status: "Draft", updatedAt: "10 Aug 2026" },
  { id: "r4", title: "Periodic table flashcards", kind: "Flashcards", grade: "Grade 10", subject: "Science", chapter: "Periodic Classification", sizeLabel: "48 cards", status: "Published", updatedAt: "09 Aug 2026" },
  { id: "r5", title: "Chemical Reactions mind map", kind: "Mind Map", grade: "Grade 10", subject: "Science", chapter: "Chemical Reactions", sizeLabel: "1.1 MB", status: "In review", updatedAt: "08 Aug 2026" },
  { id: "r6", title: "Ray diagram illustrations", kind: "Image", grade: "Grade 10", subject: "Science", chapter: "Light", sizeLabel: "12 files", status: "Published", updatedAt: "07 Aug 2026" },
  { id: "r7", title: "Pronunciation drill — Hindi", kind: "Audio", grade: "Grade 9", subject: "Hindi", chapter: "Kavya Khand", sizeLabel: "06:12", status: "Published", updatedAt: "06 Aug 2026" },
  { id: "r8", title: "Lab manual — Class 9 Science", kind: "Document", grade: "Grade 9", subject: "Science", chapter: "Lab work", sizeLabel: "3.4 MB", status: "Published", updatedAt: "04 Aug 2026" },
  { id: "r9", title: "Tissues — Concept video", kind: "Video", grade: "Grade 9", subject: "Science", chapter: "Tissues", sizeLabel: "11:05", status: "Draft", updatedAt: "03 Aug 2026" },
  { id: "r10", title: "Motion formula sheet", kind: "PDF Notes", grade: "Grade 9", subject: "Science", chapter: "Force & Laws of Motion", sizeLabel: "640 KB", status: "Published", updatedAt: "01 Aug 2026" },
  { id: "r11", title: "Trigonometry revision worksheet", kind: "Worksheet", grade: "Grade 10", subject: "Mathematics", chapter: "Trigonometry", sizeLabel: "1.2 MB", status: "Published", updatedAt: "29 Jul 2026" },
  { id: "r12", title: "Algebra identities flashcards", kind: "Flashcards", grade: "Grade 9", subject: "Mathematics", chapter: "Polynomials", sizeLabel: "32 cards", status: "Draft", updatedAt: "27 Jul 2026" },
];

export const studioQuestions: StudioQuestion[] = [
  { id: "q1", prompt: "The decimal expansion of 17/8 will terminate after how many places?", kind: "MCQ", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", difficulty: "Easy", marks: 1, status: "Published" },
  { id: "q2", prompt: "Every composite number can be expressed as a product of primes.", kind: "True / False", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", difficulty: "Easy", marks: 1, status: "Published" },
  { id: "q3", prompt: "The image formed by a plane mirror is always ______.", kind: "Fill in the Blanks", grade: "Grade 10", subject: "Science", chapter: "Light", difficulty: "Easy", marks: 1, status: "Published" },
  { id: "q4", prompt: "Match each mirror type with its field of view.", kind: "Match the Following", grade: "Grade 10", subject: "Science", chapter: "Light", difficulty: "Moderate", marks: 4, status: "Draft" },
  { id: "q5", prompt: "State the laws of refraction of light.", kind: "Short Answer", grade: "Grade 10", subject: "Science", chapter: "Light", difficulty: "Moderate", marks: 3, status: "Published" },
  { id: "q6", prompt: "Derive the mirror formula with a labelled ray diagram.", kind: "Long Answer", grade: "Grade 10", subject: "Science", chapter: "Light", difficulty: "Challenging", marks: 5, status: "In review" },
  { id: "q7", prompt: "Assertion: √2 is irrational. Reason: Prime factorisation is unique.", kind: "Assertion & Reason", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", difficulty: "Moderate", marks: 1, status: "Published" },
  { id: "q8", prompt: "A shopkeeper stacks trays of 24 and 36 items — read the case and answer.", kind: "Case Study", grade: "Grade 10", subject: "Mathematics", chapter: "Real Numbers", difficulty: "Challenging", marks: 4, status: "Published" },
  { id: "q9", prompt: "Why does a concave mirror form a virtual image only within the focus?", kind: "HOTS", grade: "Grade 10", subject: "Science", chapter: "Light", difficulty: "Challenging", marks: 3, status: "Draft" },
  { id: "q10", prompt: "Identify the balanced form of the given chemical equation.", kind: "MCQ", grade: "Grade 10", subject: "Science", chapter: "Chemical Reactions", difficulty: "Moderate", marks: 1, status: "Published" },
];

export const questionKinds: QuestionKind[] = [
  "MCQ",
  "True / False",
  "Fill in the Blanks",
  "Match the Following",
  "Short Answer",
  "Long Answer",
  "Assertion & Reason",
  "Case Study",
  "HOTS",
];

export const studioAssignments = [
  { id: "as1", title: "Real Numbers — Weekly practice", classroom: "Class 10 — A", due: "16 Aug 2026", submitted: 31, total: 42, status: "Published" as ContentStatus },
  { id: "as2", title: "Light — Ray diagram sheet", classroom: "Class 10 — B", due: "18 Aug 2026", submitted: 12, total: 39, status: "Published" as ContentStatus },
  { id: "as3", title: "Tissues — Labelling task", classroom: "Class 9 — A", due: "20 Aug 2026", submitted: 0, total: 44, status: "Draft" as ContentStatus },
  { id: "as4", title: "Motion — Numericals set 2", classroom: "Class 9 — C", due: "22 Aug 2026", submitted: 8, total: 41, status: "In review" as ContentStatus },
];

export const studioStudents = [
  { id: "s1", name: "Ananya Sharma", classroom: "Class 10 — A", progress: 86, lastActive: "Today", flag: "On track" },
  { id: "s2", name: "Kabir Menon", classroom: "Class 10 — A", progress: 64, lastActive: "Yesterday", flag: "On track" },
  { id: "s3", name: "Ishita Rao", classroom: "Class 10 — B", progress: 41, lastActive: "3 days ago", flag: "Needs help" },
  { id: "s4", name: "Aarav Gupta", classroom: "Class 9 — A", progress: 92, lastActive: "Today", flag: "Ahead" },
  { id: "s5", name: "Zoya Khan", classroom: "Class 9 — C", progress: 33, lastActive: "1 week ago", flag: "Needs help" },
  { id: "s6", name: "Dev Patel", classroom: "Class 12 — A", progress: 77, lastActive: "Today", flag: "On track" },
];

export const studioMessages = [
  { id: "m1", from: "Ishita Rao", role: "Class 10 — B", preview: "Ma'am, could you re-share the refraction worksheet?", at: "18m", unread: true },
  { id: "m2", from: "Parent — Mr. Gupta", role: "Aarav's father", preview: "Thank you for the detailed progress note.", at: "2h", unread: true },
  { id: "m3", from: "Rahul V.", role: "Co-teacher", preview: "I reviewed the chemical equations app, looks great.", at: "5h", unread: false },
  { id: "m4", from: "Academic office", role: "Announcement", preview: "Term 2 content freeze begins 25 Aug.", at: "1d", unread: false },
];

export const studioAnalytics = [
  { label: "Views", value: "48,210", hint: "+12% vs last month", tone: "success" as const },
  { label: "Completion rate", value: "72%", hint: "Target 75%", tone: "primary" as const },
  { label: "Avg. study time", value: "26 min", hint: "Per session", tone: "primary" as const },
  { label: "Downloads", value: "9,340", hint: "Notes & worksheets", tone: "primary" as const },
  { label: "Quiz attempts", value: "15,876", hint: "+8% this week", tone: "warning" as const },
  { label: "Active learners", value: "412", hint: "6 classes", tone: "success" as const },
];

export const topChapters = [
  { id: "tc1", title: "Light — Reflection & Refraction", views: 8420, completion: 81 },
  { id: "tc2", title: "Real Numbers", views: 7310, completion: 76 },
  { id: "tc3", title: "Chemical Reactions & Equations", views: 6180, completion: 69 },
  { id: "tc4", title: "Force & Laws of Motion", views: 5240, completion: 64 },
  { id: "tc5", title: "Linear Equations in Two Variables", views: 4890, completion: 58 },
];

export const studioGrades = [
  { id: "g6", name: "Grade 6", subjects: 5, chapters: 42, students: 0 },
  { id: "g7", name: "Grade 7", subjects: 5, chapters: 46, students: 0 },
  { id: "g8", name: "Grade 8", subjects: 6, chapters: 51, students: 38 },
  { id: "g9", name: "Grade 9", subjects: 6, chapters: 58, students: 85 },
  { id: "g10", name: "Grade 10", subjects: 6, chapters: 62, students: 81 },
  { id: "g12", name: "Grade 12", subjects: 4, chapters: 44, students: 35 },
];
