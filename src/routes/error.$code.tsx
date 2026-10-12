import { createFileRoute } from "@tanstack/react-router";
import { ErrorPageView, errorPresets, type ErrorCode } from "@/components/common/ErrorPageView";
import { NotFoundView } from "@/components/common/NotFoundView";

const isErrorCode = (value: string): value is ErrorCode => value in errorPresets;

export const Route = createFileRoute("/error/$code")({
  head: ({ params }) => {
    const preset = isErrorCode(params.code) ? errorPresets[params.code] : undefined;
    const title = preset ? `${preset.label} — YourTeacher` : "Page not found — YourTeacher";
    const description = preset?.description ?? "The page you were looking for isn't here.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: ErrorCodePage,
});

function ErrorCodePage() {
  const { code } = Route.useParams();

  if (!isErrorCode(code)) {
    return <NotFoundView />;
  }

  return <ErrorPageView code={code} />;
}

