import type { ContentStatus } from "@/data/teacher";

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export type AccountRole = "Super Admin" | "Admin" | "Teacher" | "Student" | "Parent";
export type AccountStatus = "Active" | "Pending" | "Suspended" | "Invited";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  lastLogin: string;
  joined: string;
  meta: string;
}

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    role: "Student",
    status: "Active",
    lastLogin: "2 hrs ago",
    joined: "12 Jan 2026",
    meta: "Class 10 · CBSE",
  },
  {
    id: "u2",
    name: "Meera Iyer",
    email: "meera@example.com",
    role: "Teacher",
    status: "Active",
    lastLogin: "38 min ago",
    joined: "04 Aug 2025",
    meta: "Science & Maths",
  },
  {
    id: "u3",
    name: "Rohit Nair",
    email: "rohit@example.com",
    role: "Student",
    status: "Active",
    lastLogin: "Yesterday",
    joined: "22 Feb 2026",
    meta: "Class 9 · CBSE",
  },
  {
    id: "u4",
    name: "Sunil Rao",
    email: "sunil@example.com",
    role: "Teacher",
    status: "Pending",
    lastLogin: "Never",
    joined: "18 Jul 2026",
    meta: "Social Science",
  },
  {
    id: "u5",
    name: "Kavya Menon",
    email: "kavya@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "10 min ago",
    joined: "01 Mar 2025",
    meta: "Content operations",
  },
  {
    id: "u6",
    name: "Dev Patel",
    email: "dev@example.com",
    role: "Student",
    status: "Suspended",
    lastLogin: "3 weeks ago",
    joined: "09 Sep 2025",
    meta: "Class 12 · CBSE",
  },
  {
    id: "u7",
    name: "Priya Nair",
    email: "priya@example.com",
    role: "Teacher",
    status: "Active",
    lastLogin: "5 hrs ago",
    joined: "27 Nov 2025",
    meta: "Chemistry",
  },
  {
    id: "u8",
    name: "Arjun Verma",
    email: "arjun@example.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "Just now",
    joined: "14 Jun 2024",
    meta: "Platform owner",
  },
  {
    id: "u9",
    name: "Nisha Gupta",
    email: "nisha@example.com",
    role: "Parent",
    status: "Invited",
    lastLogin: "Never",
    joined: "29 Jul 2026",
    meta: "Guardian of Rohit Nair",
  },
  {
    id: "u10",
    name: "Sameer Khan",
    email: "sameer@example.com",
    role: "Student",
    status: "Active",
    lastLogin: "4 hrs ago",
    joined: "03 Apr 2026",
    meta: "Class 11 · CBSE",
  },
];

export const adminTeachers = adminUsers.filter((user) => user.role === "Teacher");
export const adminStudents = adminUsers.filter((user) => user.role === "Student");
export const adminParents = adminUsers.filter((user) => user.role === "Parent");

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface AdminContentItem {
  id: string;
  title: string;
  context: string;
  status: ContentStatus;
  version: string;
  author: string;
  updatedAt: string;
  views?: string;
}

function item(
  id: string,
  title: string,
  context: string,
  status: ContentStatus,
  version: string,
  author: string,
  updatedAt: string,
  views?: string,
): AdminContentItem {
  return { id, title, context, status, version, author, updatedAt, views };
}

export const adminGrades: AdminContentItem[] = [
  item("g1", "Class 6", "42 chapters · 6 subjects", "Published", "v3.1", "Kavya Menon", "12 Jul 2026", "18.2k"),
  item("g2", "Class 7", "48 chapters · 6 subjects", "Published", "v3.0", "Kavya Menon", "09 Jul 2026", "21.4k"),
  item("g3", "Class 8", "51 chapters · 6 subjects", "Published", "v2.8", "Meera Iyer", "28 Jun 2026", "26.9k"),
  item("g4", "Class 9", "58 chapters · 7 subjects", "Published", "v4.0", "Meera Iyer", "21 Jul 2026", "39.7k"),
  item("g5", "Class 10", "62 chapters · 7 subjects", "Published", "v4.2", "Priya Nair", "26 Jul 2026", "58.1k"),
  item("g6", "Class 11", "66 chapters · 8 subjects", "In review", "v1.4", "Sunil Rao", "24 Jul 2026", "12.3k"),
  item("g7", "Class 12", "71 chapters · 8 subjects", "Draft", "v0.9", "Sunil Rao", "29 Jul 2026", "—"),
];

