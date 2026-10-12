import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  Layers3,
  Loader2,
} from "lucide-react";

import { PortalPage } from "@/components/layout/PortalPage";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiRequest } from "@/lib/auth/http";

type Grade = {
  id?: number;
  name?: string;
  title?: string;
};

type Subject = {
  id?: number;
  name?: string;
  title?: string;
  grade?: Grade | null;
};

type Unit = {
  id?: number;
  name?: string;
  title?: string;
  subject?: Subject | null;
};

type Chapter = {
  id: number;
  title: string;
  unit?: Unit | null;
};

type Response = {
  chapters: Chapter[];
};

type Mode =
  | "grades"
  | "subjects"
  | "units"
  | "chapters";

type Props = {
  mode: Mode;
};

function label(
  title?: string,
  name?: string,
  fallback = "Untitled",
) {
  return title ?? name ?? fallback;
}

export function TeacherCurriculumBrowser({
  mode,
}: Props) {
  const [chapters, setChapters] =
    useState<Chapter[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const params =
    new URLSearchParams(
      window.location.search,
    );

  const gradeId =
    Number(params.get("gradeId")) || 0;

  const subjectId =
    Number(params.get("subjectId")) || 0;

  const unitId =
    Number(params.get("unitId")) || 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const result =
        await apiRequest<Response>(
          "/teacher/chapters",
          {
            method: "GET",
          },
        );

      if (cancelled) {
        return;
      }

      if (
        result.ok &&
        result.data
      ) {
        setChapters(
          result.data.chapters,
        );
      } else {
        setError(
          result.message ??
            "Unable to load curriculum.",
        );
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const grades = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        title: string;
        subjects: Set<number>;
        units: Set<number>;
        chapters: number;
      }
    >();

    for (const chapter of chapters) {
      const unit = chapter.unit;
      const subject = unit?.subject;
      const grade = subject?.grade;

      if (!grade?.id) {
        continue;
      }

      const item =
        map.get(grade.id) ?? {
          id: grade.id,
          title: label(
            grade.title,
            grade.name,
            `Grade ${grade.id}`,
          ),
          subjects:
            new Set<number>(),
          units:
            new Set<number>(),
          chapters: 0,
        };

      if (subject?.id) {
        item.subjects.add(
          subject.id,
        );
      }

      if (unit?.id) {
        item.units.add(unit.id);
      }

      item.chapters += 1;

      map.set(grade.id, item);
    }

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [chapters]);

  const subjects = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        title: string;
        gradeId: number;
        grade: string;
        units: Set<number>;
        chapters: number;
      }
    >();

    for (const chapter of chapters) {
      const unit = chapter.unit;
      const subject = unit?.subject;
      const grade = subject?.grade;

      if (
        !subject?.id ||
        !grade?.id
      ) {
        continue;
      }

      if (
        gradeId &&
        grade.id !== gradeId
      ) {
        continue;
      }

      const item =
        map.get(subject.id) ?? {
          id: subject.id,
          title: label(
            subject.title,
            subject.name,
            `Subject ${subject.id}`,
          ),
          gradeId: grade.id,
          grade: label(
            grade.title,
            grade.name,
            "Grade",
          ),
          units:
            new Set<number>(),
          chapters: 0,
        };

      if (unit?.id) {
        item.units.add(unit.id);
      }

      item.chapters += 1;

      map.set(subject.id, item);
    }

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [chapters, gradeId]);

  const units = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        title: string;
        subject: string;
        grade: string;
        chapters: number;
      }
    >();

    for (const chapter of chapters) {
      const unit = chapter.unit;
      const subject = unit?.subject;
      const grade = subject?.grade;

      if (
        !unit?.id ||
        !subject?.id
      ) {
        continue;
      }

      if (
        subjectId &&
        subject.id !== subjectId
      ) {
        continue;
      }

      const existing =
        map.get(unit.id);

      if (existing) {
        existing.chapters += 1;
        continue;
      }

      map.set(unit.id, {
        id: unit.id,
        title: label(
          unit.title,
          unit.name,
          `Unit ${unit.id}`,
        ),
        subject: label(
          subject.title,
          subject.name,
          "Subject",
        ),
        grade: label(
          grade?.title,
          grade?.name,
          "Grade",
        ),
        chapters: 1,
      });
    }

    return Array.from(
      map.values(),
    ).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [chapters, subjectId]);

  const chapterRows =
    useMemo(() => {
      return chapters
        .filter((chapter) => {
          if (!unitId) {
            return true;
          }

          return (
            chapter.unit?.id ===
            unitId
          );
        })
        .map((chapter) => {
          const unit =
            chapter.unit;

          const subject =
            unit?.subject;

          const grade =
            subject?.grade;

          return {
            id: chapter.id,
            title: chapter.title,
            unit: label(
              unit?.title,
              unit?.name,
              "Unit",
            ),
            subject: label(
              subject?.title,
              subject?.name,
              "Subject",
            ),
            grade: label(
              grade?.title,
              grade?.name,
              "Grade",
            ),
          };
        })
        .sort((a, b) =>
          a.title.localeCompare(
            b.title,
          ),
        );
    }, [chapters, unitId]);

  const title =
    mode === "grades"
      ? "Grades"
      : mode === "subjects"
        ? "Subjects"
        : mode === "units"
          ? "Units"
          : "Chapters";

  const description =
    mode === "grades"
      ? "Choose a grade to browse its curriculum."
      : mode === "subjects"
        ? "Choose a subject to view its units."
        : mode === "units"
          ? "Choose a unit to view its chapters."
          : "Choose a chapter to view its lessons.";

  return (
    <PortalPage
      portalLabel="Teacher"
      portalPath="/teacher"
      title={title}
      description={description}
      showNotice={false}
    >
      <CurriculumBack
        mode={mode}
      />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading curriculum...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : mode === "grades" ? (
        grades.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {grades.map((grade) => (
              <a
                key={grade.id}
                href={`/teacher/subjects?gradeId=${grade.id}`}
                className="group block"
              >
                <Card className="h-full transition group-hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="size-5" />
                      {grade.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {grade.subjects.size} subjects
                      </Badge>

                      <Badge variant="outline">
                        {grade.units.size} units
                      </Badge>

                      <Badge variant="outline">
                        {grade.chapters} chapters
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      Open subjects
                      <ArrowRight className="size-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )
      ) : mode === "subjects" ? (
        subjects.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map(
              (subject) => (
                <a
                  key={subject.id}
                  href={`/teacher/units?subjectId=${subject.id}`}
                  className="group block"
                >
                  <Card className="h-full transition group-hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="size-5" />
                          {subject.title}
                        </CardTitle>

                        <Badge variant="secondary">
                          {subject.grade}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {subject.units.size} units
                        </Badge>

                        <Badge variant="outline">
                          {subject.chapters} chapters
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        Open units
                        <ArrowRight className="size-4" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ),
            )}
          </div>
        )
      ) : mode === "units" ? (
        units.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {units.map((unit) => (
              <a
                key={unit.id}
                href={`/teacher/chapters?unitId=${unit.id}`}
                className="group block"
              >
                <Card className="h-full transition group-hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="flex items-center gap-2">
                        <Layers3 className="size-5" />
                        {unit.title}
                      </CardTitle>

                      <Badge variant="secondary">
                        {unit.grade}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {unit.subject}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <Badge variant="outline">
                      {unit.chapters}{" "}
                      {unit.chapters === 1
                        ? "chapter"
                        : "chapters"}
                    </Badge>

                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      Open chapters
                      <ArrowRight className="size-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )
      ) : chapterRows.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chapterRows.map(
            (chapter) => (
              <a
                key={chapter.id}
                href={`/teacher/lessons?chapterId=${chapter.id}`}
                className="group block"
              >
                <Card className="h-full transition group-hover:border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="size-5" />
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Unit:{" "}
                      </span>
                      {chapter.unit}
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Subject:{" "}
                      </span>
                      {chapter.subject}
                    </div>

                    <Badge variant="secondary">
                      {chapter.grade}
                    </Badge>

                    <div className="flex items-center gap-2 pt-2 font-medium text-primary">
                      Open lessons
                      <ArrowRight className="size-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            ),
          )}
        </div>
      )}
    </PortalPage>
  );
}

function CurriculumBack({
  mode,
}: {
  mode: Mode;
}) {
  if (mode === "grades") {
    return null;
  }

  const href =
    mode === "subjects"
      ? "/teacher/grades"
      : mode === "units"
        ? "/teacher/subjects"
        : "/teacher/units";

  const label =
    mode === "subjects"
      ? "Back to grades"
      : mode === "units"
        ? "Back to subjects"
        : "Back to units";

  return (
    <div className="mb-5">
      <a
        href={href}
        className="text-sm font-medium text-primary hover:underline"
      >
        ← {label}
      </a>
    </div>
  );
}

function Empty() {
  return (
    <Card>
      <CardContent className="pt-6 text-sm text-muted-foreground">
        No active curriculum records were found.
      </CardContent>
    </Card>
  );
}