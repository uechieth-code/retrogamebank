"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { PriceHistory } from "@/types";

interface PriceChartProps {
  priceHistory: PriceHistory[];
  originalPrice: number | null;
}

type Period = "3m" | "6m" | "1y" | "all";

export default function PriceChart({
  priceHistory,
  originalPrice,
}: PriceChartProps) {
  const [period, setPeriod] = useState<Period>("1y");

  const chartData = useMemo(() => {
    const now = new Date("2026-02-28");
    let cutoff: Date;

    switch (period) {
      case "3m":
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case "6m":
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case "1y":
        cutoff = new Date(now);
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      default:
        cutoff = new Date("2000-01-01");
    }

    // 日付でグループ化
    const dateMap = new Map<
      string,
      { date: string; newPrice?: number; usedPrice?: number }
    >();

    priceHistory
      .filter((p) => new Date(p.fetched_at) >= cutoff)
      .forEach((p) => {
        const key = p.fetched_at;
        if (!dateMap.has(key)) {
          dateMap.set(key, { date: key });
        }
        const entry = dateMap.get(key)!;
        if (p.condition === "new") {
          entry.newPrice = p.price;
        } else {
          entry.usedPrice = p.price;
        }
      });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [priceHistory, period]);

  const formatYAxis = (value: number) => {
    if (value >= 10000) return `${(value / 10000).toFixed(0)}万`;
    return `¥${value.toLocaleString()}`;
  };

  const formatTooltipValue = (value: number) => {
    return `¥${value.toLocaleString()}`;
  };

  if (chartData.length === 0) {
    return (
      <p className="text-[var(--color-retro-text-dim)] text-center py-8">
        選択期間のデータがありません
      </p>
    );
  }

  return (
    <div>
      {/* 期間切替ボタン */}
      <div className="flex gap-2 mb-4">
        {(["3m", "6m", "1y", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              period === p
                ? "bg-[var(--color-retro-accent)] text-[var(--color-retro-bg)] border-[var(--color-retro-accent)]"
                : "border-[var(--color-retro-border)] text-[var(--color-retro-text-dim)] hover:border-[var(--color-retro-accent)]"
            }`}
          >
            {p === "3m"
              ? "3ヶ月"
              : p === "6m"
              ? "6ヶ月"
              : p === "1y"
              ? "1年"
              : "全期間"}
          </button>
        ))}
      </div>

      {/* グラフ */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="date"
            stroke="#8888a0"
            tick={{ fontSize: 11 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            stroke="#8888a0"
            tick={{ fontSize: 11 }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#141420",
              border: "1px solid #2a2a3a",
              borderRadius: "8px",
              color: "#e0e0e8",
            }}
            formatter={(value?: number, name?: string) => [
              formatTooltipValue(value ?? 0),
              name === "newPrice" ? "新品" : "中古",
            ]}
            labelFormatter={(label) => {
              const d = new Date(label);
              return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <Legend
            formatter={(value) =>
              value === "newPrice" ? "新品" : "中古"
            }
          />
          {originalPrice && (
            <ReferenceLine
              y={originalPrice}
              stroke="#ffd700"
              strokeDasharray="5 5"
              label={{
                value: `定価 ¥${originalPrice.toLocaleString()}`,
                fill: "#ffd700",
                fontSize: 11,
                position: "right",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="newPrice"
            stroke="#4da6ff"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="newPrice"
          />
          <Line
            type="monotone"
            dataKey="usedPrice"
            stroke="#ff6b35"
            strokeWidth={2}
            dot={false}
            connectNulls
            name="usedPrice"
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-[var(--color-retro-text-dim)] mt-2 text-center">
        ※グラフはサンプルデータです。Phase 2でAPI連携による実データに切り替わります。
      </p>
    </div>
  );
}