export const adminSubjects: AdminContentItem[] = [
  item("s1", "Mathematics", "Class 6–12 · 168 chapters", "Published", "v5.0", "Meera Iyer", "25 Jul 2026", "94.5k"),
  item("s2", "Science", "Class 6–10 · 121 chapters", "Published", "v4.6", "Priya Nair", "23 Jul 2026", "88.2k"),
  item("s3", "Physics", "Class 11–12 · 44 chapters", "Published", "v2.2", "Sunil Rao", "18 Jul 2026", "31.7k"),
  item("s4", "Chemistry", "Class 11–12 · 41 chapters", "In review", "v2.0", "Priya Nair", "27 Jul 2026", "28.4k"),
  item("s5", "Biology", "Class 11–12 · 38 chapters", "Published", "v1.9", "Meera Iyer", "11 Jul 2026", "24.0k"),
  item("s6", "Social Science", "Class 6–10 · 96 chapters", "Draft", "v0.7", "Sunil Rao", "29 Jul 2026", "—"),
  item("s7", "English", "Class 6–12 · 84 chapters", "Published", "v3.3", "Kavya Menon", "05 Jul 2026", "40.8k"),
];

export const adminChapters: AdminContentItem[] = [
  item("c1", "Real Numbers", "Class 10 · Mathematics", "Published", "v2.4", "Meera Iyer", "26 Jul 2026", "12.8k"),
  item("c2", "Chemical Reactions & Equations", "Class 10 · Science", "Published", "v3.0", "Priya Nair", "25 Jul 2026", "14.2k"),
  item("c3", "Light — Reflection & Refraction", "Class 10 · Science", "In review", "v1.8", "Priya Nair", "28 Jul 2026", "9.4k"),
  item("c4", "Motion", "Class 9 · Science", "Published", "v2.1", "Meera Iyer", "19 Jul 2026", "11.1k"),
  item("c5", "Linear Equations in Two Variables", "Class 9 · Mathematics", "Draft", "v0.6", "Sunil Rao", "29 Jul 2026", "—"),
  item("c6", "The French Revolution", "Class 9 · Social Science", "Archived", "v1.2", "Kavya Menon", "02 May 2026", "6.7k"),
  item("c7", "Trigonometry Basics", "Class 10 · Mathematics", "Published", "v1.9", "Meera Iyer", "14 Jul 2026", "10.5k"),
];

export const adminApps: AdminContentItem[] = [
  item("a1", "Reaction Balancer Lab", "Class 10 · Science", "Published", "v4.2", "Priya Nair", "26 Jul 2026", "8.9k"),
  item("a2", "Ray Diagram Simulator", "Class 10 · Science", "In review", "v2.0", "Priya Nair", "28 Jul 2026", "5.1k"),
  item("a3", "Number Line Explorer", "Class 6 · Mathematics", "Published", "v3.1", "Meera Iyer", "17 Jul 2026", "7.3k"),
  item("a4", "Graph Plotter", "Class 9 · Mathematics", "Draft", "v0.4", "Sunil Rao", "29 Jul 2026", "—"),
  item("a5", "Human Eye Explorer", "Class 10 · Science", "Published", "v1.6", "Priya Nair", "08 Jul 2026", "4.6k"),
];

export const adminVideos: AdminContentItem[] = [
  item("v1", "Balancing Equations in 6 Minutes", "Class 10 · Science", "Published", "v1.0", "Priya Nair", "24 Jul 2026", "22.4k"),
  item("v2", "Euclid's Division Lemma", "Class 10 · Mathematics", "Published", "v1.2", "Meera Iyer", "20 Jul 2026", "16.8k"),
  item("v3", "Understanding Refraction", "Class 10 · Science", "In review", "v0.8", "Priya Nair", "28 Jul 2026", "—"),
  item("v4", "Newton's Laws Explained", "Class 9 · Science", "Published", "v1.1", "Meera Iyer", "12 Jul 2026", "19.2k"),
];

