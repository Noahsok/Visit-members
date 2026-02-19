"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // ISO string
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hrs}h`);
  parts.push(`${String(mins).padStart(2, "0")}m`);
  parts.push(`${String(secs).padStart(2, "0")}s`);

  return (
    <div>
      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 13,
          fontWeight: 500,
          color: "inherit",
          opacity: 0.5,
        }}
      >
        Opens in
      </div>
      <div
        style={{
          fontFamily: "system-ui",
          fontSize: 13,
          fontWeight: 500,
          marginTop: 4,
          letterSpacing: "0.05em",
        }}
      >
        {parts.join(" ")}
      </div>
    </div>
  );
}
