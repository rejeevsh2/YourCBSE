import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "@/components/layout/PortalPage";
import { notificationService, type AchievementNotification } from "@/lib/notifications";
import { AchievementList } from "@/components/notifications/ReminderCards";
export const Route = createFileRoute("/student/achievements")({ component: Achievements });
function Achievements() {
  const [items, setItems] = useState<AchievementNotification[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void notificationService.achievements().then((r) => {
      if (r.ok) setItems(r.data);
      else setError(r.error.message);
    });
  }, []);
  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Learning milestones"
      description="Milestones earned by completing published lessons."
      showNotice={false}
    >
      {error && <p role="alert">{error}</p>}
      {!items && !error && <p>Loading milestones…</p>}
      {items &&
        (!items.length ? (
          <p className="tile p-5">Complete your first lesson to earn your first milestone.</p>
        ) : (
          <AchievementList achievements={items} />
        ))}
    </PortalPage>
  );
}
