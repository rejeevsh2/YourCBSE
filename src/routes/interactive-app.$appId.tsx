import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";
import { clearSession, getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/interactive-app/$appId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Launch Interactive App — YourSchool" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InteractiveAppLaunch,
});

function InteractiveAppLaunch() {
  const { appId } = Route.useParams();
  const [message, setMessage] = useState("Verifying your YourSchool login…");

  useEffect(() => {
    let canceled = false;
    const returnTo = `/interactive-app/${appId}`;

    if (!/^[1-9][0-9]*$/.test(appId)) {
      setMessage("Invalid interactive app link.");
      return;
    }

    if (!getAuthToken()) {
      window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    async function launch() {
      try {
        const result = await authenticatedFetch(
          `${API_BASE_URL}/interactive-apps/${appId}/launch`,
          { method: "POST", headers: { Accept: "application/json" } },
        );

        if (result.status === 401) {
          // Expired/revoked tokens must not redirect in a login loop.
          clearSession();
          window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }

        if (!result.ok) {
          const data = await result.json().catch(() => null);
          throw new Error(
            data?.message ||
            (result.status === 403
              ? "Your account does not have access to this lesson or app."
              : "Could not launch this app."),
          );
        }

        const data = (await result.json()) as { launch_url?: string };
        if (!data.launch_url) throw new Error("Launch link was not provided.");

        const launch = new URL(data.launch_url);
        const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
        if (launch.origin !== apiOrigin) throw new Error("Unexpected app launch host.");

        if (!canceled) {
          setMessage("Opening your interactive app…");
          window.location.replace(launch.href);
        }
      } catch (error) {
        if (!canceled) {
          setMessage(error instanceof Error ? error.message : "Unable to open this app.");
        }
      }
    }

    void launch();
    return () => { canceled = true; };
  }, [appId]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">YourSchool Interactive App</h1>
      <p role="status">{message}</p>
      <a className="text-primary underline" href="/">Return to YourSchool</a>
    </main>
  );
}