export const adminNotes: AdminContentItem[] = [
  item("n1", "Real Numbers — Revision Notes", "Class 10 · Mathematics", "Published", "v2.0", "Meera Iyer", "22 Jul 2026", "9.8k"),
  item("n2", "Chemical Reactions — Quick Notes", "Class 10 · Science", "Published", "v1.7", "Priya Nair", "21 Jul 2026", "8.4k"),
  item("n3", "Motion — Formula Sheet", "Class 9 · Science", "Draft", "v0.3", "Sunil Rao", "29 Jul 2026", "—"),
];

export const adminWorksheets: AdminContentItem[] = [
  item("w1", "Real Numbers Worksheet A", "Class 10 · Mathematics", "Published", "v1.4", "Meera Iyer", "18 Jul 2026", "6.2k"),
  item("w2", "Acids, Bases & Salts Practice", "Class 10 · Science", "Published", "v1.1", "Priya Nair", "16 Jul 2026", "5.5k"),
  item("w3", "Polynomials Drill Sheet", "Class 9 · Mathematics", "In review", "v0.9", "Sunil Rao", "27 Jul 2026", "—"),
];

export const adminFlashcards: AdminContentItem[] = [
  item("f1", "Periodic Table Essentials", "Class 10 · Science", "Published", "v2.2", "Priya Nair", "15 Jul 2026", "7.1k"),
  item("f2", "Trigonometric Ratios", "Class 10 · Mathematics", "Published", "v1.5", "Meera Iyer", "13 Jul 2026", "5.9k"),
  item("f3", "Cell Organelles", "Class 9 · Science", "Draft", "v0.2", "Sunil Rao", "29 Jul 2026", "—"),
];

export const adminMindMaps: AdminContentItem[] = [
  item("m1", "Life Processes Overview", "Class 10 · Science", "Published", "v1.3", "Priya Nair", "10 Jul 2026", "4.4k"),
  item("m2", "Algebra Concept Map", "Class 9 · Mathematics", "In review", "v0.8", "Meera Iyer", "26 Jul 2026", "—"),
];

export const adminBlogPosts: AdminContentItem[] = [
  item("b1", "How to Revise Class 10 Science in 30 Days", "Study strategy", "Published", "v1.0", "Kavya Menon", "23 Jul 2026", "13.6k"),
  item("b2", "CBSE 2027 Exam Pattern: What Changes", "Exam news", "In review", "v0.5", "Kavya Menon", "28 Jul 2026", "—"),
  item("b3", "Best Interactive Apps for Maths", "Product", "Draft", "v0.2", "Arjun Verma", "29 Jul 2026", "—"),
];

/* ------------------------------------------------------------------ */
/* Question bank                                                       */
/* ------------------------------------------------------------------ */

export interface AdminQuestionGroup {
  id: string;
  type: string;
  count: number;
  chapters: number;
  lastUpdated: string;
  status: ContentStatus;
}

export const adminQuestionGroups: AdminQuestionGroup[] = [
  { id: "q1", type: "MCQ", count: 4820, chapters: 312, lastUpdated: "26 Jul 2026", status: "Published" },
  { id: "q2", type: "Assertion & Reason", count: 940, chapters: 168, lastUpdated: "24 Jul 2026", status: "Published" },
  { id: "q3", type: "Very Short Answer", count: 1620, chapters: 244, lastUpdated: "21 Jul 2026", status: "Published" },
  { id: "q4", type: "Short Answer", count: 2110, chapters: 260, lastUpdated: "19 Jul 2026", status: "Published" },
  { id: "q5", type: "Long Answer", count: 880, chapters: 190, lastUpdated: "18 Jul 2026", status: "In review" },
  { id: "q6", type: "Case Study", count: 460, chapters: 122, lastUpdated: "27 Jul 2026", status: "In review" },
  { id: "q7", type: "HOTS", count: 380, chapters: 98, lastUpdated: "16 Jul 2026", status: "Published" },
  { id: "q8", type: "Fill in the Blanks", count: 1240, chapters: 210, lastUpdated: "12 Jul 2026", status: "Published" },
  { id: "q9", type: "True / False", count: 1010, chapters: 205, lastUpdated: "09 Jul 2026", status: "Archived" },
];

