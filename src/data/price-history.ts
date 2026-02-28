import { PriceHistory } from "@/types";

function generatePriceHistory(
  gameId: string,
  baseNewPrice: number | null,
  baseUsedPrice: number | null,
  months: number = 12
): PriceHistory[] {
  const history: PriceHistory[] = [];
  const now = new Date("2026-02-28");
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().split("T")[0];
    if (baseUsedPrice !== null) {
      const variation = 1 + (Math.sin(i * 0.5) * 0.15) + ((months - i) * 0.01);
      history.push({ id: `ph-${gameId}-used-${i}`, game_id: gameId, source: "surugaya", condition: "used", price: Math.round(baseUsedPrice * variation), fetched_at: dateStr });
    }
    if (baseNewPrice !== null) {
      const variation = 1 + (Math.cos(i * 0.3) * 0.1) + ((months - i) * 0.008);
      history.push({ id: `ph-${gameId}-new-${i}`, game_id: gameId, source: "amazon", condition: "new", price: Math.round(baseNewPrice * variation), fetched_at: dateStr });
    }
  }
  return history;
}

export const priceHistoryData: PriceHistory[] = [
  ...generatePriceHistory("fc-001", null, 300),
  ...generatePriceHistory("fc-016", 150000, 55000),
  ...generatePriceHistory("fc-017", 200000, 80000),
  ...generatePriceHistory("sfc-001", 25000, 500),
  ...generatePriceHistory("sfc-002", 45000, 3000),
  ...generatePriceHistory("sfc-017", 500000, 150000),
  ...generatePriceHistory("gb-001", 50000, 1500),
  ...generatePriceHistory("gb-019", 80000, 25000),
];

export function getPriceHistory(gameId: string): PriceHistory[] {
  return priceHistoryData.filter((p) => p.game_id === gameId);
}
