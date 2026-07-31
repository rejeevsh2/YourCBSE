import {
  BadgeCheck,
  Bell,
  BellRing,
  Bot,
  DatabaseBackup,
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


export const studentNav: NavItem[] = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard, group: "Overview" },
  { label: "Learning Hub", to: "/student/learning-hub", icon: Compass, group: "Overview" },
  { label: "My Courses", to: "/student/courses", icon: BookOpen, group: "Overview" },
  { label: "Continue Learning", to: "/student/continue-learning", icon: PlayCircle, group: "Overview" },
  { label: "Learning Path", to: "/student/learning-path", icon: Route, group: "Overview" },

  { label: "Practice Center", to: "/student/practice", icon: ListChecks, group: "Study" },
  { label: "Revision Hub", to: "/student/revision", icon: Repeat2, group: "Study" },
  { label: "AI Assistant", to: "/student/assistant", icon: Sparkles, group: "Study" },
  { label: "AI Study Assistant", to: "/student/ai", icon: Bot, group: "Study", badge: "New" },
  { label: "Search", to: "/student/search", icon: Search, group: "Study" },

  { label: "My Progress", to: "/student/progress", icon: TrendingUp, group: "Progress" },
  { label: "Analytics", to: "/student/analytics", icon: BarChart3, group: "Progress" },
  { label: "Achievements", to: "/student/achievements", icon: Trophy, group: "Progress" },

  { label: "Downloads", to: "/student/downloads", icon: Download, group: "Library" },
  { label: "Bookmarks", to: "/student/bookmarks", icon: BookMarked, group: "Library" },

  { label: "Study Planner", to: "/student/planner", icon: ListTodo, group: "Plan" },
  { label: "Calendar", to: "/student/calendar", icon: CalendarDays, group: "Plan" },

  { label: "Notifications", to: "/student/notifications", icon: Bell, group: "Account" },
  { label: "Notification Center", to: "/student/notification-center", icon: BellRing, group: "Account", badge: "3" },
  { label: "Profile", to: "/student/profile", icon: User, group: "Account" },
  { label: "Settings", to: "/student/settings", icon: Settings, group: "Account" },
  { label: "Help & Support", to: "/student/help", icon: LifeBuoy, group: "Account" },
];


export const teacherNav: NavItem[] = [
  { label: "Dashboard", to: "/teacher", icon: LayoutDashboard, group: "Overview" },
  { label: "My Classes", to: "/teacher/classes", icon: Users, group: "Overview" },
  { label: "Students", to: "/teacher/students", icon: GraduationCap, group: "Overview" },
  { label: "Messages", to: "/teacher/messages", icon: MessageSquare, group: "Overview", badge: "2" },

  { label: "Grades", to: "/teacher/grades", icon: ShieldCheck, group: "Curriculum" },
  { label: "Subjects", to: "/teacher/subjects", icon: BookOpen, group: "Curriculum" },
  { label: "Chapters", to: "/teacher/chapters", icon: Layers, group: "Curriculum" },
  { label: "Interactive Apps", to: "/teacher/interactive-apps", icon: Boxes, group: "Curriculum" },

  { label: "Videos", to: "/teacher/videos", icon: PlayCircle, group: "Content" },
  { label: "Notes", to: "/teacher/notes", icon: FileText, group: "Content" },
  { label: "Worksheets", to: "/teacher/worksheets", icon: FileStack, group: "Content" },
  { label: "Flashcards", to: "/teacher/flashcards", icon: Layers3, group: "Content" },
  { label: "Mind Maps", to: "/teacher/mind-maps", icon: Network, group: "Content" },
  { label: "Resource Library", to: "/teacher/library", icon: FolderOpen, group: "Content" },

  { label: "Question Bank", to: "/teacher/question-bank", icon: ListChecks, group: "Assessment" },
  { label: "Assignments", to: "/teacher/assignments", icon: ClipboardList, group: "Assessment" },
  { label: "Analytics", to: "/teacher/analytics", icon: BarChart3, group: "Assessment" },

  { label: "Drafts", to: "/teacher/drafts", icon: PenSquare, group: "Workspace", badge: "9" },
  { label: "Published Content", to: "/teacher/published", icon: BadgeCheck, group: "Workspace" },
  { label: "Settings", to: "/teacher/settings", icon: Settings, group: "Workspace" },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, group: "Overview" },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3, group: "Overview" },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart, group: "Overview" },

  { label: "Users", to: "/admin/users", icon: Users, group: "People" },
  { label: "Students", to: "/admin/students", icon: GraduationCap, group: "People" },
  { label: "Teachers", to: "/admin/teachers", icon: UserCog, group: "People" },
  { label: "Parents", to: "/admin/parents", icon: HeartHandshake, group: "People", badge: "Soon" },
  { label: "Roles & Permissions", to: "/admin/roles", icon: KeyRound, group: "People" },

  { label: "Grades", to: "/admin/grades", icon: ShieldCheck, group: "Curriculum" },
  { label: "Subjects", to: "/admin/subjects", icon: BookOpen, group: "Curriculum" },
  { label: "Chapters", to: "/admin/chapters", icon: Layers, group: "Curriculum" },
  { label: "Interactive Apps", to: "/admin/interactive-apps", icon: Boxes, group: "Curriculum" },

  { label: "Videos", to: "/admin/videos", icon: PlayCircle, group: "Content" },
  { label: "Notes", to: "/admin/notes", icon: FileText, group: "Content" },
  { label: "Worksheets", to: "/admin/worksheets", icon: FileStack, group: "Content" },
  { label: "Question Bank", to: "/admin/question-bank", icon: ListChecks, group: "Content" },
  { label: "Flashcards", to: "/admin/flashcards", icon: Layers3, group: "Content" },
  { label: "Mind Maps", to: "/admin/mind-maps", icon: Network, group: "Content" },
  { label: "Resource Library", to: "/admin/resources", icon: FolderOpen, group: "Content" },
  { label: "Blog", to: "/admin/blog", icon: Newspaper, group: "Content" },

  { label: "Approvals", to: "/admin/approvals", icon: BadgeCheck, group: "Engagement", badge: "3" },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone, group: "Engagement" },
  { label: "Notifications", to: "/admin/notifications", icon: Bell, group: "Engagement" },
  { label: "Support", to: "/admin/support", icon: LifeBuoy, group: "Engagement" },

  { label: "SEO Manager", to: "/admin/seo", icon: Globe, group: "Platform" },
  { label: "Media Library", to: "/admin/media", icon: ImageIcon, group: "Platform" },
  { label: "Website Settings", to: "/admin/settings", icon: FolderCog, group: "Platform" },
  { label: "Integrations", to: "/admin/integrations", icon: Plug, group: "Platform" },
  { label: "Backup & Restore", to: "/admin/backup", icon: DatabaseBackup, group: "Platform" },

  { label: "Security Center", to: "/admin/security", icon: Lock, group: "Security" },
  { label: "System Logs", to: "/admin/logs", icon: Terminal, group: "Security" },
  { label: "Audit Logs", to: "/admin/audit", icon: ScrollText, group: "Security" },
];

export const portalConfig = {
  student: { title: "Student Portal", nav: studentNav, user: "Ananya Sharma", role: "Class 10" },
  teacher: { title: "Teacher Studio", nav: teacherNav, user: "Meera Iyer", role: "Science & Maths" },
  admin: { title: "Admin Portal", nav: adminNav, user: "Admin", role: "Super Admin" },
} as const;

export type PortalKey = keyof typeof portalConfig;
