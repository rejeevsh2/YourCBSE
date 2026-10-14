import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
  useNavigate,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {
  useEffect,
  lazy,
  Suspense,
  type ReactNode,
} from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { NotFoundView } from "@/components/common/NotFoundView";
import {
  ThemeProvider,
  themeInitScript,
} from "@/components/theme/ThemeProvider";
import {
  getAuthToken,
  getStoredUser,
} from "@/lib/auth";

const NativeAppSupport = lazy(() =>
  import("@/components/native/NativeAppSupport").then((module) => ({ default: module.NativeAppSupport })),
);

const AUTH_PUBLIC_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-otp",
  "/account-created",
  "/account-locked",
]);

function normalizePathname(
  pathname: string,
) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function NotFoundComponent() {
  return <NotFoundView />;
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary:
        "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try
          refreshing or head back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1",
        },
        {
          title:
            "YourSchool — Everything You Need to Succeed in CBSE",
        },
        {
          name: "description",
          content:
            "Chapter-wise CBSE notes, videos, worksheets and interactive practice for Classes 6 to 12.",
        },
        {
          name: "author",
          content: "YourSchool",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:site_name",
          content: "YourSchool",
        },
        {
          name: "twitter:card",
          content:
            "summary_large_image",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href:
            "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap",
        },
        {
          rel: "icon",
          href: "/favicon.svg",
          type: "image/x-icon",
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent:
      NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />

        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGate() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname =
    normalizePathname(
      location.pathname,
    );

  const authRoute =
    AUTH_PUBLIC_ROUTES.has(pathname);

  const authenticated =
    typeof window !== "undefined" &&
    Boolean(
      getAuthToken() &&
        getStoredUser(),
    );

  useEffect(() => {
    if (
      !authRoute &&
      !authenticated
    ) {
      void navigate({
        to: "/login",
        replace: true,
      });
    }
  }, [
    authRoute,
    authenticated,
    navigate,
  ]);

  if (
    !authRoute &&
    !authenticated
  ) {
    return null;
  }

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <ThemeProvider>
        {import.meta.env.VITE_NATIVE_APP === "true" && (
          <Suspense fallback={null}>
            <NativeAppSupport />
          </Suspense>
        )}
        <AuthGate />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
