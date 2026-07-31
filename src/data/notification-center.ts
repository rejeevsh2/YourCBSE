/**
 * Placeholder data for the Notification Center.
 * Shapes mirror the JSON a Laravel API would return.
 */

import {
  AlarmClock,
  Award,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  Flame,
  GraduationCap,
  type LucideIcon,
  Megaphone,
  RefreshCcw,
  ServerCog,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

export const notificationCategories = [
  "Learning",
  "Assignments",
  "AI Suggestions",
  "Achievements",
  "System",
  "Updates",
  "Announcements",
] as const;

export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationStatus = "unread" | "read" | "archived";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  /** ISO timestamp. */
  createdAt: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  /** In-app destination for the "Open" action. */
  to: string;
}

export interface StudyReminder {
  id: string;
  title: string;
  description: string;
  due: string;
  tone: "primary" | "warning" | "success" | "destructive";
  icon: LucideIcon;
  progress?: number;
  to: string;
}

export interface AchievementNotice {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: LucideIcon;
}

export interface NotificationPreference {
  id: string;
  label: string;
  hint: string;
  enabled: boolean;
  group: "Channels" | "Learning" | "Platform";
}

export const categoryIcons: Record<NotificationCategory, LucideIcon> = {
  Learning: BookOpenCheck,
  Assignments: ClipboardList,
  "AI Suggestions": Sparkles,
  Achievements: Trophy,
  System: ServerCog,
  Updates: RefreshCcw,
  Announcements: Megaphone,
};

export const categoryTones: Record<NotificationCategory, string> = {
  Learning: "bg-primary/12 text-primary",
  Assignments: "bg-warning/15 text-warning",
  "AI Suggestions": "bg-accent text-accent-foreground",
  Achievements: "bg-success/15 text-success",
  System: "bg-muted text-muted-foreground",
  Updates: "bg-primary/10 text-primary",
  Announcements: "bg-destructive/10 text-destructive",
};

export const priorityLabels: Record<NotificationPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const priorityTones: Record<NotificationPriority, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-primary/10 text-primary",
  high: "bg-warning/15 text-warning",
  urgent: "bg-destructive/12 text-destructive",
};

const base = Date.UTC(2026, 6, 31, 4, 0, 0);
const minutesAgo = (minutes: number) => new Date(base - minutes * 60_000).toISOString();
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

export const appNotifications: AppNotification[] = [
  {
    id: "n-1",
    category: "Learning",
    title: "New chapter unlocked — Polynomials",
    description: "12 lessons, 4 interactive apps and a fresh worksheet pack are now live for Class 10 Mathematics.",
    createdAt: minutesAgo(18),
    status: "unread",
    priority: "normal",
    to: "/student/learning-hub",
  },
  {
    id: "n-2",
    category: "Assignments",
    title: "Assignment due tomorrow",
    description: "Trigonometry worksheet 3 is due 1 Aug, 9:00 PM. 6 of 15 questions completed.",
    createdAt: hoursAgo(2),
    status: "unread",
    priority: "urgent",
    to: "/student/planner",
  },
  {
    id: "n-3",
    category: "AI Suggestions",
    title: "Cue spotted a weak topic",
    description: "Your accuracy on HCF/LCM word problems dropped to 64%. A 12-minute drill should fix it.",
    createdAt: hoursAgo(4),
    status: "unread",
    priority: "high",
    to: "/student/ai",
  },
  {
    id: "n-4",
    category: "Achievements",
    title: "7-day study streak 🔥",
    description: "You studied every day this week. Two more days unlocks the Consistency badge.",
    createdAt: hoursAgo(9),
    status: "read",
    priority: "normal",
    to: "/student/achievements",
  },
  {
    id: "n-5",
    category: "Learning",
    title: "Revision due — Real Numbers",
    description: "18 flashcards are scheduled for recall today based on your forgetting curve.",
    createdAt: hoursAgo(11),
    status: "read",
    priority: "normal",
    to: "/student/revision",
  },
  {
    id: "n-6",
    category: "Updates",
    title: "Interactive player got faster",
    description: "Simulations now load 40% quicker and remember where you paused.",
    createdAt: daysAgo(1),
    status: "read",
    priority: "low",
    to: "/student/learning-hub",
  },
  {
    id: "n-7",
    category: "Announcements",
    title: "CBSE sample papers 2026 released",
    description: "Updated blueprints for Mathematics, Science and Social Science are in the library.",
    createdAt: daysAgo(1),
    status: "unread",
    priority: "high",
    to: "/library/category/sample-papers",
  },
  {
    id: "n-8",
    category: "System",
    title: "Scheduled maintenance",
    description: "Downloads may pause on 3 Aug between 1:00 AM and 2:00 AM IST.",
    createdAt: daysAgo(2),
    status: "read",
    priority: "low",
    to: "/student/help",
  },
  {
    id: "n-9",
    category: "Assignments",
    title: "Teacher feedback received",
    description: "Mrs. Iyer reviewed your Light — Reflection assignment: 17/20 with notes on ray diagrams.",
    createdAt: daysAgo(2),
    status: "read",
    priority: "normal",
    to: "/student/progress",
  },
  {
    id: "n-10",
    category: "AI Suggestions",
    title: "Recommended: 20-question MCQ sprint",
    description: "Based on your last mock test, a short sprint on Electricity would lift your score by ~6 marks.",
    createdAt: daysAgo(3),
    status: "read",
    priority: "normal",
    to: "/student/practice",
  },
  {
    id: "n-11",
    category: "Achievements",
    title: "Perfect score in Chemistry quiz",
    description: "10/10 on Chemical Reactions. You are in the top 4% of your grade this week.",
    createdAt: daysAgo(4),
    status: "read",
    priority: "normal",
    to: "/student/achievements",
  },
  {
    id: "n-12",
    category: "Learning",
    title: "Mock test scheduled",
    description: "Full-length Science paper on 5 Aug, 10:00 AM. 80 marks, 3 hours.",
    createdAt: daysAgo(5),
    status: "read",
    priority: "high",
    to: "/student/calendar",
  },
];