/* ------------------------------------------------------------------ */
/* Approvals                                                           */
/* ------------------------------------------------------------------ */

export type ApprovalState = "Pending" | "Approved" | "Rejected" | "Needs revision";

export interface ApprovalItem {
  id: string;
  title: string;
  kind: string;
  submittedBy: string;
  submittedAt: string;
  state: ApprovalState;
  note?: string;
}

export const adminApprovals: ApprovalItem[] = [
  { id: "ap1", title: "Light — Reflection & Refraction", kind: "Chapter", submittedBy: "Priya Nair", submittedAt: "28 Jul 2026", state: "Pending" },
  { id: "ap2", title: "Ray Diagram Simulator", kind: "Interactive App", submittedBy: "Priya Nair", submittedAt: "28 Jul 2026", state: "Pending" },
  { id: "ap3", title: "Polynomials Drill Sheet", kind: "Worksheet", submittedBy: "Sunil Rao", submittedAt: "27 Jul 2026", state: "Needs revision", note: "Add answer key and mark distribution." },
  { id: "ap4", title: "CBSE 2027 Exam Pattern", kind: "Blog post", submittedBy: "Kavya Menon", submittedAt: "28 Jul 2026", state: "Pending" },
  { id: "ap5", title: "Chemical Reactions & Equations", kind: "Chapter", submittedBy: "Priya Nair", submittedAt: "25 Jul 2026", state: "Approved" },
  { id: "ap6", title: "Cell Organelles Flashcards", kind: "Flashcards", submittedBy: "Sunil Rao", submittedAt: "22 Jul 2026", state: "Rejected", note: "Duplicate of an existing deck." },
];

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export type MediaKind = "Image" | "Video" | "PDF" | "Audio" | "ZIP" | "Document";

export interface MediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const adminMedia: MediaAsset[] = [
  { id: "md1", name: "chapter-hero-real-numbers.png", kind: "Image", size: "412 KB", uploadedBy: "Meera Iyer", uploadedAt: "26 Jul 2026" },
  { id: "md2", name: "balancing-equations.mp4", kind: "Video", size: "184 MB", uploadedBy: "Priya Nair", uploadedAt: "24 Jul 2026" },
  { id: "md3", name: "class10-science-notes.pdf", kind: "PDF", size: "6.2 MB", uploadedBy: "Priya Nair", uploadedAt: "21 Jul 2026" },
  { id: "md4", name: "pronunciation-guide.mp3", kind: "Audio", size: "18 MB", uploadedBy: "Kavya Menon", uploadedAt: "19 Jul 2026" },
  { id: "md5", name: "ray-simulator-build.zip", kind: "ZIP", size: "24 MB", uploadedBy: "Priya Nair", uploadedAt: "28 Jul 2026" },
  { id: "md6", name: "cbse-syllabus-2027.docx", kind: "Document", size: "980 KB", uploadedBy: "Arjun Verma", uploadedAt: "17 Jul 2026" },
  { id: "md7", name: "subject-icons-set.png", kind: "Image", size: "1.1 MB", uploadedBy: "Kavya Menon", uploadedAt: "14 Jul 2026" },
  { id: "md8", name: "newtons-laws.mp4", kind: "Video", size: "121 MB", uploadedBy: "Meera Iyer", uploadedAt: "12 Jul 2026" },
];

/* ------------------------------------------------------------------ */
/* Security / logs                                                     */
/* ------------------------------------------------------------------ */

export interface LogEntry {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  source: string;
  time: string;
}

