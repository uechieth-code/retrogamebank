import { Console } from "@/types";

export const consoles: Console[] = [
  { id: "fc", name: "ファミリーコンピュータ", short_name: "FC", manufacturer: "任天堂", type: "home", release_year: 1983, sort_order: 1 },
  { id: "sfc", name: "スーパーファミコン", short_name: "SFC", manufacturer: "任天堂", type: "home", release_year: 1990, sort_order: 2 },
  { id: "gb", name: "ゲームボーイ", short_name: "GB", manufacturer: "任天堂", type: "portable", release_year: 1989, sort_order: 3 },
  { id: "n64", name: "NINTENDO 64", short_name: "N64", manufacturer: "任天堂", type: "home", release_year: 1996, sort_order: 4 },
  { id: "gc", name: "ゲームキューブ", short_name: "GC", manufacturer: "任天堂", type: "home", release_year: 2001, sort_order: 5 },
  { id: "wii", name: "Wii", short_name: "Wii", manufacturer: "任天堂", type: "home", release_year: 2006, sort_order: 6 },
  { id: "wiiu", name: "Wii U", short_name: "Wii U", manufacturer: "任天堂", type: "home", release_year: 2012, sort_order: 7 },
  { id: "gba", name: "ゲームボーイアドバンス", short_name: "GBA", manufacturer: "任天堂", type: "portable", release_year: 2001, sort_order: 8 },
  { id: "nds", name: "ニンテンドーDS", short_name: "NDS", manufacturer: "任天堂", type: "portable", release_year: 2004, sort_order: 9 },
  { id: "3ds", name: "ニンテンドー3DS", short_name: "3DS", manufacturer: "任天堂", type: "portable", release_year: 2011, sort_order: 10 },
  { id: "md", name: "メガドライブ", short_name: "MD", manufacturer: "SEGA", type: "home", release_year: 1988, sort_order: 11 },
  { id: "ss", name: "セガサターン", short_name: "SS", manufacturer: "SEGA", type: "home", release_year: 1994, sort_order: 12 },
  { id: "dc", name: "ドリームキャスト", short_name: "DC", manufacturer: "SEGA", type: "home", release_year: 1998, sort_order: 13 },
  { id: "mk3", name: "セガ・マークIII", short_name: "MK3", manufacturer: "SEGA", type: "home", release_year: 1985, sort_order: 14 },
  { id: "gg", name: "ゲームギア", short_name: "GG", manufacturer: "SEGA", type: "portable", release_year: 1990, sort_order: 15 },
  { id: "ps1", name: "PlayStation", short_name: "PS1", manufacturer: "SONY", type: "home", release_year: 1994, sort_order: 16 },
  { id: "ps2", name: "PlayStation 2", short_name: "PS2", manufacturer: "SONY", type: "home", release_year: 2000, sort_order: 17 },
  { id: "ps3", name: "PlayStation 3", short_name: "PS3", manufacturer: "SONY", type: "home", release_year: 2006, sort_order: 18 },
  { id: "psp", name: "PlayStation Portable", short_name: "PSP", manufacturer: "SONY", type: "portable", release_year: 2004, sort_order: 19 },
  { id: "vita", name: "PlayStation Vita", short_name: "Vita", manufacturer: "SONY", type: "portable", release_year: 2011, sort_order: 20 },
  { id: "pce", name: "PCエンジン", short_name: "PCE", manufacturer: "NEC", type: "home", release_year: 1987, sort_order: 21 },
  { id: "pcegt", name: "PCエンジンGT", short_name: "PCE GT", manufacturer: "NEC", type: "portable", release_year: 1990, sort_order: 22 },
  { id: "neogeo", name: "ネオジオ", short_name: "NEOGEO", manufacturer: "SNK", type: "home", release_year: 1990, sort_order: 23 },
  { id: "ngp", name: "ネオジオポケット", short_name: "NGP", manufacturer: "SNK", type: "portable", release_year: 1998, sort_order: 24 },
  { id: "xbox", name: "Xbox", short_name: "Xbox", manufacturer: "Microsoft", type: "home", release_year: 2001, sort_order: 25 },
  { id: "x360", name: "Xbox 360", short_name: "X360", manufacturer: "Microsoft", type: "home", release_year: 2005, sort_order: 26 },
];

export const mvpConsoleIds = ["fc", "sfc", "gb", "gba", "nds", "3ds", "ps1", "ps2", "md", "ss"];

export function getConsole(id: string): Console | undefined {
  return consoles.find((c) => c.id === id);
}

export function getMvpConsoles(): Console[] {
  return consoles.filter((c) => mvpConsoleIds.includes(c.id));
}