export const studyReminders: StudyReminder[] = [
  { id: "r-1", title: "Complete today's goal", description: "40 minutes of focused study left before your daily target.", due: "Today · 9:00 PM", tone: "primary", icon: Target, progress: 66, to: "/student/planner" },
  { id: "r-2", title: "Revision reminder", description: "Real Numbers flashcards are due for recall.", due: "Today · 7:30 PM", tone: "warning", icon: RefreshCcw, progress: 20, to: "/student/revision" },
  { id: "r-3", title: "Upcoming quiz", description: "Science — Life Processes, 15 questions.", due: "Tomorrow · 11:00 AM", tone: "success", icon: ClipboardList, to: "/student/practice" },
  { id: "r-4", title: "Pending assignment", description: "Trigonometry worksheet 3 — 9 questions remaining.", due: "1 Aug · 9:00 PM", tone: "destructive", icon: AlarmClock, progress: 40, to: "/student/planner" },
  { id: "r-5", title: "Exam countdown", description: "Pre-board examinations begin soon — stay on the plan.", due: "In 24 days", tone: "primary", icon: CalendarClock, to: "/student/calendar" },
];

export const achievementNotices: AchievementNotice[] = [
  { id: "a-1", title: "7-day study streak", description: "Seven days in a row without missing your goal.", earnedAt: "Today", icon: Flame },
  { id: "a-2", title: "Chapter completed", description: "Real Numbers finished with 92% mastery.", earnedAt: "Yesterday", icon: BookOpenCheck },
  { id: "a-3", title: "Perfect score", description: "10/10 in the Chemical Reactions quiz.", earnedAt: "4 days ago", icon: Award },
  { id: "a-4", title: "Top performer", description: "Ranked 3rd in Class 10 Mathematics this week.", earnedAt: "5 days ago", icon: GraduationCap },
  { id: "a-5", title: "New badge earned", description: "“Night Owl” — 5 study sessions after 9 PM.", earnedAt: "1 week ago", icon: BadgeCheck },
];

export const notificationPreferences: NotificationPreference[] = [
  { id: "p-email", label: "Email notifications", hint: "Weekly digest and important alerts", enabled: true, group: "Channels" },
  { id: "p-push", label: "Push notifications", hint: "Real-time alerts on this device", enabled: true, group: "Channels" },
  { id: "p-reminders", label: "Study reminders", hint: "Daily nudge at 7:00 PM", enabled: true, group: "Learning" },
  { id: "p-assignments", label: "Assignments", hint: "Deadlines, feedback and resubmissions", enabled: true, group: "Learning" },
  { id: "p-achievements", label: "Achievements", hint: "Badges, streaks and leaderboards", enabled: false, group: "Learning" },
  { id: "p-ai", label: "AI suggestions", hint: "Weak-topic alerts from Cue", enabled: true, group: "Learning" },
  { id: "p-system", label: "System alerts", hint: "Maintenance and security notices", enabled: true, group: "Platform" },
  { id: "p-marketing", label: "Marketing updates", hint: "Offers, new courses and newsletters", enabled: false, group: "Platform" },
];

export const notificationIconFor = (category: NotificationCategory): LucideIcon =>
  categoryIcons[category] ?? Bell;

/** Human-friendly relative time for placeholder timestamps. */
export function relativeTime(iso: string, now = base): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Clock time used by chat bubbles. */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
