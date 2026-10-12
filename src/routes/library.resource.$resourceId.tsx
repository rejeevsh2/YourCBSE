import { createFileRoute } from "@tanstack/react-router";
import { LiveResource } from "@/components/resource-center/LiveLibrary";
export const Route = createFileRoute("/library/resource/$resourceId")({ component: Detail });
function Detail() {
  const { resourceId } = Route.useParams();
  return <LiveResource id={resourceId} />;
}
