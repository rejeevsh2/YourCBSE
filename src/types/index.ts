/**
 * Shared TypeScript interfaces for the YourTeacher frontend foundation.
 * Phase 1: UI only — these shapes mirror the future Laravel + MySQL API.
 */

export interface Grade {
  id: string;
  slug: string;
  name: string;
  level: "Primary" | "Middle" | "Secondary" | "Senior Secondary";
  subjectCount: number;
  chapterCount: number;
  videoCount: number;
  questionCount: number;
  description: string;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  grades: string[];
  chapterCount: number;
  colorToken: "primary" | "success" | "warning" | "destructive";
  videoCount: number;
  questionCount: number;
  description: string;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  subject: string;
  grade: string;
  resourceCount: number;
  durationMinutes: number;
}

export interface VideoItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  publishedAt: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: "PDF Notes" | "Worksheet" | "Sample Paper" | "Interactive App";
  subject: string;
  grade: string;
  sizeLabel: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  initials: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  publishedAt: string;
}

export interface NavItem {
  label: string;
  to: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional sidebar section heading this item belongs to. */
  group?: string;
  /** Optional short trailing badge (counts, status). */
  badge?: string;
}

export interface Crumb {
  label: string;
  to?: string;
}

export interface StatItem {
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}

export interface PracticeSet {
  id: string;
  title: string;
  grade: string;
  subject: string;
  questionCount: number;
  durationMinutes: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
}

