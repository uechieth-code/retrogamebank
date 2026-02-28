export interface Console {
  id: string;
  name: string;
  short_name: string;
  manufacturer: string;
  type: "home" | "portable";
  release_year: number;
  sort_order: number;
}

export interface Game {
  id: string;
  title: string;
  console_id: string;
  publisher: string;
  developer: string;
  release_date: string;
  original_price: number | null;
  genre: string[];
  description: string;
  player_count: string;
  current_new_price: number | null;
  current_used_price: number | null;
  total_sales: number | null;
  premium_rank: number;
  slug: string;
}

export interface PriceHistory {
  id: string;
  game_id: string;
  source: string;
  condition: "new" | "used";
  price: number;
  fetched_at: string;
}

export interface ShopLink {
  shop_name: string;
  url: string;
  color: string;
  icon?: string;
}

export type SortKey =
  | "title"
  | "release_date"
  | "current_new_price"
  | "current_used_price"
  | "total_sales"
  | "premium_rank";

export type SortOrder = "asc" | "desc";

export interface FilterState {
  search: string;
  consoles: string[];
  publisher: string;
  genres: string[];
  priceMin: number | null;
  priceMax: number | null;
  premiumRank: number | null;
  sortKey: SortKey;
  sortOrder: SortOrder;
  page: number;
}
