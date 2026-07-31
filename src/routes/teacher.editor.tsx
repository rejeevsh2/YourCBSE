import { createFileRoute } from "@tanstack/react-router";
import { Image as ImageIcon, Search, Sparkles, Tags, Target } from "lucide-react";
import { toast } from "sonner";
import { PortalPage } from "@/components/layout/PortalPage";
import { StudioPanel } from "@/components/teacher/StudioPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/teacher/editor")({
  head: () => ({
    meta: [
      { title: "Content Editor — Teacher Studio" },
      { name: "description", content: "Compose chapter metadata, objectives and SEO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContentEditor,
});

const keywords = ["real numbers", "euclid division", "irrational", "prime factorisation"];
const tags = ["Class 10", "Mathematics", "Term 1", "NCERT"];

function ContentEditor() {
  return (
    <PortalPage
      portalLabel="Teacher Studio"
      portalPath="/teacher"
      title="Content editor"
      description="Compose the metadata that powers a chapter across the platform."
      showNotice={false}
      actions={
        <>
          <Button variant="outline" className="rounded-2xl">
            Save draft
          </Button>
          <Button
            className="rounded-2xl"
            onClick={() => toast("Publish", { description: "Publishing connects to the backend later." })}
          >
            Publish
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <StudioPanel title="Basics" icon={Sparkles}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Real Numbers" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="A short summary students see before they start."
                  className="rounded-2xl"
                />
              </div>
            </div>
          </StudioPanel>

          <StudioPanel title="Learning objectives" icon={Target}>
            <div className="space-y-3">
              {[1, 2, 3].map((index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`objective-${index}`} className="text-xs text-muted-foreground">
                    Objective {index}
                  </Label>
                  <Input
                    id={`objective-${index}`}
                    placeholder="Students will be able to…"
                    className="rounded-2xl"
                  />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="rounded-2xl">
                + Add objective
              </Button>
            </div>
          </StudioPanel>

          <StudioPanel title="SEO metadata" icon={Search}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Meta title</Label>
                <Input id="seo-title" placeholder="Under 60 characters" className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-desc">Meta description</Label>
                <Textarea
                  id="seo-desc"
                  rows={3}
                  placeholder="Under 160 characters"
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input id="slug" placeholder="real-numbers" className="rounded-2xl font-mono text-sm" />
              </div>
            </div>
          </StudioPanel>
        </div>

        <div className="space-y-4">
          <StudioPanel title="Settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select>
                  <SelectTrigger id="difficulty" className="w-full rounded-2xl">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Easy", "Moderate", "Challenging"].map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Estimated time (minutes)</Label>
                <Input id="time" type="number" placeholder="45" className="rounded-2xl" />
              </div>
            </div>
          </StudioPanel>

          <StudioPanel title="Thumbnail" icon={ImageIcon}>
            <div className="tile flex flex-col items-center gap-2 border-dashed p-6 text-center">
              <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">1280 × 720 recommended</p>
              <Button variant="outline" size="sm" className="rounded-2xl">
                Upload image
              </Button>
            </div>
          </StudioPanel>

          <StudioPanel title="Keywords & tags" icon={Tags}>
            <div className="space-y-3">
              <Input placeholder="Add a keyword…" className="rounded-2xl" aria-label="Add keyword" />
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="rounded-full text-[11px]">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </StudioPanel>
        </div>
      </div>
    </PortalPage>
  );
}
