import { createFileRoute } from "@tanstack/react-router";
import { SkipLink } from "@/components/common/SkipLink";
import { HomeThemeProvider } from "@/components/home/HomeShell";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeFooter } from "@/components/home/HomeFooter";
import {
  AiStudyAssistant,
  BrowseByGrade,
  BrowseBySubject,
  ClosingCta,
  FeaturedChapters,
  GlobalSearch,
  Hero,
  LatestResources,
  LatestVideos,
  LearningStatistics,
  MockTests,
  Newsletter,
  PopularThisWeek,
  Testimonials,
  WhyChooseUs,
} from "@/components/home/sections";


const title = "YourCBSE — Everything You Need to Succeed in CBSE";
const description =
  "Chapter-wise CBSE notes, video lessons, worksheets and practice tests for Classes 6 to 12, organised by grade and subject.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <HomeThemeProvider>
      <SkipLink />
      <HomeHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <GlobalSearch />
        <BrowseByGrade />
        <BrowseBySubject />
        <FeaturedChapters />
        <PopularThisWeek />
        <LatestResources />
        <LatestVideos />
        <MockTests />
        <AiStudyAssistant />
        <LearningStatistics />
        <WhyChooseUs />
        <Testimonials />
        <ClosingCta />
        <Newsletter />

      </main>
      <HomeFooter />
    </HomeThemeProvider>
  );
}