export const adminSystemLogs: LogEntry[] = [
  { id: "l1", level: "INFO", message: "Nightly content index rebuilt (736 chapters)", source: "scheduler", time: "02:14" },
  { id: "l2", level: "WARN", message: "Storage usage crossed 70% of allocated quota", source: "storage", time: "01:38" },
  { id: "l3", level: "INFO", message: "42 accounts synced from import queue", source: "accounts", time: "00:05" },
  { id: "l4", level: "ERROR", message: "Media transcode failed for newtons-laws.mp4", source: "media", time: "23:47" },
  { id: "l5", level: "INFO", message: "Sitemap regenerated with 1,284 URLs", source: "seo", time: "23:10" },
  { id: "l6", level: "WARN", message: "Slow query detected on chapter analytics view", source: "database", time: "22:52" },
];

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  time: string;
}

export const adminAuditLogs: AuditEntry[] = [
  { id: "au1", actor: "Arjun Verma", action: "Updated role permissions", target: "Role · Content Manager", ip: "103.21.44.12", time: "Today, 18:02" },
  { id: "au2", actor: "Kavya Menon", action: "Published chapter", target: "Real Numbers", ip: "103.21.44.61", time: "Today, 15:41" },
  { id: "au3", actor: "Meera Iyer", action: "Uploaded media", target: "chapter-hero-real-numbers.png", ip: "49.36.180.7", time: "Today, 12:19" },
  { id: "au4", actor: "Arjun Verma", action: "Suspended account", target: "dev@example.com", ip: "103.21.44.12", time: "Yesterday, 20:55" },
  { id: "au5", actor: "Priya Nair", action: "Submitted for approval", target: "Ray Diagram Simulator", ip: "157.34.9.201", time: "Yesterday, 17:08" },
];

export interface LoginEntry {
  id: string;
  user: string;
  device: string;
  location: string;
  status: "Success" | "Failed";
  time: string;
}

export const adminLoginHistory: LoginEntry[] = [
  { id: "lg1", user: "arjun@example.com", device: "Chrome · macOS", location: "Bengaluru, IN", status: "Success", time: "Today, 18:31" },
  { id: "lg2", user: "kavya@example.com", device: "Safari · iPadOS", location: "Kochi, IN", status: "Success", time: "Today, 15:02" },
  { id: "lg3", user: "unknown@mailer.ru", device: "Curl · Linux", location: "Unknown", status: "Failed", time: "Today, 11:47" },
  { id: "lg4", user: "sunil@example.com", device: "Edge · Windows", location: "Pune, IN", status: "Failed", time: "Yesterday, 22:14" },
  { id: "lg5", user: "meera@example.com", device: "Chrome · Android", location: "Chennai, IN", status: "Success", time: "Yesterday, 09:36" },
];

export const adminSecurityAlerts = [
  { id: "sa1", title: "12 failed logins from a single IP", severity: "High", detail: "103.94.11.8 · blocked for 24 hours", time: "Today, 11:52" },
  { id: "sa2", title: "Admin password older than 180 days", severity: "Medium", detail: "kavya@example.com", time: "Yesterday" },
  { id: "sa3", title: "Public sharing enabled on 3 media files", severity: "Low", detail: "Media library audit", time: "26 Jul 2026" },
];

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export const adminRoles = [
  { id: "r1", name: "Super Admin", members: 2, scope: "Unrestricted access to every module", tone: "destructive" as const },
  { id: "r2", name: "Admin", members: 6, scope: "Users, content, settings — no billing", tone: "primary" as const },
  { id: "r3", name: "Teacher", members: 268, scope: "Author and submit own subject content", tone: "success" as const },
  { id: "r4", name: "Student", members: 9842, scope: "Learn, practise, download", tone: "primary" as const },
  { id: "r5", name: "Parent (future)", members: 0, scope: "Read-only progress of linked students", tone: "warning" as const },
];

export const permissionModules = [
  "Dashboard",
  "User management",
  "Curriculum",
  "Content authoring",
  "Approvals",
  "Media library",
  "SEO manager",
  "System settings",
  "Backups",
  "Audit logs",
];

/** true = allowed. Column order: Super Admin, Admin, Teacher, Student, Parent. */
export const permissionMatrix: Record<string, boolean[]> = {
  Dashboard: [true, true, true, true, true],
  "User management": [true, true, false, false, false],
  Curriculum: [true, true, true, false, false],
  "Content authoring": [true, true, true, false, false],
  Approvals: [true, true, false, false, false],
  "Media library": [true, true, true, false, false],
  "SEO manager": [true, true, false, false, false],
  "System settings": [true, false, false, false, false],
  Backups: [true, false, false, false, false],
  "Audit logs": [true, true, false, false, false],
};

