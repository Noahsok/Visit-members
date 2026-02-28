"use client";

import { useState } from "react";
import WaveAnimation from "./WaveAnimation";
import type { NowPlaying } from "../types";

interface SoundBarProps {
  djName: string;
  genre?: string | null;
  dark?: boolean;
  nowPlaying?: NowPlaying | null;
}

export default function SoundBar({ djName, genre, dark = false, nowPlaying }: SoundBarProps) {
  const [expanded, setExpanded] = useState(false);
  const bg = dark ? "rgba(244,242,236,0.05)" : "#1a1a1a";
  const fg = dark ? "#f4f2ec" : "#f4f2ec";
  const waveColor = dark ? "#f4f2ec" : "#f4f2ec";

  const hasSpotify = nowPlaying && nowPlaying.isPlaying;

  return (
    <div
      onClick={hasSpotify ? () => setExpanded(!expanded) : undefined}
      style={{
        background: bg,
        color: fg,
        cursor: hasSpotify ? "pointer" : "default",
        overflow: "hidden",
      }}
    >
      {/* Compact bar — always visible */}
      <div
        style={{
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Wave animation — always shown */}
        <div style={{ width: 60, flexShrink: 0 }}>
          <WaveAnimation color={waveColor} height={32} barCount={24} />
        </div>

        {hasSpotify ? (
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
        ) : (
          <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
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
        )}
      </div>

      {/* Expanded section — current + previous track */}
      {hasSpotify && (
        <div
          style={{
            maxHeight: expanded ? 200 : 0,
            opacity: expanded ? 1 : 0,
            transition: "max-height 0.3s ease, opacity 0.25s ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0 20px 20px",
              borderTop: "1px solid rgba(244,242,236,0.08)",
            }}
          >
            {/* Now playing */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 16 }}>
              {nowPlaying.albumArt && (
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
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(244,242,236,0.4)",
                    marginBottom: 4,
                  }}
                >
                  Now playing
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 15,
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
                    fontSize: 12,
                    color: "rgba(244,242,236,0.5)",
                    marginTop: 1,
                  }}
                >
                  {nowPlaying.artistName}
                </div>
              </div>
            </div>

            {/* Previous track */}
            {nowPlaying.previousTrack && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  paddingTop: 14,
                  opacity: 0.5,
                }}
              >
                {nowPlaying.previousTrack.albumArt && (
                  <img
                    src={nowPlaying.previousTrack.albumArt}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 4,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(244,242,236,0.4)",
                      marginBottom: 4,
                    }}
                  >
                    Previously
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {nowPlaying.previousTrack.trackName}
                  </div>
                  <div
                    style={{
                      fontFamily: "system-ui",
                      fontSize: 12,
                      color: "rgba(244,242,236,0.5)",
                      marginTop: 1,
                    }}
                  >
                    {nowPlaying.previousTrack.artistName}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
