"use client";

import { useState, useEffect } from "react";
import {
  isFavorite,
  addFavorite,
  removeFavorite,
  isInCompare,
  addToCompare,
  removeFromCompare,
  addAlert,
  getAlerts,
  getReviews,
  addReview,
  deleteReview,
  type UserReview,
} from "@/lib/storage";
import { formatPrice } from "@/lib/utils";

// --- お気に入りボタン ---
export function FavoriteButton({ gameId }: { gameId: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(gameId));
  }, [gameId]);

  const toggle = () => {
    if (fav) {
      removeFavorite(gameId);
    } else {
      addFavorite(gameId);
    }
    setFav(!fav);
  };

  return (
    <button
      onClick={toggle}
      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
        fav
          ? "bg-[var(--color-retro-yellow)] text-[var(--color-retro-bg)]"
          : "border border-[var(--color-retro-yellow)] text-[var(--color-retro-yellow)] hover:bg-[var(--color-retro-yellow)] hover:text-[var(--color-retro-bg)]"
      }`}
    >
      {fav ? "★ お気に入り登録済み" : "☆ お気に入りに追加"}
    </button>
  );
}

// --- 比較ボタン ---
export function CompareButton({ gameId }: { gameId: string }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(isInCompare(gameId));
  }, [gameId]);

  const toggle = () => {
    if (inCompare) {
      removeFromCompare(gameId);
      setInCompare(false);
    } else {
      const success = addToCompare(gameId);
      if (success) {
        setInCompare(true);
      } else {
        alert("比較リストは最大3つまでです");
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
        inCompare
          ? "bg-[var(--color-retro-purple)] text-white"
          : "border border-[var(--color-retro-purple)] text-[var(--color-retro-purple)] hover:bg-[var(--color-retro-purple)] hover:text-white"
      }`}
    >
      {inCompare ? "比較リストに追加済み" : "比較リストに追加"}
    </button>
  );
}

// --- 価格アラート設定 ---
export function PriceAlertForm({ gameId }: { gameId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    const price = parseInt(targetPrice);
    if (isNaN(price) || price <= 0) return;
    addAlert(gameId, price, condition);
    setSuccess(true);
    setShowForm(false);
    setTargetPrice("");
    setTimeout(() => setSuccess(false), 3000);
  };

  const existingAlerts = getAlerts().filter((a) => a.game_id === gameId);

  return (
    <div>
      {existingAlerts.length > 0 && (
        <div className="mb-2">
          {existingAlerts.map((a) => (
            <p key={a.id} className="text-xs text-[var(--color-retro-text-dim)]">
              {a.condition === "new" ? "新品" : "中古"} {formatPrice(a.target_price)}以下で通知
              <span className={a.is_active ? "text-[var(--color-retro-green)]" : "text-[var(--color-retro-text-dim)]"}>
                {a.is_active ? " (有効)" : " (停止中)"}
              </span>
            </p>
          ))}
        </div>
      )}

      {success && (
        <p className="text-xs text-[var(--color-retro-green)] mb-2">
          アラートを設定しました
        </p>
      )}

      {showForm ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              className="retro-select text-xs"
              value={condition}
              onChange={(e) => setCondition(e.target.value as "new" | "used")}
            >
              <option value="used">中古</option>
              <option value="new">新品</option>
            </select>
            <input
              type="number"
              className="search-input text-xs flex-grow"
              placeholder="目標価格（円）"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-3 py-1 rounded bg-[var(--color-retro-green)] text-[var(--color-retro-bg)] text-xs font-bold"
            >
              設定
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 rounded border border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] text-xs"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 rounded-lg text-sm border border-[var(--color-retro-green)] text-[var(--color-retro-green)] hover:bg-[var(--color-retro-green)] hover:text-[var(--color-retro-bg)] transition-colors"
        >
          価格アラートを設定
        </button>
      )}
    </div>
  );
}

// --- レビューセクション ---
export function ReviewSection({ gameId }: { gameId: string }) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    setReviews(getReviews(gameId));
  }, [gameId]);

  const handleSubmit = () => {
    if (!comment.trim()) return;
    addReview(gameId, rating, comment, nickname);
    setReviews(getReviews(gameId));
    setShowForm(false);
    setComment("");
    setRating(5);
  };

  const handleDelete = (reviewId: string) => {
    deleteReview(reviewId);
    setReviews(getReviews(gameId));
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  return (
    <div className="bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--color-retro-accent)]">
          ユーザーレビュー
        </h2>
        <div className="text-sm text-[var(--color-retro-text-dim)]">
          平均: <span className="text-[var(--color-retro-yellow)] font-bold">{avgRating}</span>
          {reviews.length > 0 && ` (${reviews.length}件)`}
        </div>
      </div>

      {/* レビュー投稿フォーム */}
      {showForm ? (
        <div className="mb-6 p-4 rounded-lg border border-[var(--color-retro-border)]">
          <div className="mb-3">
            <label className="block text-xs text-[var(--color-retro-text-dim)] mb-1">
              評価
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-xl ${
                    n <= rating
                      ? "text-[var(--color-retro-yellow)]"
                      : "text-[var(--color-retro-text-dim)]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-[var(--color-retro-text-dim)] mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              className="search-input text-sm"
              placeholder="匿名"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-[var(--color-retro-text-dim)] mb-1">
              コメント
            </label>
            <textarea
              className="search-input text-sm w-full"
              rows={3}
              placeholder="このゲームの感想を書いてください..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] text-sm font-bold"
            >
              投稿
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 rounded-lg bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] text-sm font-bold"
        >
          レビューを書く
        </button>
      )}

      {/* レビュー一覧 */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-3 rounded-lg border border-[var(--color-retro-border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-retro-yellow)] text-sm">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="text-sm font-medium">{review.nickname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-retro-text-dim)]">
                    {new Date(review.created_at).toLocaleDateString("ja-JP")}
                  </span>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-[var(--color-retro-red)] hover:underline"
                  >
                    削除
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--color-retro-text)]">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-retro-text-dim)] text-center py-4">
          まだレビューはありません。最初のレビューを書いてみませんか？
        </p>
      )}
    </div>
  );
}