export const permissionRoles = ["Super Admin", "Admin", "Teacher", "Student", "Parent"];

/* ------------------------------------------------------------------ */
/* Dashboard + analytics                                               */
/* ------------------------------------------------------------------ */

export const adminKpis = [
  { label: "Total students", value: "9,842", hint: "+312 this month", tone: "success" as const },
  { label: "Total teachers", value: "268", hint: "14 pending", tone: "warning" as const },
  { label: "Total chapters", value: "736", hint: "+18 this month", tone: "primary" as const },
  { label: "Interactive apps", value: "184", hint: "12 in review", tone: "primary" as const },
  { label: "Resources", value: "3,412", hint: "+96 this week", tone: "success" as const },
  { label: "Videos", value: "912", hint: "42 hrs added", tone: "primary" as const },
  { label: "Published lessons", value: "1,268", hint: "94% coverage", tone: "success" as const },
  { label: "Draft lessons", value: "146", hint: "Needs review", tone: "warning" as const },
  { label: "Active users", value: "4,106", hint: "Last 24 hrs", tone: "primary" as const },
  { label: "Daily visitors", value: "18,240", hint: "+6.4% vs yesterday", tone: "success" as const },
  { label: "Monthly visitors", value: "486,900", hint: "+11.2% MoM", tone: "success" as const },
  { label: "Storage usage", value: "712 GB", hint: "71% of 1 TB", tone: "warning" as const },
];

export const adminActivity = [
  { id: "act1", text: "Priya Nair submitted 'Ray Diagram Simulator' for approval", time: "12 min ago", tone: "primary" as const },
  { id: "act2", text: "3 teacher applications awaiting review", time: "1 hr ago", tone: "warning" as const },
  { id: "act3", text: "Kavya Menon published 'Real Numbers' v2.4", time: "3 hrs ago", tone: "success" as const },
  { id: "act4", text: "Storage usage crossed 70% threshold", time: "5 hrs ago", tone: "warning" as const },
  { id: "act5", text: "Sitemap regenerated with 1,284 URLs", time: "Yesterday", tone: "primary" as const },
];

export const studentGrowth = [420, 512, 604, 688, 742, 810, 905, 1012, 1140, 1236, 1348, 1482];
export const teacherGrowth = [12, 18, 24, 31, 38, 44, 52, 61, 70, 82, 96, 108];
export const trafficSeries = [42, 58, 51, 74, 66, 88, 79, 95, 84, 71, 90, 96];
export const quizAttempts = [180, 240, 210, 320, 290, 410, 380, 460, 420, 510, 480, 560];
export const downloadsSeries = [90, 120, 140, 132, 168, 190, 176, 210, 234, 220, 258, 274];
export const monthLabels = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export const mostViewedChapters = [
  { id: "mv1", title: "Chemical Reactions & Equations", grade: "Class 10", views: 14200, share: 100 },
  { id: "mv2", title: "Real Numbers", grade: "Class 10", views: 12800, share: 90 },
  { id: "mv3", title: "Motion", grade: "Class 9", views: 11100, share: 78 },
  { id: "mv4", title: "Trigonometry Basics", grade: "Class 10", views: 10500, share: 74 },
  { id: "mv5", title: "Light — Reflection & Refraction", grade: "Class 10", views: 9400, share: 66 },
];

export const completionRates = [
  { id: "cr1", label: "Class 10 · Science", value: 82 },
  { id: "cr2", label: "Class 10 · Mathematics", value: 76 },
  { id: "cr3", label: "Class 9 · Science", value: 68 },
  { id: "cr4", label: "Class 12 · Physics", value: 54 },
  { id: "cr5", label: "Class 11 · Chemistry", value: 47 },
];

