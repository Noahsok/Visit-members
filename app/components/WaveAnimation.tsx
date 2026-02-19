"use client";

import { useState, useEffect } from "react";

interface WaveAnimationProps {
  barCount?: number;
  height?: number;
  color?: string;
}

export default function WaveAnimation({
  barCount = 40,
  height = 28,
  color = "#1a1a1a",
}: WaveAnimationProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => f + 1), 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height, display: "flex", alignItems: "flex-end", gap: 2 }}>
      {Array.from({ length: barCount }, (_, i) => {
        const v =
          15 +
          Math.sin((i + frame) * 0.4) * 25 +
          Math.cos((i + frame) * 0.25) * 20 +
          Math.sin((i * 2 + frame) * 0.6) * 10;
        return (
          <div
            key={i}
            className="wave-bar"
            style={{
              flex: 1,
              height: `${Math.max(8, Math.min(100, v))}%`,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}
