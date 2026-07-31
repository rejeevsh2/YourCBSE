import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { PortalPage } from "@/components/layout/PortalPage";
import { StatGrid } from "@/components/common/StatCard";
import { AchievementTile } from "@/components/student/AchievementTile";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Progress } from "@/components/ui/progress";
import { achievements, learner } from "@/data/student";

export const Route = createFileRoute("/student/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — YourCBSE" },
      { name: "description", content: "Badges earned, milestones in progress and your XP level." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const earned = achievements.filter((badge) => badge.earned);
  const inProgress = achievements.filter((badge) => !badge.earned);
  const xpPercent = Math.round((learner.xp / learner.nextLevelXp) * 100);

  return (
    <PortalPage
      portalLabel="Student Portal"
      portalPath="/student"
      title="Achievements"
      description="Proof of the work you've put in — and what's coming next."
    >
      <StatGrid
        items={[
          { label: "Badges earned", value: `${earned.length} / ${achievements.length}`, tone: "success" },
          { label: "Current level", value: `Level ${learner.level}`, hint: `${learner.xp} XP`, tone: "primary" },
          { label: "Study streak", value: `${learner.streak} days`, hint: `Best ${learner.longestStreak}`, tone: "warning" },
          { label: "Rank in class", value: "#4", hint: "Top 10%", tone: "success" },
        ]}
      />

      <StudioPanel title={`Level ${learner.level} → ${learner.level + 1}`} icon={Trophy}>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              {learner.xp.toLocaleString()} / {learner.nextLevelXp.toLocaleString()} XP
            </span>
            <span className="font-semibold">{xpPercent}%</span>
          </div>
          <Progress value={xpPercent} aria-label="Level progress" />
          <p className="text-xs text-muted-foreground">
            {(learner.nextLevelXp - learner.xp).toLocaleString()} XP to the next level — roughly four chapter quizzes.
          </p>
        </div>
      </StudioPanel>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold">Earned</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {earned.map((badge) => (
            <AchievementTile key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold">In progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {inProgress.map((badge) => (
            <AchievementTile key={badge.id} badge={badge} />
          ))}
        </div>
      </section>
    </PortalPage>
  );
}
