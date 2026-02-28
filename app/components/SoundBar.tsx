"use client";

import WaveAnimation from "./WaveAnimation";
import type { NowPlaying } from "../types";

interface SoundBarProps {
  djName: string;
  genre?: string | null;
  dark?: boolean;
  nowPlaying?: NowPlaying | null;
}

export default function SoundBar({ djName, genre, dark = false, nowPlaying }: SoundBarProps) {
  const bg = dark ? "rgba(244,242,236,0.05)" : "#1a1a1a";
  const fg = dark ? "#f4f2ec" : "#f4f2ec";
  const waveColor = dark ? "#f4f2ec" : "#f4f2ec";

  const hasSpotify = nowPlaying && nowPlaying.isPlaying;

  return (
    <div
      style={{
        background: bg,
        color: fg,
        padding: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      {hasSpotify ? (
        <>
          {/* Album art */}
          {nowPlaying.albumArt ? (
            <img
              src={nowPlaying.albumArt}
              alt=""
              style={{
                width: 48,
                height: 48,
                borderRadius: 4,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{ width: 48, flexShrink: 0 }}>
              <WaveAnimation color={waveColor} height={48} barCount={20} />
            </div>
          )}
          {/* Track info */}
          <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {nowPlaying.trackName}
            </div>
            <div
              style={{
                fontFamily: "system-ui",
                fontSize: 13,
                color: "rgba(244,242,236,0.5)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {nowPlaying.artistName}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Fallback: manual DJ/genre */}
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
        </>
      )}
    </div>
  );
}
