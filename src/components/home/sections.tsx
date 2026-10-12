import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Flame,
  GraduationCap,
  LibraryBig,
  ListChecks,
  Mail,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Section, SectionHeading } from "@/components/home/HomeShell";
import { Reveal } from "@/components/common/Reveal";
import { GradeCard, SubjectCard } from "@/components/common/BrowseCards";
import { SearchAutocomplete } from "@/components/common/SearchAutocomplete";
import {
  featuredChapters,
  grades,
  latestResources,
  latestVideos,
  practiceSets,
  subjects,
  testimonials,
} from "@/data/placeholder";
import { trendingSearches } from "@/data/search";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const heroStats = [
  { label: "Chapters mapped", value: "700+" },
  { label: "Video lessons", value: "1,200+" },
  { label: "Practice questions", value: "9,000+" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 size-[34rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="space-y-7">
          <Pill tone="primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            CBSE Classes 6 – 12 · Updated syllabus
          </Pill>

          <div className="space-y-4">
            <h1 className="font-heading text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Everything You Need to Succeed in <span className="text-primary">CBSE</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Chapter-wise notes, video lessons, worksheets and interactive practice — organised
              by grade and subject, built for students and the teachers who guide them.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group rounded-xl">
              <Link to="/register">
                Start learning free
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/grades">Browse grades</Link>
            </Button>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-border pt-6">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dt>
                <dd className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Illustration placeholder — abstract lesson preview */}
        <div className="relative" aria-hidden="true">
          <div className="panel relative overflow-hidden p-5 sm:p-6 sm:pb-14">
            <div className="flex items-center justify-between">
              <Pill tone="primary">Class 10 · Mathematics</Pill>
              <span className="text-xs text-muted-foreground">Chapter 1</span>
            </div>
            <div className="mt-5 space-y-3">
              {["Real Numbers", "Polynomials", "Triangles"].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-3.5 py-3"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                  <PlayCircle className="ml-auto size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Weekly revision progress</span>
                <span className="font-semibold text-foreground">86%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[86%] rounded-full bg-primary" />
              </div>
            </div>
          </div>

          <div className="panel absolute -bottom-6 left-4 hidden items-center gap-3 p-4 shadow-lg sm:flex">
            <span className="flex size-10 items-center justify-center rounded-xl bg-success/12 text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Chapter completed</p>
              <p className="text-xs text-muted-foreground">Trigonometry · 18 min</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

export function GlobalSearch() {
  return (
    <Section aria-labelledby="global-search-heading" className="pt-12 sm:pt-14">
      <Reveal className="panel p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="global-search-heading"
            className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Search chapters, subjects and grades
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One search across every note, video, worksheet and practice set on YourTeacher.
          </p>

          <div className="mt-6 text-left">
            <SearchAutocomplete
              size="lg"
              withButton
              placeholder="Try “Class 10 Real Numbers” or “Sample papers”"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {trendingSearches.slice(0, 4).map((term) => (
              <Link
                key={term}
                to="/search"
                className="inline-flex min-h-9 items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Browse by grade                                                     */
/* ------------------------------------------------------------------ */

export function BrowseByGrade() {
  return (
    <Section aria-labelledby="grades-heading" tone="muted">
      <SectionHeading
        id="grades-heading"
        eyebrow="Browse by grade"
        title="Pick your class and start"
        description="Every grade is mapped to the latest CBSE syllabus, chapter by chapter."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/grades">
              All grades
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grades.slice(0, 6).map((grade, index) => (
          <Reveal as="li" key={grade.id} delay={index * 60}>
            <GradeCard grade={grade} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Browse by subject                                                   */
/* ------------------------------------------------------------------ */

export function BrowseBySubject() {
  return (
    <Section aria-labelledby="subjects-heading">
      <SectionHeading
        id="subjects-heading"
        eyebrow="Browse by subject"
        title="Study the subject you need today"
        description="From core subjects to specialised streams — each with notes, videos and practice."
        action={
          <Button asChild variant="outline" className="rounded-xl">
           <Link
  to="/subjects"
  search={{ grade: "1" }}
>
              All subjects
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject, index) => (
          <Reveal as="li" key={subject.id} delay={index * 50}>
            <SubjectCard subject={subject} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured chapters                                                   */
/* ------------------------------------------------------------------ */

export function FeaturedChapters() {
  return (
    <Section aria-labelledby="featured-heading" tone="muted">
      <SectionHeading
        id="featured-heading"
        eyebrow="Featured chapters"
        title="Handpicked chapters to start with"
        description="Complete chapters with notes, videos, worksheets and practice in one place."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/search">
              Browse chapters
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredChapters.map((chapter, index) => (
          <Reveal as="li" key={chapter.id} delay={index * 50}>
            <Link
              to="/learn/$chapterSlug"
              params={{ chapterSlug: chapter.slug ?? "real-numbers" }}
              className="panel panel-interactive group flex h-full flex-col gap-4 p-5"
            >

              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="primary">{chapter.grade}</Pill>
                <Pill>{chapter.subject}</Pill>
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                {chapter.title}
              </h3>
              <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <LibraryBig className="size-3.5" aria-hidden="true" />
                  {chapter.resourceCount} resources
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {chapter.durationMinutes} min
                </span>
                <ArrowRight
                  className="ml-auto size-4 text-primary transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Popular this week                                                   */
/* ------------------------------------------------------------------ */

const popularThisWeek = [
  { rank: 1, title: "Real Numbers", meta: "Class 10 · Mathematics", learners: "12.4k", trend: "+18%" },
  { rank: 2, title: "Light — Reflection and Refraction", meta: "Class 10 · Science", learners: "10.1k", trend: "+12%" },
  { rank: 3, title: "Integrals", meta: "Class 12 · Mathematics", learners: "8.7k", trend: "+9%" },
  { rank: 4, title: "Nationalism in India", meta: "Class 10 · Social Science", learners: "7.9k", trend: "+7%" },
  { rank: 5, title: "Chemical Bonding", meta: "Class 11 · Chemistry", learners: "6.3k", trend: "+6%" },
];

export function PopularThisWeek() {
  return (
    <Section aria-labelledby="popular-heading">
      <SectionHeading
        id="popular-heading"
        eyebrow="Popular this week"
        title="What other students are studying"
        description="A live-style snapshot of the chapters getting the most attention right now."
      />

      <Reveal className="panel overflow-hidden">
        <ol className="divide-y divide-border">
          {popularThisWeek.map((item) => (
            <li key={item.rank}>
              <Link
                to="/search"
                className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-secondary/60 sm:px-6"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">
                  {item.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground sm:text-base">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{item.meta}</span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {item.learners} learners
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <Flame className="size-3" aria-hidden="true" />
                  {item.trend}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Latest resources                                                    */
/* ------------------------------------------------------------------ */

export function LatestResources() {
  return (
    <Section aria-labelledby="resources-heading" tone="muted">
      <SectionHeading
        id="resources-heading"
        eyebrow="Latest resources"
        title="Fresh notes, worksheets and papers"
        description="Downloadable material added by teachers across the syllabus."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/search">
              All resources
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {latestResources.map((resource, index) => (
          <Reveal as="li" key={resource.id} delay={index * 50}>
            <div className="panel panel-interactive flex h-full flex-col gap-3 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <Pill>{resource.type}</Pill>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {resource.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {resource.grade} · {resource.subject}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{resource.sizeLabel}</span>
                <Button asChild size="sm" variant="ghost" className="rounded-lg">
                  <Link to="/search">
                    <Download className="size-3.5" aria-hidden="true" />
                    Open
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Latest videos                                                       */
/* ------------------------------------------------------------------ */

export function LatestVideos() {
  return (
    <Section aria-labelledby="videos-heading">
      <SectionHeading
        id="videos-heading"
        eyebrow="Latest videos"
        title="New lessons published weekly"
        description="Short, focused explanations recorded by experienced CBSE teachers."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/search">
              All videos
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {latestVideos.map((video, index) => (
          <Reveal as="li" key={video.id} delay={index * 50}>
            <Link
              to="/search"
              className="panel panel-interactive group flex h-full flex-col overflow-hidden"
            >
              <div className="relative flex aspect-video items-center justify-center bg-secondary">
                <PlayCircle
                  className="size-10 text-primary transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                <span className="absolute right-2 bottom-2 rounded-md bg-foreground/85 px-1.5 py-0.5 text-[11px] font-medium text-background">
                  {video.durationMinutes} min
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {video.grade} · {video.subject}
                </p>
                <p className="mt-auto pt-2 text-xs text-muted-foreground">{video.publishedAt}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Mock tests                                                          */
/* ------------------------------------------------------------------ */

const difficultyTone = {
  Easy: "success",
  Moderate: "primary",
  Challenging: "warning",
} as const;

export function MockTests() {
  return (
    <Section aria-labelledby="practice-heading" tone="muted">
      <SectionHeading
        id="practice-heading"
        eyebrow="Mock tests"
        title="Test yourself, chapter by chapter"
        description="Timed sets modelled on the CBSE board pattern, with instant self-review."
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/search">
              All mock tests
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <ul className="grid gap-4 lg:grid-cols-3">
        {practiceSets.map((set, index) => (
          <Reveal as="li" key={set.id} delay={index * 60}>
            <div className="panel panel-interactive flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ListChecks className="size-5" aria-hidden="true" />
                </span>
                <Pill tone={difficultyTone[set.difficulty]}>{set.difficulty}</Pill>
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {set.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {set.grade} · {set.subject}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  {set.questionCount} questions · {set.durationMinutes} min
                </span>
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/search">
                    Start test
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* AI study assistant (coming soon)                                    */
/* ------------------------------------------------------------------ */

const assistantCapabilities = [
  "Explain any chapter in simpler words",
  "Generate practice questions instantly",
  "Summarise notes before an exam",
  "Suggest what to revise next",
];

export function AiStudyAssistant() {
  return (
    <Section aria-labelledby="ai-heading">
      <Reveal className="panel aurora relative overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-5">
            <Pill tone="primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Coming soon
            </Pill>
            <h2
              id="ai-heading"
              className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Meet your AI study assistant
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A guided tutor that knows your syllabus — ask a doubt, get a clear explanation with
              the exact chapter and practice set to follow up with.
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {assistantCapabilities.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="rounded-xl" disabled>
              Notify me when it launches
            </Button>
          </div>

          <div className="panel space-y-3 p-5" aria-hidden="true">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">YourTeacher Assistant</span>
              <span className="ml-auto rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                Preview
              </span>
            </div>
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
              Explain Euclid's division lemma simply.
            </p>
            <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5 text-sm text-foreground">
              It says any integer a can be written as a = bq + r, where 0 ≤ r &lt; b. It's the base
              of the HCF method in Real Numbers.
            </p>
            <div className="flex gap-2 pt-1">
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                Show example
              </span>
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                Practice 5 questions
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Learning statistics                                                 */
/* ------------------------------------------------------------------ */

const learningStats = [
  { icon: Users, value: "48,200+", label: "Active learners", hint: "across Classes 6 – 12" },
  { icon: LibraryBig, value: "700+", label: "Chapters mapped", hint: "to the latest syllabus" },
  { icon: PlayCircle, value: "1,200+", label: "Video lessons", hint: "recorded by teachers" },
  { icon: TrendingUp, value: "92%", label: "Report better scores", hint: "after one term" },
];

export function LearningStatistics() {
  return (
    <Section aria-labelledby="stats-heading" tone="muted">
      <SectionHeading
        id="stats-heading"
        align="center"
        eyebrow="Learning statistics"
        title="A study platform that keeps growing"
        description="Placeholder figures shown while the platform is in its interface phase."
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {learningStats.map((stat, index) => (
          <Reveal as="li" key={stat.label} delay={index * 60}>
            <div className="panel panel-interactive flex h-full flex-col items-start gap-3 p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Why choose YourTeacher                                                 */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: Target,
    title: "Mapped to the syllabus",
    description:
      "Every chapter follows the latest CBSE curriculum, so nothing on your exam is a surprise.",
  },
  {
    icon: FileText,
    title: "One place per chapter",
    description: "Notes, videos, worksheets and practice bundled together — no more tab hunting.",
  },
  {
    icon: Users,
    title: "Built with teachers",
    description: "Material is written and reviewed by teachers who take CBSE classes every day.",
  },
  {
    icon: ShieldCheck,
    title: "Ad-free and distraction-free",
    description: "A calm, focused reading experience designed for long study sessions.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <Section aria-labelledby="why-heading">
      <SectionHeading
        id="why-heading"
        align="center"
        eyebrow="Why choose YourTeacher"
        title="Built for real exam preparation"
        description="Structured content, honest practice and tools that respect a student's time."
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Reveal as="li" key={benefit.title} delay={index * 60}>
            <div className="panel panel-interactive h-full p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <benefit.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export function Testimonials() {
  return (
    <Section aria-labelledby="testimonials-heading" tone="muted">
      <SectionHeading
        id="testimonials-heading"
        align="center"
        eyebrow="Testimonials"
        title="Students and teachers on YourTeacher"
      />

      <ul className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal as="li" key={testimonial.id} delay={index * 70}>
            <figure className="panel panel-interactive flex h-full flex-col p-6">
              <Quote className="size-6 text-primary/40" aria-hidden="true" />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {testimonial.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */

export function ClosingCta() {
  return (
    <Section aria-labelledby="cta-heading">
      <Reveal className="panel grid gap-6 p-6 text-center sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-12 lg:text-left">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <GraduationCap className="size-3.5" aria-hidden="true" />
            Free while in preview
          </span>
          <h2
            id="cta-heading"
            className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Ready to study smarter this term?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Create a free account to bookmark chapters, track progress and pick up exactly where
            you left off — on any device.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button asChild size="lg" className="group rounded-xl">
            <Link to="/register">
              Create free account
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link to="/teacher">For teachers</Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export function Newsletter() {
  return (
    <Section aria-labelledby="newsletter-heading" tone="muted">
      <Reveal className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-primary-foreground/15 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground">
              <Mail className="size-3.5" aria-hidden="true" />
              Weekly digest
            </span>
            <h2
              id="newsletter-heading"
              className="font-heading text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl"
            >
              Get new chapters in your inbox
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
              One short email each Sunday with newly published notes, videos and mock tests.
            </p>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="home-newsletter" className="sr-only">
              Email address
            </label>
            <Input
              id="home-newsletter"
              type="email"
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-xl border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl font-semibold"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </Reveal>
    </Section>
  );
}

