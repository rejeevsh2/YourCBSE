import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCheck, Settings2 } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";
import {
  EmptyNotifications,
  NotificationErrorState,
  NotificationSkeleton,
} from "@/components/notifications/NotificationStates";
import { AchievementList, ReminderGrid } from "@/components/notifications/ReminderCards";
import { useNotificationCenter } from "@/hooks/use-notification-center";

export const Route = createFileRoute("/student/notification-center")({
  head: () => ({
    meta: [
      { title: "Notification Center — YourTeacher" },
      {
        name: "description",
        content:
          "Learning updates, assignment deadlines, achievements and reminders in one place.",
      },
      { property: "og:title", content: "Notification Center — YourTeacher" },
      {
        property: "og:description",
        content: "Every update, reminder and achievement from your CBSE study workspace.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationCenterPage,
});

function NotificationCenterPage() {
  const center = useNotificationCenter();

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Notification Center"
      description={`${center.unreadCount} unread update${center.unreadCount === 1 ? "" : "s"} across learning, reminders and achievements.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => void center.markAllRead()}
          >
            <CheckCheck className="size-4" /> Mark all read
          </Button>
          <Button asChild className="rounded-2xl">
            <Link to="/student/notification-settings">
              <Settings2 className="size-4" /> Settings
            </Link>
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="inbox" className="space-y-5">
        <TabsList className="rounded-2xl">
          <TabsTrigger value="inbox" className="rounded-xl">
            Inbox
          </TabsTrigger>
          <TabsTrigger value="reminders" className="rounded-xl">
            Reminders
          </TabsTrigger>
          <TabsTrigger value="achievements" className="rounded-xl">
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <NotificationFilters
            active={center.category}
            counts={center.counts}
            onChange={center.setCategory}
            unreadOnly={center.unreadOnly}
            onUnreadOnlyChange={center.setUnreadOnly}
            resultCount={center.filtered.length}
          />

          {center.loading ? (
            <NotificationSkeleton />
          ) : center.error ? (
            <NotificationErrorState error={center.error} onRetry={() => void center.retry()} />
          ) : center.filtered.length === 0 ? (
            <EmptyNotifications filtered={center.category !== "All" || center.unreadOnly} />
          ) : (
            <ul className="space-y-3">
              {center.filtered.map((item, index) => (
                <Reveal key={item.id} as="li" delay={Math.min(index, 6) * 40}>
                  <NotificationCard
                    item={item}
                    onMarkRead={(id) => void center.markRead(id)}
                    onDelete={(id) => void center.remove(id)}
                  />
                </Reveal>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <SectionHeading
            title="Reminders"
            description="Study reminders, revision activity, quizzes and upcoming learning events."
          />
          <ReminderGrid reminders={center.reminders} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <SectionHeading
            title="Achievements"
            description="Streaks, completed chapters, perfect scores and new badges."
          />
          <AchievementList achievements={center.achievements} />
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
