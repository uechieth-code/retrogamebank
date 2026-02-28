"use client";

/**
 * Phase 3: ローカルストレージベースのユーザーデータ管理
 * Phase 3でバックエンド実装後、APIに切り替え可能な設計
 */

// --- お気に入り（ウォッチリスト）---
const FAVORITES_KEY = "rgb_favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addFavorite(gameId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(gameId: string): void {
  const favorites = getFavorites().filter((id) => id !== gameId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

// --- 価格アラート ---
const ALERTS_KEY = "rgb_alerts";

export interface PriceAlert {
  id: string;
  game_id: string;
  target_price: number;
  condition: "new" | "used";
  is_active: boolean;
  created_at: string;
  notified_at: string | null;
}

export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addAlert(
  gameId: string,
  targetPrice: number,
  condition: "new" | "used"
): PriceAlert {
  const alerts = getAlerts();
  const alert: PriceAlert = {
    id: `alert-${Date.now()}`,
    game_id: gameId,
    target_price: targetPrice,
    condition,
    is_active: true,
    created_at: new Date().toISOString(),
    notified_at: null,
  };
  alerts.push(alert);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  return alert;
}

export function removeAlert(alertId: string): void {
  const alerts = getAlerts().filter((a) => a.id !== alertId);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

export function toggleAlert(alertId: string): void {
  const alerts = getAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.is_active = !alert.is_active;
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }
}

// --- ユーザーレビュー ---
const REVIEWS_KEY = "rgb_reviews";

export interface UserReview {
  id: string;
  game_id: string;
  rating: number; // 1-5
  comment: string;
  nickname: string;
  created_at: string;
}

export function getReviews(gameId?: string): UserReview[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    const reviews: UserReview[] = data ? JSON.parse(data) : [];
    if (gameId) return reviews.filter((r) => r.game_id === gameId);
    return reviews;
  } catch {
    return [];
  }
}

export function addReview(
  gameId: string,
  rating: number,
  comment: string,
  nickname: string
): UserReview {
  const reviews = getReviews();
  const review: UserReview = {
    id: `review-${Date.now()}`,
    game_id: gameId,
    rating: Math.min(5, Math.max(1, rating)),
    comment,
    nickname: nickname || "匿名",
    created_at: new Date().toISOString(),
  };
  reviews.push(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return review;
}

export function deleteReview(reviewId: string): void {
  const reviews = getReviews().filter((r) => r.id !== reviewId);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// --- 比較リスト ---
const COMPARE_KEY = "rgb_compare";
const MAX_COMPARE = 3;

export function getCompareList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToCompare(gameId: string): boolean {
  const list = getCompareList();
  if (list.length >= MAX_COMPARE) return false;
  if (list.includes(gameId)) return true;
  list.push(gameId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  return true;
}

export function removeFromCompare(gameId: string): void {
  const list = getCompareList().filter((id) => id !== gameId);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
}

export function clearCompare(): void {
  localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
}

export function isInCompare(gameId: string): boolean {
  return getCompareList().includes(gameId);
}
