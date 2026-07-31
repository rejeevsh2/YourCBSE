import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioToolbar } from "@/components/teacher/StudioToolbar";
import { StatusBadge, DifficultyBadge } from "@/components/teacher/StatusBadge";
import { RowActions } from "@/components/teacher/RowActions";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questionKinds, studioQuestions } from "@/data/teacher";

export const Route = createFileRoute("/teacher/question-bank")({
  head: () => ({
    meta: [
      { title: "Question Bank — Teacher Studio" },
      { name: "description", content: "Manage MCQs, case studies, HOTS and more." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuestionBank,
});

function QuestionList({ kind }: { kind: string }) {
  const rows = kind === "All" ? studioQuestions : studioQuestions.filter((q) => q.kind === kind);

  if (rows.length === 0) {
    return (
      <EmptyState
        title={`No ${kind} questions yet`}
        description="Add your first question of this type to build out the bank."
        actionLabel="Add question"
        onAction={() => toast("Add question", { description: "Editor arrives with backend integration." })}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((question) => (
        <li key={question.id} className="tile tile-interactive flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium">{question.prompt}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full text-[11px]">{question.kind}</Badge>
              <DifficultyBadge level={question.difficulty} />
              <StatusBadge status={question.status} />
              <span className="text-xs text-muted-foreground">
                {question.grade} · {question.subject} · {question.chapter} · {question.marks} mark
                {question.marks > 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <RowActions
            label={question.prompt.slice(0, 40)}
            actions={[
              { label: "Edit" },
              { label: "Duplicate" },
              { label: "Move to chapter" },
              { label: "Delete", destructive: true, separatorBefore: true },
            ]}
          />
        </li>
      ))}
    </ul>
  );
}

function QuestionBank() {
  const tabs = ["All", ...questionKinds];

  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Question bank"
      description="Nine question formats, organised by grade, subject and chapter."
      showNotice={false}
      actions={
        <Button
          className="rounded-2xl"
          onClick={() => toast("New question", { description: "Editor arrives with backend integration." })}
        >
          <Plus className="size-4" /> Add question
        </Button>
      }
    >
      <StudioToolbar
        searchPlaceholder="Search questions…"
        filters={[
          { id: "grade", label: "Grade", options: ["Grade 9", "Grade 10", "Grade 12"] },
          { id: "subject", label: "Subject", options: ["Mathematics", "Science"] },
          { id: "difficulty", label: "Difficulty", options: ["Easy", "Moderate", "Challenging"] },
        ]}
      />

      <Tabs defaultValue="All" className="space-y-4">
        <div className="tile overflow-x-auto p-2">
          <TabsList className="h-auto w-max gap-1 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="rounded-2xl px-3 py-1.5 text-xs whitespace-nowrap">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            <QuestionList kind={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </PortalPage>
  );
}
