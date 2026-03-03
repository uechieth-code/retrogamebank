"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
  link?: string;
}

interface LeaderboardProps {
  gameId: "runner" | "shooter" | "puyo" | "flappy" | "breakout" | "maze" | "survivors";
}

export default function Leaderboard({ gameId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Try Firebase first
        try {
          const { isFirebaseConfigured, getDatabase } = await import("@/lib/firebase");
          if (isFirebaseConfigured()) {
            const db = await getDatabase();
            if (db) {
              try {
                // @ts-ignore
                const { ref, get } = await import("firebase/database");
                const snapshot = await get(ref(db, `leaderboards/${gameId}`));
                
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  const scores = Object.entries(data)
                    .map(([_, entry]: [string, any]) => entry)
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 30)
                    .map((entry: any, idx: number) => ({
                      rank: idx + 1,
                      name: entry.name,
                      score: entry.score,
                      date: entry.date,
                      link: entry.link,
                    }));
                  
                  setEntries(scores);
                  return;
                }
              } catch (firebaseError) {
              }
            }
          }
        } catch (firebaseImportError) {
        }
        
        // Fallback to localStorage
        const localKey = `leaderboard_${gameId}`;
        const stored = localStorage.getItem(localKey);
        if (stored) {
          const scores = JSON.parse(stored)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 30)
            .map((entry: any, idx: number) => ({
              rank: idx + 1,
              name: entry.name,
              score: entry.score,
              date: entry.date,
              link: entry.link,
            }));
          
          setEntries(scores);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setError("ランキング読み込みエラー");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [gameId]);

  if (loading) {
    return (
      <div style={{
        fontFamily: "var(--font-family-pixel)",
        color: "var(--color-retro-text-dim)",
        fontSize: "14px",
        padding: "20px",
        textAlign: "center",
      }}>
        ランキング読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: "var(--font-family-pixel)",
        color: "var(--color-retro-red)",
        fontSize: "14px",
        padding: "20px",
        textAlign: "center",
      }}>
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{
        fontFamily: "var(--font-family-pixel)",
        color: "var(--color-retro-text-dim)",
        fontSize: "14px",
        padding: "20px",
        textAlign: "center",
      }}>
        ランキングデータがありません
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "var(--font-family-pixel)",
      width: "100%",
      overflowX: "auto",
      marginTop: "20px",
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px",
        color: "var(--color-retro-text)",
      }}>
        <thead>
          <tr style={{
            borderBottom: "2px solid var(--color-retro-accent)",
            color: "var(--color-retro-accent)",
          }}>
            <th style={{ padding: "8px", textAlign: "left", minWidth: "40px" }}>順位</th>
            <th style={{ padding: "8px", textAlign: "left", minWidth: "100px" }}>名前</th>
            <th style={{ padding: "8px", textAlign: "right", minWidth: "80px" }}>スコア</th>
            <th style={{ padding: "8px", textAlign: "left", minWidth: "100px" }}>日時</th>
            <th style={{ padding: "8px", textAlign: "center", minWidth: "60px" }}>リンク</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              style={{
                borderBottom: "1px solid var(--color-retro-border)",
                backgroundColor: entry.rank <= 3 ? "rgba(0, 212, 255, 0.05)" : "transparent",
              }}
            >
              <td style={{ padding: "8px", color: getRankColor(entry.rank) }}>
                #{entry.rank}
              </td>
              <td style={{ padding: "8px" }}>{entry.name}</td>
              <td style={{ padding: "8px", textAlign: "right", color: "var(--color-retro-green)" }}>
                {entry.score.toLocaleString()}
              </td>
              <td style={{ padding: "8px", color: "var(--color-retro-text-dim)" }}>
                {entry.date}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {entry.link ? (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--color-retro-accent2)",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getRankColor(rank: number): string {
  if (rank === 1) return "var(--color-retro-yellow)";
  if (rank === 2) return "var(--color-retro-accent2)";
  if (rank === 3) return "var(--color-retro-green)";
  return "var(--color-retro-text)";
}
