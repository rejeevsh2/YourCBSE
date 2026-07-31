import {
  featuredChapters,
  grades,
  latestResources,
  latestVideos,
  practiceSets,
  subjects,
} from "@/data/placeholder";

export type SearchKind =
  | "Chapter"
  | "Topic"
  | "Subject"
  | "Grade"
  | "Video"
  | "Worksheet"
  | "MCQ"
  | "NCERT Solution"
  | "Resource"
  | "Practice";

/** Filter chips offered in the search UI. */
export const searchKinds: SearchKind[] = [
  "Chapter",
  "Topic",
  "Subject",
  "Grade",
  "Video",
  "Worksheet",
  "MCQ",
  "NCERT Solution",
];

export interface SearchSuggestion {
  id: string;
  label: string;
  kind: SearchKind;
  context: string;
}


/** Placeholder search index — replaced by the API in a later phase. */
export const searchIndex: SearchSuggestion[] = [
  ...featuredChapters.map((chapter) => ({
    id: `chapter-${chapter.id}`,
    label: chapter.title,
    kind: "Chapter" as const,
    context: `${chapter.grade} · ${chapter.subject}`,
  })),
  ...subjects.map((subject) => ({
    id: `subject-${subject.id}`,
    label: subject.name,
    kind: "Subject" as const,
    context: `${subject.chapterCount} chapters`,
  })),
  ...grades.map((grade) => ({
    id: `grade-${grade.id}`,
    label: grade.name,
    kind: "Grade" as const,
    context: `${grade.subjectCount} subjects · ${grade.chapterCount} chapters`,
  })),
  ...latestVideos.map((video) => ({
    id: `video-${video.id}`,
    label: video.title,
    kind: "Video" as const,
    context: `${video.grade} · ${video.durationMinutes} min`,
  })),
  ...latestResources.map((resource) => ({
    id: `resource-${resource.id}`,
    label: resource.title,
    kind: "Resource" as const,
    context: `${resource.type} · ${resource.sizeLabel}`,
  })),
  ...practiceSets.map((set) => ({
    id: `practice-${set.id}`,
    label: set.title,
    kind: "Practice" as const,
    context: `${set.questionCount} questions · ${set.difficulty}`,
  })),
  // Static entries so every filter chip has representative content.
  { id: "t-1", label: "Quadratic equations — roots", kind: "Topic", context: "Class 10 · Mathematics" },
  { id: "t-2", label: "Photosynthesis in plants", kind: "Topic", context: "Class 10 · Science" },
  { id: "w-1", label: "Trigonometry worksheet — Set A", kind: "Worksheet", context: "Class 10 · 25 questions" },
  { id: "w-2", label: "Grammar practice worksheet", kind: "Worksheet", context: "Class 8 · English" },
  { id: "m-1", label: "Chemical Reactions MCQs", kind: "MCQ", context: "Class 10 · 20 questions" },
  { id: "m-2", label: "Indian Constitution MCQs", kind: "MCQ", context: "Class 9 · Social Science" },
  { id: "n-1", label: "NCERT Solutions — Real Numbers", kind: "NCERT Solution", context: "Class 10 · Mathematics" },
  { id: "n-2", label: "NCERT Solutions — Motion", kind: "NCERT Solution", context: "Class 9 · Science" },
];


export const trendingSearches = [
  "Real Numbers",
  "Light — Reflection & Refraction",
  "Class 12 Integrals",
  "Sample papers 2026",
  "Periodic table trends",
  "Nationalism in India",
];

export const searchFilters = {
  grades: ["All grades", ...grades.map((grade) => grade.name)],
  subjects: ["All subjects", ...subjects.map((subject) => subject.name)],
  types: ["All types", "Chapters", "Notes", "Videos", "Worksheets", "Practice tests"],
  sort: ["Most relevant", "Newest first", "Most studied"],
};

export function filterSuggestions(
  query: string,
  limit = 6,
  kind?: SearchKind,
): SearchSuggestion[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return searchIndex
    .filter((item) => (kind ? item.kind === kind : true))
    .filter(
      (item) =>
        item.label.toLowerCase().includes(trimmed) ||
        item.context.toLowerCase().includes(trimmed) ||
        item.kind.toLowerCase().includes(trimmed),
    )
    .slice(0, limit);
}

