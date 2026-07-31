import type { LucideIcon } from "lucide-react";
import {
  Award,
  Binary,
  BookMarked,
  BookOpenCheck,
  Brain,
  CalendarClock,
  ClipboardCheck,
  Clock3,
  Download,
  FileQuestion,
  FileStack,
  FileText,
  FlaskConical,
  Flame,
  Languages,
  Layers3,
  Lightbulb,
  ListChecks,
  Medal,
  Network,
  NotebookPen,
  PlayCircle,
  Sigma,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Learner profile + dashboard                                         */
/* ------------------------------------------------------------------ */

export const learner = {
  name: "Ananya",
  grade: "Class 10",
  board: "CBSE 2026–27",
  streak: 7,
  longestStreak: 21,
  dailyGoalMinutes: 60,
  minutesToday: 42,
  xp: 4820,
  level: 12,
  nextLevelXp: 6000,
};

export const weeklyMinutes = [45, 62, 30, 78, 55, 90, 42];
export const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface ContinueItem {
  id: string;
  title: string;
  meta: string;
  progress: number;
  nextUp: string;
  minutesLeft: number;
}

export const continueLearning: ContinueItem[] = [
  {
    id: "cl1",
    title: "Real Numbers",
    meta: "Class 10 · Mathematics",
    progress: 72,
    nextUp: "Lesson 4 — Euclid's division lemma",
    minutesLeft: 12,
  },
  {
    id: "cl2",
    title: "Light — Reflection and Refraction",
    meta: "Class 10 · Science",
    progress: 45,
    nextUp: "Interactive — Ray diagram simulator",
    minutesLeft: 18,
  },
  {
    id: "cl3",
    title: "Nationalism in India",
    meta: "Class 10 · Social Science",
    progress: 20,
    nextUp: "Lesson 2 — The Non-Cooperation movement",
    minutesLeft: 25,
  },
];

export interface RecommendedChapter {
  id: string;
  title: string;
  subject: string;
  reason: string;
  minutes: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
}

export const recommendedChapters: RecommendedChapter[] = [
  {
    id: "rc1",
    title: "Polynomials",
    subject: "Mathematics",
    reason: "Builds on Real Numbers, which you just finished",
    minutes: 35,
    difficulty: "Moderate",
  },
  {
    id: "rc2",
    title: "Chemical Reactions and Equations",
    subject: "Science",
    reason: "Frequently tested — 8 marks in last 3 papers",
    minutes: 40,
    difficulty: "Moderate",
  },
  {
    id: "rc3",
    title: "Trigonometry — Introduction",
    subject: "Mathematics",
    reason: "Your weakest topic this month",
    minutes: 45,
    difficulty: "Challenging",
  },
  {
    id: "rc4",
    title: "Life Processes",
    subject: "Science",
    reason: "Short chapter — good for a 30-minute session",
    minutes: 30,
    difficulty: "Easy",
  },
];

export interface UpcomingTest {
  id: string;
  date: string;
  day: string;
  title: string;
  meta: string;
  readiness: number;
}

export const upcomingTests: UpcomingTest[] = [
  {
    id: "ut1",
    date: "04",
    day: "Aug",
    title: "Mathematics Unit Test",
    meta: "Chapters 1–4 · 60 min",
    readiness: 78,
  },
  {
    id: "ut2",
    date: "09",
    day: "Aug",
    title: "Science Mock Paper",
    meta: "Full syllabus · 90 min",
    readiness: 54,
  },
  {
    id: "ut3",
    date: "16",
    day: "Aug",
    title: "Social Science Chapter Test",
    meta: "Nationalism in India · 40 min",
    readiness: 31,
  },
];

export interface ActivityEntry {
  id: string;
  text: string;
  time: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning";
}

export const recentActivity: ActivityEntry[] = [
  { id: "ra1", text: "Scored 18/20 in Polynomials practice set", time: "25 min ago", icon: ClipboardCheck, tone: "success" },
  { id: "ra2", text: "Bookmarked 'Chemical Reactions' quick notes", time: "2 hrs ago", icon: BookMarked, tone: "primary" },
  { id: "ra3", text: "Watched 'Trigonometric Ratios' lesson", time: "Yesterday", icon: PlayCircle, tone: "primary" },
  { id: "ra4", text: "Earned the 7-Day Streak badge", time: "Yesterday", icon: Flame, tone: "warning" },
  { id: "ra5", text: "Downloaded Class 10 Science sample paper", time: "2 days ago", icon: Download, tone: "primary" },
];

/* ------------------------------------------------------------------ */
/* Learning path                                                       */
/* ------------------------------------------------------------------ */

export type PathState = "completed" | "current" | "locked";

export interface PathStep {
  id: string;
  stage: string;
  title: string;
  detail: string;
  state: PathState;
  progress: number;
  icon: LucideIcon;
  meta: string;
}

export const learningPath: PathStep[] = [
  {
    id: "ps1",
    stage: "Grade",
    title: "Class 10 · CBSE",
    detail: "Six subjects, 58 chapters mapped to the 2026–27 syllabus.",
    state: "completed",
    progress: 100,
    icon: Trophy,
    meta: "Enrolled 12 Apr 2026",
  },
  {
    id: "ps2",
    stage: "Subject",
    title: "Mathematics",
    detail: "14 chapters · 62 lessons · 9 practice sets.",
    state: "completed",
    progress: 100,
    icon: Sigma,
    meta: "Selected as focus subject",
  },
  {
    id: "ps3",
    stage: "Chapter",
    title: "Chapter 1 — Real Numbers",
    detail: "Euclid's division lemma, HCF & LCM, irrational numbers.",
    state: "current",
    progress: 72,
    icon: BookOpenCheck,
    meta: "4 of 6 lessons done",
  },
  {
    id: "ps4",
    stage: "Lesson",
    title: "Lesson 4 — Euclid's Division Lemma",
    detail: "12-minute video, worked examples and an interactive walkthrough.",
    state: "current",
    progress: 35,
    icon: PlayCircle,
    meta: "12 min remaining",
  },
  {
    id: "ps5",
    stage: "Quiz",
    title: "Chapter 1 Quiz",
    detail: "20 MCQs, adaptive difficulty, instant explanations.",
    state: "locked",
    progress: 0,
    icon: ListChecks,
    meta: "Unlocks after Lesson 6",
  },
  {
    id: "ps6",
    stage: "Completed",
    title: "Chapter mastery",
    detail: "Earn the Real Numbers badge and unlock Polynomials.",
    state: "locked",
    progress: 0,
    icon: Medal,
    meta: "Reward: 250 XP",
  },
];

/* ------------------------------------------------------------------ */
/* Revision hub                                                        */
/* ------------------------------------------------------------------ */

export interface LaunchTile {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "destructive";
  badge?: string;
}

export const revisionTiles: LaunchTile[] = [
  { id: "rv1", title: "Quick Notes", description: "One-page summaries for every chapter you've studied.", meta: "58 notes", icon: NotebookPen, tone: "primary" },
  { id: "rv2", title: "Formula Sheet", description: "Every formula for Maths, Physics and Chemistry.", meta: "184 formulas", icon: Sigma, tone: "success" },
  { id: "rv3", title: "Mind Maps", description: "Visual concept maps to revise a chapter in minutes.", meta: "42 maps", icon: Network, tone: "primary" },
  { id: "rv4", title: "Flash Cards", description: "Spaced-repetition decks that adapt to your recall.", meta: "12 decks due", icon: Layers3, tone: "warning", badge: "Due today" },
  { id: "rv5", title: "Important Questions", description: "High-weightage questions curated by teachers.", meta: "320 questions", icon: Star, tone: "primary" },
  { id: "rv6", title: "Previous Year Questions", description: "Board questions from 2015 onwards, chapter-wise.", meta: "10 years", icon: FileStack, tone: "success" },
  { id: "rv7", title: "Practice Quiz", description: "Mixed revision quiz built from your weak topics.", meta: "15 questions", icon: ListChecks, tone: "warning" },
  { id: "rv8", title: "Revision Timer", description: "Pomodoro sessions with automatic break reminders.", meta: "25 / 5 min", icon: Timer, tone: "destructive" },
];

export const revisionQueue = [
  { id: "rq1", title: "Real Numbers — formula recall", due: "Due today", strength: 42 },
  { id: "rq2", title: "Light — mirror formula", due: "Due today", strength: 58 },
  { id: "rq3", title: "Acids, Bases and Salts", due: "Tomorrow", strength: 66 },
  { id: "rq4", title: "Nationalism in India — timeline", due: "In 3 days", strength: 81 },
];

/* ------------------------------------------------------------------ */
/* Practice centre                                                     */
/* ------------------------------------------------------------------ */

export const practiceTiles: LaunchTile[] = [
  { id: "pr1", title: "MCQ Practice", description: "Untimed multiple-choice sets with instant explanations.", meta: "1,240 questions", icon: ListChecks, tone: "primary" },
  { id: "pr2", title: "Timed Quiz", description: "Beat the clock — 15 questions in 10 minutes.", meta: "Best: 13/15", icon: Timer, tone: "warning" },
  { id: "pr3", title: "Mock Exam", description: "Full-length board pattern paper with marking scheme.", meta: "3 hrs · 80 marks", icon: ClipboardCheck, tone: "destructive" },
  { id: "pr4", title: "Subject Test", description: "Cover an entire subject in one assessment.", meta: "6 subjects", icon: BookOpenCheck, tone: "primary" },
  { id: "pr5", title: "Chapter Test", description: "Short test scoped to a single chapter.", meta: "58 chapters", icon: FileText, tone: "success" },
  { id: "pr6", title: "Previous Year Papers", description: "Solve real board papers with solutions.", meta: "2015–2025", icon: FileStack, tone: "success" },
  { id: "pr7", title: "Daily Challenge", description: "Five fresh questions every morning at 7 AM.", meta: "Streak: 7 days", icon: Zap, tone: "warning", badge: "New" },
];

export const practiceHistory = [
  { id: "ph1", title: "Polynomials — MCQ set", type: "MCQ Practice", score: "18 / 20", accuracy: 90, date: "Today" },
  { id: "ph2", title: "Light — Chapter test", type: "Chapter Test", score: "22 / 30", accuracy: 73, date: "Yesterday" },
  { id: "ph3", title: "Mathematics — Timed quiz", type: "Timed Quiz", score: "13 / 15", accuracy: 87, date: "28 Jul" },
  { id: "ph4", title: "Science — Mock exam", type: "Mock Exam", score: "58 / 80", accuracy: 72, date: "26 Jul" },
  { id: "ph5", title: "Board paper 2024", type: "Previous Year", score: "64 / 80", accuracy: 80, date: "24 Jul" },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export const studyHoursSeries = [6.5, 8.2, 5.4, 9.1, 7.8, 10.4, 8.6, 11.2, 9.4, 12.1, 10.8, 13.4];
export const monthLabelsShort = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
export const chaptersCompletedSeries = [1, 2, 2, 3, 2, 4, 3, 5, 4, 6, 5, 7];
export const scoreTrend = [58, 62, 61, 68, 71, 69, 74, 78, 76, 82, 85, 88];

export const subjectMastery = [
  { id: "sm1", label: "Mathematics", value: 88 },
  { id: "sm2", label: "Science", value: 76 },
  { id: "sm3", label: "Social Science", value: 64 },
  { id: "sm4", label: "English", value: 91 },
  { id: "sm5", label: "Hindi", value: 70 },
];

export const weakTopics = [
  { id: "wt1", label: "Trigonometry — heights & distances", caption: "Mathematics", value: "42%", share: 42 },
  { id: "wt2", label: "Electricity — circuit numericals", caption: "Science", value: "48%", share: 48 },
  { id: "wt3", label: "Nationalism in India — timelines", caption: "Social Science", value: "53%", share: 53 },
  { id: "wt4", label: "Carbon and its compounds", caption: "Science", value: "57%", share: 57 },
];

export const strongTopics = [
  { id: "st1", label: "Real Numbers", caption: "Mathematics", value: "96%", share: 96 },
  { id: "st2", label: "Light — reflection", caption: "Science", value: "92%", share: 92 },
  { id: "st3", label: "Reading comprehension", caption: "English", value: "91%", share: 91 },
  { id: "st4", label: "Life Processes", caption: "Science", value: "88%", share: 88 },
];

const streakMinutes = [
  0, 25, 45, 0, 60, 30, 90, 15, 0, 55, 40, 75, 20, 0, 35, 65, 0, 50, 85, 25, 45,
  70, 30, 0, 95, 40, 60, 15, 55, 80, 35, 45, 70, 50, 42,
];

export const streakCalendar = streakMinutes.map((minutes, index) => ({
  id: `d${index}`,
  minutes,
}));

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  earned: boolean;
  earnedOn?: string;
  progress?: number;
  tone: "primary" | "success" | "warning" | "destructive";
}

export const achievements: AchievementBadge[] = [
  { id: "ac1", title: "First Chapter Completed", description: "Finish your very first chapter end to end.", icon: BookOpenCheck, earned: true, earnedOn: "14 Apr 2026", tone: "success" },
  { id: "ac2", title: "7-Day Streak", description: "Study on seven consecutive days.", icon: Flame, earned: true, earnedOn: "29 Jul 2026", tone: "warning" },
  { id: "ac3", title: "Science Expert", description: "Score 85%+ across five Science chapter tests.", icon: FlaskConical, earned: true, earnedOn: "21 Jul 2026", tone: "primary" },
  { id: "ac4", title: "Math Master", description: "Complete every Mathematics chapter for your grade.", icon: Sigma, earned: false, progress: 64, tone: "primary" },
  { id: "ac5", title: "Perfect Score", description: "Get 100% on any timed quiz.", icon: Target, earned: false, progress: 87, tone: "success" },
  { id: "ac6", title: "100 MCQs Solved", description: "Answer 100 multiple-choice questions.", icon: ListChecks, earned: true, earnedOn: "09 Jul 2026", tone: "primary" },
  { id: "ac7", title: "Night Owl", description: "Complete a study session after 10 PM.", icon: Clock3, earned: true, earnedOn: "02 Jul 2026", tone: "primary" },
  { id: "ac8", title: "Comeback Kid", description: "Improve a weak topic score by 30 points.", icon: Award, earned: false, progress: 45, tone: "warning" },
  { id: "ac9", title: "30-Day Streak", description: "Study on thirty consecutive days.", icon: Trophy, earned: false, progress: 23, tone: "destructive" },
];

/* ------------------------------------------------------------------ */
/* AI study assistant                                                  */
/* ------------------------------------------------------------------ */

export interface AssistantSkill {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
}

export const assistantSkills: AssistantSkill[] = [
  { id: "as1", title: "Ask Questions", description: "Anything from the syllabus, answered in plain language.", prompt: "Why is √2 irrational?", icon: Sparkles },
  { id: "as2", title: "Explain Concepts", description: "Step-by-step explanations at your pace.", prompt: "Explain Euclid's division lemma simply", icon: Lightbulb },
  { id: "as3", title: "Generate MCQs", description: "Instant practice questions from any chapter.", prompt: "Give me 10 MCQs on Real Numbers", icon: ListChecks },
  { id: "as4", title: "Summarize Chapter", description: "A one-page recap before an exam.", prompt: "Summarise Light — Reflection and Refraction", icon: FileText },
  { id: "as5", title: "Translate Explanation", description: "Switch between English and Hindi instantly.", prompt: "Explain photosynthesis in Hindi", icon: Languages },
  { id: "as6", title: "Study Tips", description: "Personalised revision strategy for your week.", prompt: "Plan my revision for the Aug 4 unit test", icon: Brain },
  { id: "as7", title: "Homework Help", description: "Guided hints instead of straight answers.", prompt: "Help me solve Q7 from Exercise 1.2", icon: NotebookPen },
];

export const assistantTranscript = [
  { id: "m1", role: "assistant" as const, text: "Hi Ananya. You have a Mathematics unit test on 4 August. Want me to build a 3-day revision plan around Real Numbers and Polynomials?" },
  { id: "m2", role: "user" as const, text: "Yes, and explain Euclid's division lemma first." },
  {
    id: "m3",
    role: "assistant" as const,
    text: "Euclid's division lemma says that for any two positive integers a and b, there exist unique whole numbers q and r such that a = bq + r, where 0 ≤ r < b. In short: divide, note the remainder, repeat. That repetition is exactly how you find the HCF of two numbers.",
  },
];

/* ------------------------------------------------------------------ */
/* Bookmarks + downloads                                               */
/* ------------------------------------------------------------------ */

export type BookmarkKind =
  | "Video"
  | "Notes"
  | "Question"
  | "Flash Cards"
  | "Worksheet"
  | "Interactive Lesson";

export interface BookmarkItem {
  id: string;
  title: string;
  kind: BookmarkKind;
  subject: string;
  savedOn: string;
  meta: string;
}

export const bookmarkKinds: BookmarkKind[] = [
  "Video",
  "Notes",
  "Question",
  "Flash Cards",
  "Worksheet",
  "Interactive Lesson",
];

export const bookmarkIcons: Record<BookmarkKind, LucideIcon> = {
  Video: PlayCircle,
  Notes: FileText,
  Question: FileQuestion,
  "Flash Cards": Layers3,
  Worksheet: FileStack,
  "Interactive Lesson": Binary,
};

export const bookmarks: BookmarkItem[] = [
  { id: "bm1", title: "Trigonometric Ratios explained", kind: "Video", subject: "Mathematics", savedOn: "Today", meta: "14 min" },
  { id: "bm2", title: "Chemical Reactions — quick notes", kind: "Notes", subject: "Science", savedOn: "Today", meta: "6 pages" },
  { id: "bm3", title: "Board 2024 Q17 — HCF proof", kind: "Question", subject: "Mathematics", savedOn: "Yesterday", meta: "3 marks" },
  { id: "bm4", title: "Periodic table deck", kind: "Flash Cards", subject: "Science", savedOn: "Yesterday", meta: "48 cards" },
  { id: "bm5", title: "Polynomials practice sheet", kind: "Worksheet", subject: "Mathematics", savedOn: "28 Jul", meta: "PDF · 1.2 MB" },
  { id: "bm6", title: "Ray diagram simulator", kind: "Interactive Lesson", subject: "Science", savedOn: "27 Jul", meta: "Interactive" },
  { id: "bm7", title: "Life Processes — mind map", kind: "Notes", subject: "Science", savedOn: "26 Jul", meta: "1 page" },
  { id: "bm8", title: "Nationalism timeline video", kind: "Video", subject: "Social Science", savedOn: "24 Jul", meta: "22 min" },
];

export type DownloadKind = "PDF" | "Notes" | "Worksheets" | "Flash Cards" | "Mind Maps";

export interface DownloadItem {
  id: string;
  title: string;
  kind: DownloadKind;
  subject: string;
  size: string;
  downloadedOn: string;
}

export const downloadKinds: DownloadKind[] = ["PDF", "Notes", "Worksheets", "Flash Cards", "Mind Maps"];

export const downloadIcons: Record<DownloadKind, LucideIcon> = {
  PDF: FileText,
  Notes: NotebookPen,
  Worksheets: FileStack,
  "Flash Cards": Layers3,
  "Mind Maps": Network,
};

export const downloads: DownloadItem[] = [
  { id: "dl1", title: "Class 10 Science sample paper 2026", kind: "PDF", subject: "Science", size: "2.4 MB", downloadedOn: "Today" },
  { id: "dl2", title: "Real Numbers — revision notes", kind: "Notes", subject: "Mathematics", size: "820 KB", downloadedOn: "Today" },
  { id: "dl3", title: "Polynomials practice sheet", kind: "Worksheets", subject: "Mathematics", size: "1.2 MB", downloadedOn: "Yesterday" },
  { id: "dl4", title: "Periodic table deck", kind: "Flash Cards", subject: "Science", size: "640 KB", downloadedOn: "Yesterday" },
  { id: "dl5", title: "Life Processes concept map", kind: "Mind Maps", subject: "Science", size: "1.8 MB", downloadedOn: "28 Jul" },
  { id: "dl6", title: "Board paper 2024 with solutions", kind: "PDF", subject: "Mathematics", size: "3.1 MB", downloadedOn: "26 Jul" },
  { id: "dl7", title: "Trigonometry formula sheet", kind: "Notes", subject: "Mathematics", size: "410 KB", downloadedOn: "24 Jul" },
  { id: "dl8", title: "Nationalism in India — timeline map", kind: "Mind Maps", subject: "Social Science", size: "1.1 MB", downloadedOn: "22 Jul" },
];

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationKind =
  | "New Chapter"
  | "Upcoming Test"
  | "Assignment Reminder"
  | "Study Reminder"
  | "Achievement Earned";

export interface StudentNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notificationIcons: Record<NotificationKind, LucideIcon> = {
  "New Chapter": BookOpenCheck,
  "Upcoming Test": CalendarClock,
  "Assignment Reminder": ClipboardCheck,
  "Study Reminder": Clock3,
  "Achievement Earned": Trophy,
};

export const notificationTones: Record<NotificationKind, "primary" | "success" | "warning" | "destructive"> = {
  "New Chapter": "primary",
  "Upcoming Test": "destructive",
  "Assignment Reminder": "warning",
  "Study Reminder": "primary",
  "Achievement Earned": "success",
};

export const studentNotifications: StudentNotification[] = [
  { id: "nt1", kind: "Upcoming Test", title: "Mathematics Unit Test in 5 days", body: "Chapters 1–4 · 60 minutes. Your readiness is 78%.", time: "10 min ago", unread: true },
  { id: "nt2", kind: "New Chapter", title: "Polynomials is now available", body: "6 lessons, 2 interactive apps and a 20-question quiz.", time: "1 hr ago", unread: true },
  { id: "nt3", kind: "Achievement Earned", title: "You earned the 7-Day Streak badge", body: "Keep going — 30-Day Streak unlocks at day 30.", time: "Yesterday", unread: true },
  { id: "nt4", kind: "Assignment Reminder", title: "Science worksheet due tomorrow", body: "Chemical Reactions and Equations · 12 questions.", time: "Yesterday", unread: false },
  { id: "nt5", kind: "Study Reminder", title: "Your daily 7 PM session starts soon", body: "Continue with Lesson 4 — Euclid's division lemma.", time: "2 days ago", unread: false },
  { id: "nt6", kind: "New Chapter", title: "Carbon and its Compounds updated", body: "New mind map and 24 previous-year questions added.", time: "3 days ago", unread: false },
];
