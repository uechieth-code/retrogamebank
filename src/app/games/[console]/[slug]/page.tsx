import { allGames } from "@/data/games";
import GameDetailClient from "./GameDetailClient";

export function generateStaticParams() {
  return allGames.map((game) => ({
    console: game.console_id,
    slug: game.slug,
  }));
}

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ console: string; slug: string }>;
}) {
  return <GameDetailClient paramsPromise={params} />;
}
