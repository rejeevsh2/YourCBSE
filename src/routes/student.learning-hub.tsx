import { API_BASE_URL } from "@/lib/auth/http";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticatedFetch } from "@/lib/auth/http";

export const Route = createFileRoute("/student/learning-hub")({
  head: () => ({
    meta: [
      { title: "Learning Hub — YourTeacher" },
      {
        name: "description",
        content: "Browse your real CBSE curriculum and start learning.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearningHubPage,
});

const API = `${API_BASE_URL}/public`;
const CBSE_BOARD_ID = 1;

type Grade = {
  id: string;
  slug: string;
  name: string;
  level: string;
  subjectCount: number;
  chapterCount: number;
  description: string;
};

type Subject = {
  id: string;
  slug: string;
  name: string;
  grades: string[];
  chapterCount: number;
  description: string;
};

type Unit = {
  id: number;
  subject_id: number;
  title?: string;
  name?: string;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
};

type Chapter = {
  id: number;
  unit_id: number;
  title: string;
  code?: string | null;
  chapter_number?: number;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
};

function LearningHubPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  const [query, setQuery] = useState("");

  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [error, setError] = useState("");

  async function loadGrades() {
    setLoadingGrades(true);
    setError("");

    try {
      const response = await authenticatedFetch(
        `${API}/boards/${CBSE_BOARD_ID}/grades`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Could not load grades.");
      }

      const data: Grade[] = await response.json();

      setGrades(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load CBSE grades.");
    } finally {
      setLoadingGrades(false);
    }
  }

  async function loadSubjects(gradeId: string) {
    setLoadingSubjects(true);
    setError("");

    setSubjects([]);
    setUnits([]);
    setChapters([]);

    setSelectedSubject("");
    setSelectedUnit("");

    try {
      const response = await authenticatedFetch(
        `${API}/grades/${gradeId}/subjects`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Could not load subjects.");
      }

      const data: Subject[] = await response.json();

      setSubjects(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load subjects.");
    } finally {
      setLoadingSubjects(false);
    }
  }

  async function loadUnits(subjectId: string) {
    setLoadingUnits(true);
    setError("");

    setUnits([]);
    setChapters([]);
    setSelectedUnit("");

    try {
      const response = await authenticatedFetch(
        `${API}/subjects/${subjectId}/units`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Could not load units.");
      }

      const data: Unit[] = await response.json();

      setUnits(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load units.");
    } finally {
      setLoadingUnits(false);
    }
  }

  async function loadChapters(unitId: string) {
    setLoadingChapters(true);
    setError("");
    setChapters([]);

    try {
      const response = await authenticatedFetch(
        `${API}/units/${unitId}/chapters`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Could not load chapters.");
      }

      const data: Chapter[] = await response.json();

      setChapters(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load chapters.");
    } finally {
      setLoadingChapters(false);
    }
  }

  useEffect(() => {
    loadGrades();
  }, []);

  function handleGradeChange(value: string) {
    setSelectedGrade(value);

    if (!value) {
      setSubjects([]);
      setUnits([]);
      setChapters([]);
      setSelectedSubject("");
      setSelectedUnit("");
      return;
    }

    loadSubjects(value);
  }

  function handleSubjectChange(value: string) {
    setSelectedSubject(value);

    if (!value) {
      setUnits([]);
      setChapters([]);
      setSelectedUnit("");
      return;
    }

    loadUnits(value);
  }

  function handleUnitChange(value: string) {
    setSelectedUnit(value);

    if (!value) {
      setChapters([]);
      return;
    }

    loadChapters(value);
  }

  const selectedGradeObject = grades.find(
    (grade) => grade.id === selectedGrade,
  );

  const selectedSubjectObject = subjects.find(
    (subject) => subject.id === selectedSubject,
  );

  const selectedUnitObject = units.find(
    (unit) => String(unit.id) === selectedUnit,
  );

  const filteredChapters = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return chapters;

    return chapters.filter((chapter) => {
      const searchable = [
        chapter.title,
        chapter.code ?? "",
        chapter.description ?? "",
        String(chapter.chapter_number ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [chapters, query]);

  return (
   <PortalPage
  portalLabel="Student Portal"
  portalPath="/student"
  title="Learning Hub"
  description="Browse your CBSE curriculum and open chapters from the real YourTeacher database."
  showNotice={false}
>
      <div className="space-y-5">
        <section className="tile space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-lg font-bold">
              Choose your curriculum
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select your class, subject and unit to see available chapters.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>

              <select
                id="grade"
                value={selectedGrade}
                onChange={(event) =>
                  handleGradeChange(event.target.value)
                }
                disabled={loadingGrades}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {loadingGrades
                    ? "Loading grades..."
                    : "Select grade"}
                </option>

                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>

              <select
                id="subject"
                value={selectedSubject}
                onChange={(event) =>
                  handleSubjectChange(event.target.value)
                }
                disabled={!selectedGrade || loadingSubjects}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {loadingSubjects
                    ? "Loading subjects..."
                    : selectedGrade
                      ? "Select subject"
                      : "Select grade first"}
                </option>

                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>

              <select
                id="unit"
                value={selectedUnit}
                onChange={(event) =>
                  handleUnitChange(event.target.value)
                }
                disabled={!selectedSubject || loadingUnits}
                className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {loadingUnits
                    ? "Loading units..."
                    : selectedSubject
                      ? "Select unit"
                      : "Select subject first"}
                </option>

                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title ?? unit.name ?? `Unit ${unit.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedUnit ? (
            <div className="space-y-2">
              <Label htmlFor="chapter-search">
                Search chapters
              </Label>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  id="chapter-search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search chapter title..."
                  className="rounded-2xl pl-9"
                />
              </div>
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="tile p-5">
            <p className="font-semibold text-destructive">
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-3 rounded-2xl"
              onClick={loadGrades}
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </section>
        ) : null}

        {selectedGradeObject ? (
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="tile p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent">
                  <GraduationCap className="size-5" />
                </span>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Grade
                  </p>

                  <p className="font-semibold">
                    {selectedGradeObject.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="tile p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent">
                  <BookOpen className="size-5" />
                </span>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Subject
                  </p>

                  <p className="font-semibold">
                    {selectedSubjectObject?.name ?? "Not selected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="tile p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-accent">
                  <Layers className="size-5" />
                </span>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Unit
                  </p>

                  <p className="font-semibold">
                    {selectedUnitObject?.title ??
                      selectedUnitObject?.name ??
                      "Not selected"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {loadingChapters ? (
          <section className="tile flex items-center justify-center gap-3 p-10">
            <Loader2 className="size-5 animate-spin" />

            <p className="text-sm text-muted-foreground">
              Loading chapters...
            </p>
          </section>
        ) : null}

        {!loadingChapters && selectedUnit ? (
          filteredChapters.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold">
                    Chapters
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {filteredChapters.length} chapter
                    {filteredChapters.length === 1 ? "" : "s"} available
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredChapters.map((chapter) => (
                  <article
                    key={chapter.id}
                    className="tile flex flex-col p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <BookOpen className="size-5" />
                      </span>

                      {chapter.chapter_number ? (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          Chapter {chapter.chapter_number}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex-1">
                      <h3 className="font-heading text-lg font-bold">
                        {chapter.title}
                      </h3>

                      {chapter.code ? (
                        <p className="mt-1 text-xs font-medium text-primary">
                          {chapter.code}
                        </p>
                      ) : null}

                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {chapter.description ||
                          "Open this chapter to view its lessons and learning content."}
                      </p>
                    </div>

                    <Button
                      asChild
                      className="mt-5 w-full rounded-2xl"
                    >
                      <Link
                        to="/student/chapter/$chapterSlug"
                        params={{
                          chapterSlug: String(chapter.id),
                        }}
                      >
                        Open chapter
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="tile p-10 text-center">
              <BookOpen className="mx-auto size-9 text-muted-foreground" />

              <h2 className="mt-3 font-heading text-lg font-bold">
                No chapters found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                No active chapters are available for this unit yet.
              </p>
            </section>
          )
        ) : null}

        {!selectedUnit && !loadingGrades ? (
          <section className="tile p-10 text-center">
            <GraduationCap className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-3 font-heading text-lg font-bold">
              Start exploring
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Select a grade, subject and unit above. Your real curriculum
              chapters will appear here.
            </p>
          </section>
        ) : null}
      </div>
    </PortalPage>
  );
}
