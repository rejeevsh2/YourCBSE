import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { toast } from "sonner";
import { openExternalResource } from "@/lib/native/resources";

export function NativeAppSupport() {
  const router = useRouter();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false;
    let backListener: PluginListenerHandle | undefined;

    void App.addListener("backButton", ({ canGoBack }) => {
      if (document.fullscreenElement) {
        void document
          .exitFullscreen()
          .catch(() => toast.error("Use Exit fullscreen to return to your lesson."));
        return;
      }
      // Let open dialogs and menus close before navigating out of the page.
      const dialog = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"]',
      );
      if (dialog) {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        return;
      }
      if (canGoBack) router.history.back();
      else void App.minimizeApp();
    })
      .then((handle) => {
        if (disposed) void handle.remove();
        else backListener = handle;
      })
      .catch(() => toast.error("Android navigation could not start. Please reopen the app."));

    const updateConnection = () => setOffline(!navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    const openLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target;
      const anchor =
        target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (!["https:", "http:"].includes(url.protocol) || url.origin === window.location.origin)
        return;
      event.preventDefault();
      event.stopPropagation();
      void openExternalResource(url.href).catch(() =>
        toast.error("Unable to open this resource. Please try again."),
      );
    };
    document.addEventListener("click", openLink, true);

    return () => {
      disposed = true;
      void backListener?.remove();
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      document.removeEventListener("click", openLink, true);
    };
  }, [router]);

  if (!offline) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] bg-foreground px-4 py-2 text-center text-sm text-background"
    >
      You are offline. Reconnect to load lessons and save progress.
    </div>
  );
}
