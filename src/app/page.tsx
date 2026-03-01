import { Suspense } from "react";
import HomePageContent from "./HomePageContent";

function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-[var(--color-retro-card)] rounded mb-4"></div>
      <div className="h-8 bg-[var(--color-retro-card)] rounded mb-8"></div>
      <div className="h-96 bg-[var(--color-retro-card)] rounded"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
