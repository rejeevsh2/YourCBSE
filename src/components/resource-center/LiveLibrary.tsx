import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { apiRequest, API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { getAuthToken } from "@/lib/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  grade: string;
  subject: string;
  chapter: string;
  lessonId: string;
  lessonTitle: string;
  content: string | null;
  updatedAt: string;
  hasFile: boolean;
};
type Saved = {
  resource: Resource;
  bookmarked: boolean;
  downloadedAt: string | null;
  viewedAt: string | null;
};
type Catalog = { resources: Resource[]; page: number; pages: number; total: number };
async function openResourceFile(
  id: string,
) {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/library/resources/${id}/file`,
      {
        method: "GET",
      },
    );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Please sign in again to open this resource."
        : "Unable to open this resource.",
    );
  }

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    const data =
      (await response.json()) as {
        type?: string;
        url?: string;
      };

    if (
      (data.type === "external" || data.type === "signed") &&
      data.url
    ) {
      window.open(
        data.url,
        "_blank",
        "noopener,noreferrer",
      );

      return;
    }
  }

  const blob =
    await response.blob();

  const disposition =
    response.headers.get(
      "content-disposition",
    ) ?? "";

  const match =
    disposition.match(
      /filename\*?=(?:UTF-8''|")?([^";]+)/i,
    );

  let filename =
    `resource-${id}`;

  if (match?.[1]) {
    try {
      filename =
        decodeURIComponent(
          match[1].replace(
            /"/g,
            "",
          ),
        );
    } catch {
      filename =
        match[1].replace(
          /"/g,
          "",
        );
    }
  }

  const objectUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        objectUrl,
      ),
    1000,
  );
}
const typeNames: Record<string, string> = {
  text: "Notes",
  video: "Videos",
  pdf: "PDFs",
  image: "Images",
  audio: "Audio",
  worksheet: "Worksheets",
  activity: "Activities",
  quiz: "Quizzes",
};
export function LiveLibrary({
  mode = "all",
  initialQuery = "",
  initialType = "",
  portal = "public",
}: {
  mode?: "all" | "saved" | "downloads" | "recent";
  initialQuery?: string;
  initialType?: string;
  portal?: "public" | "student";
}) {
  const [data, setData] = useState<Catalog | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [term, setTerm] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeMode, setActiveMode] =
    useState<"all" | "saved" | "downloads" | "recent">(mode);
  const requestSequence = useRef(0);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);
  const load = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setLoading(true);
    setError("");
    const auth = !!getAuthToken();
    setAuthenticated(auth);
    if (!auth) setSaved([]);
    if (activeMode !== "all" && !auth) {
      setData(null);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ q: query, type, page: String(page) });
    const result = await apiRequest<Catalog>(`/library/catalog?${params}`, { method: "GET" });
    if (sequence !== requestSequence.current) return;
    if (result.ok && result.data) setData(result.data);
    else setError(result.message);
    if (auth) {
      const r = await apiRequest<{ items: Saved[] }>("/library/account-state", { method: "GET" });
      if (sequence !== requestSequence.current) return;
      if (r.ok && r.data) setSaved(r.data.items);
      else setError(r.message);
    }
    setLoading(false);
  }, [activeMode, page, query, type]);
  useEffect(() => {
    void load();
    return () => {
      requestSequence.current += 1;
    };
  }, [load]);
  useEffect(() => {
    setTerm(initialQuery);
    setQuery(initialQuery);
    setType(initialType);
    setPage(1);
  }, [initialQuery, initialType]);
  async function save(id: string, next: boolean) {
    setBusy(id);
    setError("");
    const r = await apiRequest<{ items: Saved[] }>(`/library/resources/${id}/state`, {
      method: "PATCH",
      body: { bookmarked: next },
    });
    if (r.ok && r.data) setSaved(r.data.items);
    else setError(r.message);
    setBusy(null);
  }
  async function record(id: string) {
    if (!authenticated) return;
    const r = await apiRequest<{ items: Saved[] }>(`/library/resources/${id}/state`, {
      method: "PATCH",
      body: { downloaded: true },
    });
    if (r.ok && r.data) setSaved(r.data.items);
  }
  const title = {
    all: "Resource library",
    saved: "Saved resources",
    downloads: "Download history",
    recent: "Recently viewed",
  }[activeMode];
  const resources =
    activeMode === "all"
      ? (data?.resources ?? [])
      : saved
          .filter((s) =>
            activeMode === "saved"
              ? s.bookmarked
              : activeMode === "downloads"
                ? !!s.downloadedAt
                : !!s.viewedAt,
          )
          .map((s) => s.resource)
          .filter(
            (r) =>
              (!type || r.type === type) &&
              (!query || `${r.title} ${r.description} ${r.type} ${r.grade} ${r.subject} ${r.chapter} ${r.lessonTitle} ${r.content ?? ""}`.toLowerCase().includes(query.toLowerCase())),
          );
  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={
          activeMode === "downloads"
            ? "Files and resource links you have opened. Your browser controls where downloaded files are saved."
            : "Published lesson resources, organised by grade and subject."
        }
      />
      <div className="flex flex-wrap gap-2">
        {portal === "student" ? (
          <>
            <Button
              type="button"
              variant={activeMode === "all" ? "default" : "outline"}
              onClick={() => {
                setActiveMode("all");
                setPage(1);
              }}
            >
              All resources
            </Button>

            <Button
              type="button"
              variant={activeMode === "saved" ? "default" : "outline"}
              onClick={() => {
                setActiveMode("saved");
                setPage(1);
              }}
            >
              Saved
            </Button>

            <Button
              type="button"
              variant={activeMode === "downloads" ? "default" : "outline"}
              onClick={() => {
                setActiveMode("downloads");
                setPage(1);
              }}
            >
              Downloads
            </Button>

            <Button
              type="button"
              variant={activeMode === "recent" ? "default" : "outline"}
              onClick={() => {
                setActiveMode("recent");
                setPage(1);
              }}
            >
              Recent
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link to="/library">All resources</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/library/favorites">Saved</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/library/downloads">Downloads</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/library/recent">Recent</Link>
            </Button>
          </>
        )}
      </div>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(term);
          setPage(1);
        }}
      >
        <Input
          className="min-w-40 flex-1"
          aria-label="Search resources"
          placeholder="Search resources, lessons, chapters, subjects or grades..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <select
          aria-label="Resource type"
          className="rounded-lg border bg-background p-2"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          {Object.entries(typeNames).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Button>Search</Button>
      </form>
      {error && (
        <p role="alert" className="tile p-4">
          {error}{" "}
          <Button onClick={load} variant="outline">
            Retry
          </Button>
        </p>
      )}
      {loading ? (
        <p role="status">Loading resources…</p>
      ) : mode !== "all" && !authenticated ? (
        <p>
          Please{" "}
          <Link className="text-primary underline" to="/login">
            sign in
          </Link>{" "}
          to view your resources.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {activeMode === "all" ? data?.total : resources.length} resources
          </p>
          {!resources.length && (
            <p className="tile p-6">
              No resources match. Published lesson resources will appear here.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <article className="tile flex flex-col gap-3 p-5" key={r.id}>
                <span className="text-xs font-semibold text-primary">
                  {typeNames[r.type] ?? r.type} · {r.grade}
                </span>
                <h2 className="text-lg font-bold">{r.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {r.subject} · {r.chapter}
                </p>
                <p className="line-clamp-3 flex-1 text-sm">{r.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    {portal === "student" ? (
                      <Link
                        to="/student/lesson/$lessonId"
                        params={{ lessonId: r.lessonId }}
                      >
                        Open
                      </Link>
                    ) : (
                      <Link
                        to="/library/resource/$resourceId"
                        params={{ resourceId: r.id }}
                      >
                        Open
                      </Link>
                    )}
                  </Button>
                  {authenticated && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === r.id}
                      onClick={() =>
                        save(r.id, !saved.some((s) => s.resource.id === r.id && s.bookmarked))
                      }
                    >
                      {saved.some((s) => s.resource.id === r.id && s.bookmarked)
                        ? "Unsave"
                        : "Save"}
                    </Button>
                  )}
                  {r.hasFile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setError("");

                        void openResourceFile(r.id)
                          .then(() => record(r.id))
                          .catch((error) => {
                            setError(
                              error instanceof Error
                                ? error.message
                                : "Unable to open this resource.",
                            );
                          });
                      }}
                    >
                      File / link
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {activeMode === "all" && data && data.pages > 1 && (
            <div className="flex items-center gap-4">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span>
                Page {page} of {data.pages}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export function LiveResource({ id }: { id: string }) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setResource(null);
    setError("");
    void apiRequest<{ resource: Resource }>(`/library/resources/${id}`, { method: "GET" }).then(
      (r) => {
        if (cancelled) return;
        if (r.ok && r.data) {
          setResource(r.data.resource);
          if (getAuthToken())
            void apiRequest(`/library/resources/${id}/state`, {
              method: "PATCH",
              body: { viewed: true },
            });
        } else setError(r.message);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (error)
    return (
      <p role="alert">
        {error}{" "}
        <Link to="/library" className="underline">
          Back to library
        </Link>
      </p>
    );
  if (!resource) return <p role="status">Loading resource…</p>;
  return (
    <div className="space-y-5">
      <PageHeader
        title={resource.title}
        description={`${resource.grade} · ${resource.subject} · ${resource.chapter}`}
      />
      <div className="tile space-y-5 p-6">
        <p>{resource.description}</p>
        {resource.content && (
          <div className="whitespace-pre-wrap rounded-xl bg-muted p-5">{resource.content}</div>
        )}
        <p className="text-sm text-muted-foreground">Updated {resource.updatedAt}</p>
        <div className="flex flex-wrap gap-3">
          {resource.hasFile && (
            <Button
              type="button"
              onClick={() => {
                setError("");

                void openResourceFile(
                  resource.id,
                )
                  .then(() =>
                    apiRequest(
                      `/library/resources/${id}/state`,
                      {
                        method: "PATCH",
                        body: {
                          downloaded: true,
                        },
                      },
                    ),
                  )
                  .catch((error) => {
                    setError(
                      error instanceof Error
                        ? error.message
                        : "Unable to open this resource.",
                    );
                  });
              }}
            >
              Open file / resource link
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/student/lesson/$lessonId" params={{ lessonId: resource.lessonId }}>
              Open lesson
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/library">Back to library</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
