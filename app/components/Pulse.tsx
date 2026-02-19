"use client";

import { useState, useEffect } from "react";

interface PulseProps {
  color?: string;
}

export default function Pulse({ color = "#1a1a1a" }: PulseProps) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setOn((o) => !o), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        opacity: on ? 1 : 0.1,
        transition: "opacity 0.4s",
        display: "inline-block",
      }}
    />
  );
}
