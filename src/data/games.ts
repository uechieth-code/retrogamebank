import { Game } from "@/types";
import { fcGames } from "./fc-games";
import { sfcGames } from "./sfc-games";
import { gbGames } from "./gb-games";
import { mdGames } from "./md-games";

import { gbaGames, ndsGames, ps1Games, ps2Games, ssGames } from "./games-expanded";

export const allGames: Game[] = [...fcGames, ...sfcGames, ...gbGames, ...mdGames, ...gbaGames, ...ndsGames, ...ps1Games, ...ps2Games, ...ssGames];

export function getGamesByConsole(consoleId: string): Game[] {
  return allGames.filter((g) => g.console_id === consoleId);
}

export function getGameBySlug(consoleId: string, gameSlug: string): Game | undefined {
  return allGames.find((g) => g.console_id === consoleId && g.slug === gameSlug);
}

export function getGameById(id: string): Game | undefined {
  return allGames.find((g) => g.id === id);
}

export function getAllPublishers(): string[] {
  return [...new Set(allGames.map((g) => g.publisher))].sort();
}

export function getAllGenres(): string[] {
  return [...new Set(allGames.flatMap((g) => g.genre))].sort();
}
