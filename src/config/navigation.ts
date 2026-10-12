import {
  BadgeCheck,
  Bell,
  BellRing,
  Bot,
  FileBarChart,
  Globe,
  HeartHandshake,
  Image as ImageIcon,
  KeyRound,
  LifeBuoy,
  Lock,
  Megaphone,
  Newspaper,
  Plug,
  ScrollText,
  Terminal,
  BarChart3,
  BookMarked,
  BookOpen,
  Boxes,
  CalendarDays,
  ClipboardList,
  Compass,
  ListTodo,
  Search,
  Download,
  FileStack,
  FileText,
  FolderOpen,
  FolderCog,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Layers3,
  MessageSquare,
  Network,
  PenSquare,
  Repeat2,
  Route,
  Sparkles,
  Trophy,
  ListChecks,
  PlayCircle,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  User,
  Users,
} from "lucide-react";

import type { NavItem } from "@/types";

/* =========================================================
   PUBLIC NAVIGATION
========================================================= */

export const publicNav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Grades", to: "/grades" },
  { label: "Subjects", to: "/subjects" },
  { label: "Practice", to: "/practice" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/* =========================================================
   STUDENT NAVIGATION
========================================================= */

export const studentNav: NavItem[] = [
  {
    label: "Dashboard",
    to: "/student",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    label: "Learning Hub",
    to: "/student/learning-hub",
    icon: Compass,
    group: "Overview",
  },
  {
    label: "My Courses",
    to: "/student/courses",
    icon: BookOpen,
    group: "Overview",
  },
  {
    label: "Continue Learning",
    to: "/student/continue-learning",
    icon: PlayCircle,
    group: "Overview",
  },
  {
    label: "Learning Path",
    to: "/student/learning-path",
    icon: Route,
    group: "Overview",
  },

  /* STUDY */

  {
    label: "Practice Center",
    to: "/student/practice",
    icon: ListChecks,
    group: "Study",
  },
  {
    label: "Revision Hub",
    to: "/student/revision",
    icon: Repeat2,
    group: "Study",
  },
  {
    label: "Search",
    to: "/student/search",
    icon: Search,
    group: "Study",
  },

  /* PROGRESS */

  {
    label: "My Progress",
    to: "/student/progress",
    icon: TrendingUp,
    group: "Progress",
  },
  {
    label: "Analytics",
    to: "/student/analytics",
    icon: BarChart3,
    group: "Progress",
  },
  {
    label: "Achievements",
    to: "/student/achievements",
    icon: Trophy,
    group: "Progress",
  },

  /* LIBRARY */

  {
    label: "Downloads",
    to: "/student/downloads",
    icon: Download,
    group: "Library",
  },
  {
    label: "Bookmarks",
    to: "/student/bookmarks",
    icon: BookMarked,
    group: "Library",
  },

  /* PLAN */

  {
    label: "Study Planner",
    to: "/student/planner",
    icon: ListTodo,
    group: "Plan",
  },
  {
    label: "Calendar",
    to: "/student/calendar",
    icon: CalendarDays,
    group: "Plan",
  },

  /* ACCOUNT */

  {
    label: "Notifications",
    to: "/student/notifications",
    icon: Bell,
    group: "Account",
  },
  {
    label: "Notification Center",
    to: "/student/notification-center",
    icon: BellRing,
    group: "Account",
  },
  {
    label: "Profile",
    to: "/student/profile",
    icon: User,
    group: "Account",
  },
  {
    label: "Settings",
    to: "/student/settings",
    icon: Settings,
    group: "Account",
  },
  {
    label: "Help & Support",
    to: "/student/help",
    icon: LifeBuoy,
    group: "Account",
  },
];

/* =========================================================
   TEACHER NAVIGATION
========================================================= */

export const teacherNav: NavItem[] = [
  {
    label: "Dashboard",
    to: "/teacher",
    icon: LayoutDashboard,
    group: "Overview",
  },

  /* CURRICULUM */

  {
    label: "Grades",
    to: "/teacher/grades",
    icon: ShieldCheck,
    group: "Curriculum",
  },
  {
    label: "Subjects",
    to: "/teacher/subjects",
    icon: BookOpen,
    group: "Curriculum",
  },
  {
    label: "Units",
    to: "/teacher/units",
    icon: Layers3,
    group: "Curriculum",
  },
  {
    label: "Chapters",
    to: "/teacher/chapters",
    icon: Layers,
    group: "Curriculum",
  },
  {
    label: "Lessons",
    to: "/teacher/lessons",
    icon: FileText,
    group: "Curriculum",
  },
  {
    label: "Lesson Content",
    to: "/teacher/lesson-contents",
    icon: FileStack,
    group: "Curriculum",
  },
  {
    label: "Interactive Apps",
    to: "/teacher/interactive-apps",
    icon: Boxes,
    group: "Curriculum",
  },

  /* CONTENT */

  {
    label: "Videos",
    to: "/teacher/videos",
    icon: PlayCircle,
    group: "Content",
  },
  {
    label: "Notes",
    to: "/teacher/notes",
    icon: FileText,
    group: "Content",
  },
  {
    label: "Worksheets",
    to: "/teacher/worksheets",
    icon: FileStack,
    group: "Content",
  },
  {
    label: "Flashcards",
    to: "/teacher/flashcards",
    icon: Layers3,
    group: "Content",
  },
  {
    label: "Mind Maps",
    to: "/teacher/mind-maps",
    icon: Network,
    group: "Content",
  },
  {
    label: "Resource Library",
    to: "/teacher/library",
    icon: FolderOpen,
    group: "Content",
  },

  /* ASSESSMENT */
  {
    label: "Analytics",
    to: "/teacher/analytics",
    icon: BarChart3,
    group: "Assessment",
  },

  /* WORKSPACE */

  {
    label: "Drafts",
    to: "/teacher/drafts",
    icon: PenSquare,
    group: "Workspace",

  },
  {
    label: "Published Content",
    to: "/teacher/published",
    icon: BadgeCheck,
    group: "Workspace",
  },
  {
    label: "Settings",
    to: "/teacher/settings",
    icon: Settings,
    group: "Workspace",
  },
];

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

export const adminNav: NavItem[] = [
  /* OVERVIEW */

  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    label: "Analytics",
    to: "/admin/analytics",
    icon: BarChart3,
    group: "Overview",
  },
  {
    label: "Reports",
    to: "/admin/reports",
    icon: FileBarChart,
    group: "Overview",
  },

  /* PEOPLE */

  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
    group: "People",
  },
  {
    label: "Teachers",
    to: "/admin/teachers",
    icon: UserCog,
    group: "People",
  },
  {
    label: "Parents",
    to: "/admin/parents",
    icon: HeartHandshake,
    group: "People",
    badge: "Soon",
  },
  {
    label: "Roles & Permissions",
    to: "/admin/roles",
    icon: KeyRound,
    group: "People",
  },

  /* CURRICULUM */

  {
    label: "Grades",
    to: "/admin/grades",
    icon: ShieldCheck,
    group: "Curriculum",
  },
  {
    label: "Subjects",
    to: "/admin/subjects",
    icon: BookOpen,
    group: "Curriculum",
  },
  {
    label: "Units",
    to: "/admin/units",
    icon: Layers3,
    group: "Curriculum",
  },
  {
    label: "Chapters",
    to: "/admin/chapters",
    icon: Layers,
    group: "Curriculum",
  },
  {
    label: "Lessons",
    to: "/admin/lessons",
    icon: FileText,
    group: "Curriculum",
  },
  {
    label: "Lesson Content",
    to: "/admin/lesson-contents",
    icon: FileStack,
    group: "Curriculum",
  },
  {
    label: "Interactive Apps",
    to: "/admin/interactive-apps",
    icon: Boxes,
    group: "Curriculum",
  },

  /* CONTENT */

  {
    label: "Videos",
    to: "/admin/videos",
    icon: PlayCircle,
    group: "Content",
  },
  {
    label: "Notes",
    to: "/admin/notes",
    icon: FileText,
    group: "Content",
  },
  {
    label: "Worksheets",
    to: "/admin/worksheets",
    icon: FileStack,
    group: "Content",
  },
  {
    label: "Question Bank",
    to: "/admin/question-bank",
    icon: ListChecks,
    group: "Content",
  },
  {
    label: "Flashcards",
    to: "/admin/flashcards",
    icon: Layers3,
    group: "Content",
  },
  {
    label: "Mind Maps",
    to: "/admin/mind-maps",
    icon: Network,
    group: "Content",
  },
  {
    label: "Resource Library",
    to: "/admin/resources",
    icon: FolderOpen,
    group: "Content",
  },
  {
    label: "Blog",
    to: "/admin/blog",
    icon: Newspaper,
    group: "Content",
  },

  /* ENGAGEMENT */

  {
    label: "Approvals",
    to: "/admin/approvals",
    icon: BadgeCheck,
    group: "Engagement",
    badge: "3",
  },
  {
    label: "Announcements",
    to: "/admin/announcements",
    icon: Megaphone,
    group: "Engagement",
  },
  {
    label: "Support",
    to: "/admin/support",
    icon: LifeBuoy,
    group: "Engagement",
  },

  /* PLATFORM */

  {
    label: "SEO Manager",
    to: "/admin/seo",
    icon: Globe,
    group: "Platform",
  },
  {
    label: "Media Library",
    to: "/admin/media",
    icon: ImageIcon,
    group: "Platform",
  },
  {
    label: "Website Settings",
    to: "/admin/settings",
    icon: FolderCog,
    group: "Platform",
  },
  {
    label: "Integrations",
    to: "/admin/integrations",
    icon: Plug,
    group: "Platform",
  },

  /* SECURITY */

  {
    label: "Security Center",
    to: "/admin/security",
    icon: Lock,
    group: "Security",
  },
  {
    label: "System Logs",
    to: "/admin/logs",
    icon: Terminal,
    group: "Security",
  },
  {
    label: "Audit Logs",
    to: "/admin/audit",
    icon: ScrollText,
    group: "Security",
  },
];

/* =========================================================
   PORTAL CONFIGURATION
========================================================= */

export const portalConfig = {
  student: {
    title: "Student Portal",
    nav: studentNav,
    user: "Ananya Sharma",
    role: "Class 10",
  },

  teacher: {
    title: "Teacher Studio",
    nav: teacherNav,
    user: "Meera Iyer",
    role: "Science & Maths",
  },

  admin: {
    title: "Admin Portal",
    nav: adminNav,
    user: "Admin",
    role: "Super Admin",
  },
} as const;

export type PortalKey = keyof typeof portalConfig;