export const platformActivityBreakdown = [
  { id: "pa1", label: "Lesson views", value: 46, tone: "primary" as const },
  { id: "pa2", label: "Interactive app sessions", value: 24, tone: "success" as const },
  { id: "pa3", label: "Quiz attempts", value: 18, tone: "warning" as const },
  { id: "pa4", label: "Downloads", value: 12, tone: "destructive" as const },
];

/* ------------------------------------------------------------------ */
/* Announcements & notifications                                       */
/* ------------------------------------------------------------------ */

export const adminAnnouncements = [
  { id: "an1", title: "Term 2 syllabus now live for Class 10", audience: "All students", channel: "Banner", status: "Published" as const, date: "26 Jul 2026" },
  { id: "an2", title: "Scheduled maintenance on 02 Aug, 1–3 AM IST", audience: "Everyone", channel: "Banner + Email", status: "Scheduled" as const, date: "31 Jul 2026" },
  { id: "an3", title: "New interactive apps for Physics", audience: "Class 11–12", channel: "Push", status: "Draft" as const, date: "29 Jul 2026" },
];

export const adminCampaigns = [
  { id: "cp1", name: "Weekly digest — Class 10", channel: "Email", recipients: "9,842", opened: "62%", status: "Sent" as const },
  { id: "cp2", name: "Teacher onboarding series", channel: "Email", recipients: "268", opened: "78%", status: "Running" as const },
  { id: "cp3", name: "Exam countdown reminders", channel: "Push", recipients: "6,140", opened: "41%", status: "Scheduled" as const },
];

/* ------------------------------------------------------------------ */
/* Platform ops                                                        */
/* ------------------------------------------------------------------ */

export const adminBackups = [
  { id: "bk1", name: "Full database snapshot", type: "Database", size: "4.2 GB", createdAt: "Today, 02:00", status: "Complete" as const },
  { id: "bk2", name: "Media bucket archive", type: "Media", size: "684 GB", createdAt: "Yesterday, 02:00", status: "Complete" as const },
  { id: "bk3", name: "Full database snapshot", type: "Database", size: "4.1 GB", createdAt: "28 Jul 2026, 02:00", status: "Complete" as const },
  { id: "bk4", name: "Incremental media sync", type: "Media", size: "12 GB", createdAt: "28 Jul 2026, 14:00", status: "Failed" as const },
];

export const adminIntegrations = [
  { id: "in1", name: "YouTube", detail: "Video hosting and embeds", connected: true },
  { id: "in2", name: "Cloud storage", detail: "Media and backup bucket", connected: true },
  { id: "in3", name: "SMTP mailer", detail: "Transactional email delivery", connected: true },
  { id: "in4", name: "Analytics", detail: "Traffic and behaviour tracking", connected: false },
  { id: "in5", name: "Payment gateway", detail: "Future subscriptions", connected: false },
  { id: "in6", name: "Push notifications", detail: "Web and mobile alerts", connected: false },
];

export const adminSupportTickets = [
  { id: "t1", subject: "Cannot download Class 10 worksheet", requester: "Rohit Nair", priority: "High" as const, status: "Open" as const, updated: "20 min ago" },
  { id: "t2", subject: "Video buffering on mobile data", requester: "Ananya Sharma", priority: "Medium" as const, status: "In progress" as const, updated: "2 hrs ago" },
  { id: "t3", subject: "Request: add Class 12 Biology mind maps", requester: "Meera Iyer", priority: "Low" as const, status: "Open" as const, updated: "Yesterday" },
  { id: "t4", subject: "Account suspended by mistake", requester: "Dev Patel", priority: "High" as const, status: "Resolved" as const, updated: "27 Jul 2026" },
];

export const adminReports = [
  { id: "rp1", name: "Monthly platform summary", period: "July 2026", format: "PDF", size: "1.8 MB", generated: "Today, 06:00" },
  { id: "rp2", name: "Student engagement report", period: "Q2 2026", format: "XLSX", size: "3.4 MB", generated: "01 Jul 2026" },
  { id: "rp3", name: "Content coverage audit", period: "July 2026", format: "PDF", size: "2.2 MB", generated: "26 Jul 2026" },
  { id: "rp4", name: "Teacher contribution report", period: "July 2026", format: "CSV", size: "640 KB", generated: "25 Jul 2026" },
];
