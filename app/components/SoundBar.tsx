"use client";

import WaveAnimation from "./WaveAnimation";

interface SoundBarProps {
  djName: string;
  genre?: string | null;
  dark?: boolean;
}

export default function SoundBar({ djName, genre, dark = false }: SoundBarProps) {
  const bg = dark ? "rgba(244,242,236,0.05)" : "#1a1a1a";
  const fg = dark ? "#f4f2ec" : "#f4f2ec";
  const waveColor = dark ? "#f4f2ec" : "#f4f2ec";

  return (
    <div
      style={{
        background: bg,
        color: fg,
        padding: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ width: 80 }}>
        <WaveAnimation color={waveColor} />
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 900,
          }}
        >
          {djName}
        </div>
        {genre && (
          <div
            style={{
              fontFamily: "system-ui",
              fontSize: 13,
              color: "rgba(244,242,236,0.5)",
              marginTop: 4,
            }}
          >
            {genre}
          </div>
        )}
      </div>
    </div>
  );
}
