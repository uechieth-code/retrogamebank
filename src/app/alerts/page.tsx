"use client";

import { useState, useEffect } from "react";
import { getGameById } from "@/data/games";
import { getConsole } from "@/data/consoles";
import { formatPrice } from "@/lib/utils";
import { getAlerts, removeAlert, toggleAlert, type PriceAlert } from "@/lib/storage";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  const handleRemove = (alertId: string) => {
    removeAlert(alertId);
    setAlerts(getAlerts());
  };

  const handleToggle = (alertId: string) => {
    toggleAlert(alertId);
    setAlerts(getAlerts());
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1
          className="text-3xl md:text-4xl font-bold retro-glow mb-2"
          style={{ fontFamily: "var(--font-family-pixel)" }}
        >
          価格アラート
        </h1>
        <p className="text-[var(--color-retro-text-dim)]">
          設定した価格以下になったら通知
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const game = getGameById(alert.game_id);
            if (!game) return null;
            const consoleInfo = getConsole(game.console_id);
            const currentPrice =
              alert.condition === "new"
                ? game.current_new_price
                : game.current_used_price;

            return (
              <div
                key={alert.id}
                className={`game-card rounded-xl bg-[var(--color-retro-card)] p-4 ${
                  !alert.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="tag tag-console text-xs">
                        {consoleInfo?.short_name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          alert.condition === "new"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-orange-900/30 text-orange-300"
                        }`}
                      >
                        {alert.condition === "new" ? "新品" : "中古"}
                      </span>
                    </div>
                    <a
                      href={`/games/${game.console_id}/${game.slug}`}
                      className="font-medium text-sm hover:text-[var(--color-retro-accent)]"
                    >
                      {game.title}
                    </a>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-[var(--color-retro-text-dim)]">
                        現在価格：
                        <span className="text-[var(--color-retro-text)]">
                          {formatPrice(currentPrice)}
                        </span>
                      </span>
                      <span className="text-[var(--color-retro-text-dim)]">
                        目標価格：
                        <span className="text-[var(--color-retro-yellow)] font-bold">
                          {formatPrice(alert.target_price)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(alert.id)}
                      className={`px-3 py-1 rounded text-xs border transition-colors ${
                        alert.is_active
                          ? "border-[var(--color-retro-green)] text-[var(--color-retro-green)]"
                          : "border-[var(--color-retro-text-dim)] text-[var(--color-retro-text-dim)]"
                      }`}
                    >
                      {alert.is_active ? "有効" : "停止中"}
                    </button>
                    <button
                      onClick={() => handleRemove(alert.id)}
                      className="px-3 py-1 rounded border border-[var(--color-retro-red)] text-[var(--color-retro-red)] text-xs hover:bg-[var(--color-retro-red)] hover:text-white transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl">
          <p className="text-lg text-[var(--color-retro-text-dim)] mb-2">
            設定されたアラートはありません
          </p>
          <p className="text-sm text-[var(--color-retro-text-dim)]">
            各ソフトの詳細ページから価格アラートを設定できます
          </p>
        </div>
      )}

      <div className="mt-8 bg-[var(--color-retro-card)] border border-[var(--color-retro-border)] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[var(--color-retro-accent)] mb-3">
          価格アラートについて
        </h2>
        <p className="text-sm text-[var(--color-retro-text-dim)] leading-relaxed">
          価格アラート機能は、設定した価格以下で商品が見つかった場合に通知する機能です。
          現在はブラウザのローカルストレージにデータを保存しています。
          ユーザー登録機能の実装後は、メール通知やプッシュ通知に対応予定です。
        </p>
      </div>
    </div>
  );
}
