import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { libraryChapters } from "@/data/student-library";
import { studentService } from "@/lib/student";

const initialBookmarks = libraryChapters
  .filter((chapter) => chapter.bookmarked)
  .map((chapter) => chapter.id);
const initialDownloads = libraryChapters
  .filter((chapter) => chapter.downloaded)
  .map((chapter) => chapter.id);

function titleFor(id: string) {
  return libraryChapters.find((chapter) => chapter.id === id)?.title ?? "Chapter";
}

/**
 * Bookmark / offline state for the chapter library.
 *
 * Updates are optimistic and persisted through `studentService`, so the same
 * hook works unchanged once the Laravel endpoints replace the mock service.
 */
export function useLibraryState() {
  const [bookmarks, setBookmarks] = useState<string[]>(initialBookmarks);
  const [downloads, setDownloads] = useState<string[]>(initialDownloads);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;

    void studentService.getLibraryState().then((result) => {
      if (cancelled || !result.ok) return;
      setBookmarks(result.data.bookmarks);
      setDownloads(result.data.downloads);
    });

    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, []);

  const toggleBookmark = useCallback(
    (id: string) => {
      const wasBookmarked = bookmarks.includes(id);
      const next = wasBookmarked ? bookmarks.filter((value) => value !== id) : [...bookmarks, id];
      setBookmarks(next);
      toast(wasBookmarked ? `Removed ${titleFor(id)} from bookmarks` : `Bookmarked ${titleFor(id)}`);

      void studentService.toggleBookmark(id, !wasBookmarked).then((result) => {
        if (!mounted.current) return;
        if (result.ok) {
          setBookmarks(result.data.bookmarks);
        } else {
          setBookmarks(bookmarks);
          toast.error(result.message);
        }
      });
    },
    [bookmarks],
  );

  const download = useCallback(
    (id: string) => {
      if (downloads.includes(id)) {
        toast("Already available offline");
        return;
      }

      const previous = downloads;
      setDownloads([...downloads, id]);
      toast.success(`${titleFor(id)} saved for offline study`);

      void studentService.downloadChapter(id).then((result) => {
        if (!mounted.current) return;
        if (result.ok) {
          setDownloads(result.data.downloads);
        } else {
          setDownloads(previous);
          toast.error(result.message);
        }
      });
    },
    [downloads],
  );

  return { bookmarks, downloads, toggleBookmark, download };
}
