import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { resourceById } from "@/data/resource-center";
import {
  resourceCenterService,
  type LibraryUserState,
} from "@/lib/resource-center";

const initialState: LibraryUserState = { bookmarks: [], downloads: [], recentlyViewed: [] };

function titleFor(id: string) {
  return resourceById.get(id)?.title ?? "Resource";
}

/**
 * Bookmarks, downloads and recently-viewed state for the Resource Center.
 *
 * Updates are optimistic and persisted through `resourceCenterService`, so the
 * hook works unchanged once the Laravel endpoints replace the mock service.
 */
export function useResourceLibrary() {
  const [state, setState] = useState<LibraryUserState>(initialState);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    void resourceCenterService.getUserState().then((result) => {
      if (!mounted.current) return;
      if (result.ok) setState(result.data);
      setLoading(false);
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  const apply = useCallback(
    (
      optimistic: LibraryUserState,
      run: () => Promise<{ ok: boolean; data?: LibraryUserState; message?: string }>,
      previous: LibraryUserState,
    ) => {
      setState(optimistic);
      void run().then((result) => {
        if (!mounted.current) return;
        if (result.ok && result.data) {
          setState(result.data);
        } else {
          setState(previous);
          toast.error(result.message ?? "That action failed. Please try again.");
        }
      });
    },
    [],
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      const bookmarked = state.bookmarks.includes(id);
      const next: LibraryUserState = {
        ...state,
        bookmarks: bookmarked
          ? state.bookmarks.filter((value) => value !== id)
          : [...state.bookmarks, id],
      };
      toast(bookmarked ? `Removed ${titleFor(id)} from favourites` : `Saved ${titleFor(id)}`);
      apply(next, () => resourceCenterService.toggleBookmark(id, !bookmarked), state);
    },
    [apply, state],
  );

  const download = useCallback(
    (id: string) => {
      if (state.downloads.some((item) => item.resourceId === id)) {
        toast(`${titleFor(id)} is already available offline`);
        return;
      }
      const next: LibraryUserState = {
        ...state,
        downloads: [
          { resourceId: id, downloadedAt: new Date().toISOString().slice(0, 10) },
          ...state.downloads,
        ],
      };
      toast.success(`${titleFor(id)} saved for offline study`);
      apply(next, () => resourceCenterService.download(id), state);
    },
    [apply, state],
  );

  const removeDownload = useCallback(
    (id: string) => {
      const next: LibraryUserState = {
        ...state,
        downloads: state.downloads.filter((item) => item.resourceId !== id),
      };
      toast(`Removed ${titleFor(id)} from downloads`);
      apply(next, () => resourceCenterService.removeDownload(id), state);
    },
    [apply, state],
  );

  const recordView = useCallback((id: string) => {
    void resourceCenterService.recordView(id).then((result) => {
      if (mounted.current && result.ok) setState(result.data);
    });
  }, []);

  const share = useCallback((id: string) => {
    const url = `${typeof window === "undefined" ? "" : window.location.origin}/library/resource/${id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
      return;
    }
    toast(url);
  }, []);

  return {
    bookmarks: state.bookmarks,
    downloads: state.downloads,
    recentlyViewed: state.recentlyViewed,
    loading,
    toggleBookmark,
    download,
    removeDownload,
    recordView,
    share,
  };
}

export type ResourceLibraryApi = ReturnType<typeof useResourceLibrary>;
