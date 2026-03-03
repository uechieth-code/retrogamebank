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

function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "レトロゲームバンク",
    alternateName: "RetroGameBank",
    url: "https://retrogamebank.com",
    description: "ファミコン・スーファミ・PS1・PS2・セガサターンなど24機種15000タイトル以上のレトロゲーム中古価格・プレミア情報を収録したデータベースサイト。",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://retrogamebank.com/?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <WebSiteJsonLd />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageContent />
      </Suspense>
    </>
  );
}
